import { Construct } from 'constructs';

export const getDomainName = (construct: Construct): string => {
  const domain = construct.node.tryGetContext('domainName');

  if (!domain) {
    throw new Error("Error: 'domainName' wasn't found in CDK-Context!");
  }

  return domain;
};
