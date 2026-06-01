import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as iam from 'aws-cdk-lib/aws-iam';
import { WebsiteHostingConstruct } from '../constructs/website-hosting';
import { StorageConstruct } from '../constructs/storage';
import { NuvinaryStackProps, StorageLimits } from '../types/interfaces';
import { createAlarmTopic } from '../utils/monitoring';
import { getS3StorageLimit } from '../utils/config-helper';
import { AuthConstruct } from '../constructs/auth';
import { NuvinaryLambdaFactory } from '../constructs/lambda-factory';

export class NuvinaryInfraStack extends cdk.Stack {
  readonly alarmTopic: sns.ITopic | undefined;
  readonly storageLimit: number;

  constructor(scope: Construct, id: string, props: NuvinaryStackProps) {
    super(scope, id, props);

    this.alarmTopic = props.isProd ? createAlarmTopic(this) : undefined;
    this.storageLimit = getS3StorageLimit(this, props.isProd);

    new WebsiteHostingConstruct(this, 'WebsiteHosting', {
      certificate: props.certificate,
      subDomainName: props.subDomainName,
      isProd: props.isProd,
      alarmTopic: this.alarmTopic,
    });

    const storage = new StorageConstruct(this, 'NuvinaryStorage', {
      subDomainName: props.subDomainName,
      isProd: props.isProd,
      alarmTopic: this.alarmTopic,
      s3StorageLimitBytes: this.storageLimit,
    });

    const lambdaFactory = new NuvinaryLambdaFactory(this, 'LambdaFactory', {
      table: storage.table,
    });

    const postConfirmAuthFn = lambdaFactory.createFunction('PostConfirm', {
      entry: '../nuvinary-backend/src/triggers/post-confirmation.ts',
      handler: 'handler',
    });

    postConfirmAuthFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: [
          'arn:aws:ses:eu-central-1:635256138522:identity/dev.project.notifications@gmail.com',
        ],
      }),
    );

    new AuthConstruct(this, 'Auth', {
      isProd: props.isProd,
      alarmTopic: this.alarmTopic,
      postConfirmationFn: postConfirmAuthFn,
    });
  }
}
