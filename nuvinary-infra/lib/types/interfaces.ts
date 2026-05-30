import * as sns from 'aws-cdk-lib/aws-sns';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cdk from 'aws-cdk-lib/core';

export interface NuvinaryInfraBaseProps {
  readonly subDomainName?: string;
  readonly isProd: boolean;
  readonly alarmTopic?: sns.ITopic;
}

export interface NuvinaryStackProps
  extends cdk.StackProps, Omit<NuvinaryInfraBaseProps, 'alarmTopic'> {
  readonly certificate: acm.ICertificate;
}

export interface WebsiteHostingConstructProps extends NuvinaryInfraBaseProps {
  readonly certificate: acm.ICertificate;
}

export interface StorageConstructProps extends NuvinaryInfraBaseProps {
  readonly s3StorageLimitBytes: number;
}

export interface StorageLimits {
  readonly dev: number;
  readonly prod: number;
}
