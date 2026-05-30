import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib/core';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { getDomainName } from '../config';

export class NuvinaryCertificateStack extends cdk.Stack {
  public readonly certificate: acm.ICertificate;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domainName = getDomainName(this);

    const zone = route53.HostedZone.fromLookup(this, 'CertificateHostedZone', {
      domainName: domainName,
    });

    this.certificate = new acm.Certificate(this, 'FrontendCertificate', {
      domainName: `*.${domainName}`,
      validation: acm.CertificateValidation.fromDns(zone),
    });
  }
}
