#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { NuvinaryCertificateStack } from '../lib/stacks/certificate-stack';
import { createInfraStack } from '../lib/utils/stack-factory';

const app = new cdk.App();

const certStack = new NuvinaryCertificateStack(
  app,
  'NuvinaryCertificateStack',
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: 'us-east-1',
    },
    crossRegionReferences: true,
  },
);

const stage = app.node.tryGetContext('stage') || 'dev';
createInfraStack(app, stage, certStack.certificate);
