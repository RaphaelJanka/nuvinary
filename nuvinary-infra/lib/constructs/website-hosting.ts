import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib/core';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as cw_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import { getDomainName } from '../config';

interface WebsiteHostingProps {
  certificate: acm.ICertificate;
  subDomainName: string;
  isProd: boolean;
  alarmTopic?: sns.ITopic;
}

export class WebsiteHosting extends Construct {
  constructor(scope: Construct, id: string, props: WebsiteHostingProps) {
    super(scope, id);

    const domainName = getDomainName(this);

    const zone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: domainName,
    });

    const frontendDeploymentBucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: `nuvinary-frontend-${props.subDomainName.replace(/\./g, '-')}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    const distribution = new cloudfront.Distribution(
      this,
      'NuvinaryFrontendDistribution',
      {
        domainNames: [props.subDomainName],
        certificate: props.certificate,

        defaultBehavior: {
          origin: origins.S3BucketOrigin.withOriginAccessControl(
            frontendDeploymentBucket,
          ),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        defaultRootObject: 'index.html',
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
            ttl: cdk.Duration.seconds(0),
          },
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
            ttl: cdk.Duration.seconds(0),
          },
        ],
      },
    );

    new s3deploy.BucketDeployment(this, 'DeployFrontend', {
      sources: [
        s3deploy.Source.asset(
          '../nuvinary-frontend/dist/nuvinary-frontend/browser',
        ),
      ],
      destinationBucket: frontendDeploymentBucket,
      distribution: distribution,
      distributionPaths: ['/*'],
    });

    new route53.ARecord(this, 'FrontendAliasRecord', {
      zone: zone,
      recordName: props.subDomainName.split('.')[0],
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution),
      ),
    });

    if (props.alarmTopic) {
      const errorAlarm = new cloudwatch.Alarm(this, 'CloudFront5xxAlarm', {
        metric: distribution.metric5xxErrorRate({
          period: cdk.Duration.minutes(5),
        }),
        threshold: 1,
        evaluationPeriods: 1,
        alarmDescription:
          'Alert: High rate of 5xx errors detected on CloudFront distribution. Potential availability issue.',
      });

      errorAlarm.addAlarmAction(new cw_actions.SnsAction(props.alarmTopic));
    }

    new cdk.CfnOutput(this, 'AngularFrontendUrl', {
      value: `https://${props.subDomainName}`,
      description: 'Official App-URL',
    });
  }
}
