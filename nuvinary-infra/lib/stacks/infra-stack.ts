import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { WebsiteHostingConstruct } from '../constructs/website-hosting';
import { StorageConstruct } from '../constructs/storage';
import { NuvinaryStackProps, StorageLimits } from '../types/interfaces';
import { createAlarmTopic } from '../utils/monitoring';
import { getS3StorageLimit } from '../utils/config-helper';

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

    new StorageConstruct(this, 'NuvinaryStorage', {
      subDomainName: props.subDomainName,
      isProd: props.isProd,
      alarmTopic: this.alarmTopic,
      s3StorageLimitBytes: this.storageLimit,
    });
  }
}
