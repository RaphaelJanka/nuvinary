import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NuvinaryLambdaProps } from '../types/interfaces';
import { Duration } from 'aws-cdk-lib';

const LAMBDA_DEFAULTS = {
  MEMORY_SIZE: 512,
  TIMEOUT: Duration.seconds(30),
};

export class NuvinaryLambdaFactory extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }

  createFunction(id: string, props: NuvinaryLambdaProps): lambda.Function {
    return new lambda.Function(this, id, {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: props.handler ?? 'index.handler',
      code: lambda.Code.fromAsset(props.entry),
      memorySize: props.memorySize ?? LAMBDA_DEFAULTS.MEMORY_SIZE,
      timeout: props.timeOut ?? LAMBDA_DEFAULTS.TIMEOUT,
    });
  }
}
