import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NuvinaryLambdaProps } from '../types/interfaces';
import { Duration } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

const LAMBDA_DEFAULTS = {
  MEMORY_SIZE: 512,
  TIMEOUT: Duration.seconds(30),
};

export interface LambdaFactoryProps {
  table: dynamodb.ITable;
}

export class NuvinaryLambdaFactory extends Construct {
  private readonly table: dynamodb.ITable;

  constructor(scope: Construct, id: string, props: LambdaFactoryProps) {
    super(scope, id);
    this.table = props.table;
  }

  createFunction(id: string, props: NuvinaryLambdaProps): lambda.Function {
    const fn = new NodejsFunction(this, id, {
      entry: props.entry,
      handler: props.handler ?? 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: props.memorySize ?? LAMBDA_DEFAULTS.MEMORY_SIZE,
      timeout: props.timeOut ?? LAMBDA_DEFAULTS.TIMEOUT,
      environment: {
        TABLE_NAME: this.table.tableName,
      },
      projectRoot: path.join(__dirname, '../../../'),
    });

    this.table.grantReadWriteData(fn);
    return fn;
  }
}
