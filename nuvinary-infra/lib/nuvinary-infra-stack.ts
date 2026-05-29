import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export const domainName = 'raphael-janka.com';

interface NuvinaryStackProps extends cdk.StackProps {
  certificate: acm.ICertificate;
  subDomainName: string;
}

export class NuvinaryCertificateStack extends cdk.Stack {
  public readonly certificate: acm.ICertificate;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const zone = route53.HostedZone.fromLookup(this, 'CertificateHostedZone', {
      domainName: domainName,
    });

    this.certificate = new acm.Certificate(this, 'FrontendCertificate', {
      domainName: `*.${domainName}`,
      validation: acm.CertificateValidation.fromDns(zone),
    });
  }
}

export class NuvinaryInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: NuvinaryStackProps) {
    super(scope, id, props);

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
      sources: [s3deploy.Source.asset('../nuvinary-frontend/dist')],
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

    new cdk.CfnOutput(this, 'AngularFrontendUrl', {
      value: `https://${props.subDomainName}`,
      description: 'Official App-URL',
    });
  }
}
