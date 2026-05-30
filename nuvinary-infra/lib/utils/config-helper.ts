import { Construct } from 'constructs';
import { StorageLimits } from '../types/interfaces';

export const getS3StorageLimit = (
  construct: Construct,
  isProd: boolean,
): number => {
  const config = construct.node.tryGetContext(
    's3StorageLimits',
  ) as StorageLimits;
  if (!config) throw new Error('s3StorageLimits missing in cdk.json');
  return isProd ? config.prod : config.dev;
};
