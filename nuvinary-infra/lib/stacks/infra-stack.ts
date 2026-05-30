import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { WebsiteHostingConstruct } from '../constructs/website-hosting';
import { StorageConstruct } from '../constructs/storage';
import { NuvinaryStackProps, StorageLimits } from '../types/interfaces';

export class NuvinaryInfraStack extends cdk.Stack {
  readonly alarmTopic: sns.ITopic | undefined;
  readonly storageLimit: number;

  constructor(scope: Construct, id: string, props: NuvinaryStackProps) {
    super(scope, id, props);

    if (props.isProd) {
      const topic = new sns.Topic(this, 'NuvinaryAlarmTopic', {
        displayName: 'Nuvinary Alarms',
      });
      const alertEmail = process.env.ALERT_EMAIL;
      if (!alertEmail) {
        throw new Error(
          'Error: Environment variable "ALERT_EMAIL" is not set!',
        );
      }
      topic.addSubscription(new subscriptions.EmailSubscription(alertEmail));
      this.alarmTopic = topic;
    }

    const storageConfig = this.node.tryGetContext(
      's3StorageLimits',
    ) as StorageLimits;

    if (!storageConfig) {
      throw new Error(
        'Error: Context "s3StorageLimits" does not exist in cdk.json!',
      );
    }

    this.storageLimit = props.isProd ? storageConfig.prod : storageConfig.dev;

    new WebsiteHostingConstruct(this, 'WebsiteHosting', {
      certificate: props.certificate,
      subDomainName: props.subDomainName,
      isProd: props.isProd,
      alarmTopic: this.alarmTopic,
    });

    new StorageConstruct(this, 'NuvinaryStorage', {
      subDomainName: props.subDomainName,
      isProd: props.isProd,
      alarmTopic: this.alarmTopic,
      s3StorageLimitBytes: this.storageLimit,
    });
  }
}
