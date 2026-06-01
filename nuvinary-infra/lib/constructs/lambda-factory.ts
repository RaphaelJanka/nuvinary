import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NuvinaryLambdaProps } from '../types/interfaces';
import { Duration } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';

const LAMBDA_DEFAULTS = {
  MEMORY_SIZE: 512,
  TIMEOUT: Duration.seconds(30),
};

export interface LambdaFactoryProps {
  table: dynamodb.ITable;
}

export class NuvinaryLambdaFactory extends Construct {
  private readonly table: dynamodb.ITable;
  private static readonly SES_NOTIFICATION_ARN =
    'arn:aws:ses:eu-central-1:635256138522:identity/dev.project.notifications@gmail.com';

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

    if (props.permissions?.dynamoDb === 'read') {
      this.table.grantReadData(fn);
    } else if (props.permissions?.dynamoDb === 'write') {
      this.table.grantWriteData(fn);
    } else if (props.permissions?.dynamoDb === 'readWrite') {
      this.table.grantReadWriteData(fn);
    }

    if (props.permissions?.ses === true) {
      fn.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ['ses:SendEmail', 'ses:SendRawEmail'],
          resources: [NuvinaryLambdaFactory.SES_NOTIFICATION_ARN],
        }),
      );
    }

    return fn;
  }
}
