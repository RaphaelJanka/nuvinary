import * as sns from 'aws-cdk-lib/aws-sns';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cdk from 'aws-cdk-lib/core';

export interface NuvinaryInfraBaseProps {
  readonly isProd: boolean;
  readonly alarmTopic?: sns.ITopic;
}

export interface NuvinaryStackProps
  extends cdk.StackProps, DomainConstructProps {
  readonly certificate: acm.ICertificate;
}

export interface DomainConstructProps extends NuvinaryInfraBaseProps {
  readonly subDomainName: string;
}

export interface AuthConstructProps extends NuvinaryInfraBaseProps {}

export interface WebsiteHostingConstructProps extends DomainConstructProps {
  readonly certificate: acm.ICertificate;
}

export interface StorageConstructProps extends DomainConstructProps {
  readonly s3StorageLimitBytes: number;
}

export interface StorageLimits {
  readonly dev: number;
  readonly prod: number;
}

export interface NuvinaryLambdaProps {
  entry: string;
  handler?: string;
  memorySize?: number;
  timeOut?: cdk.Duration;
}
