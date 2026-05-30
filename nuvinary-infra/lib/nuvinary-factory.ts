import * as cdk from 'aws-cdk-lib/core';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { NuvinaryInfraStack } from './stacks/infra-stack';
import { getDomainName } from './config';

export function createInfraStack(
  app: cdk.App,
  stage: 'dev' | 'prod',
  cert: acm.ICertificate,
): NuvinaryInfraStack {
  const domainName = getDomainName(app);
  const config = {
    subDomain: stage === 'prod' ? 'nuvinary' : `nuvinary-${stage}`,
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-central-1' },
  };

  return new NuvinaryInfraStack(app, `NuvinaryInfraStack-${stage}`, {
    env: config.env,
    certificate: cert,
    subDomainName: `${config.subDomain}.${domainName}`,
    crossRegionReferences: true,
    isProd: stage === 'prod',
  });
}
