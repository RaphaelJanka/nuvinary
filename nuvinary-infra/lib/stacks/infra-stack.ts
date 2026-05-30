import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { WebsiteHosting } from '../constructs/website-hosting';
import { StorageConstruct } from '../constructs/storage';

interface NuvinaryStackProps extends cdk.StackProps {
  certificate: acm.ICertificate;
  subDomainName: string;
  isProd: boolean;
}

export class NuvinaryInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: NuvinaryStackProps) {
    super(scope, id, props);

    new WebsiteHosting(this, 'WebsiteHosting', {
      certificate: props.certificate,
      subDomainName: props.subDomainName,
      isProd: props.isProd,
      alertEmail: process.env.ALERT_EMAIL,
    });

    new StorageConstruct(this, 'NuvinaryStorage', {
      subDomainName: props.subDomainName,
      isProd: props.isProd,
    });
  }
}
