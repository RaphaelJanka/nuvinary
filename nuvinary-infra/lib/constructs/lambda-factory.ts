import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NuvinaryLambdaProps } from '../types/interfaces';
import { Duration } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';

const LAMBDA_DEFAULTS = {
  MEMORY_SIZE: 512,
  TIMEOUT: Duration.seconds(30),
};

export interface LambdaFactoryProps {
  table: dynamodb.ITable;
  bucket?: s3.IBucket;
}

export class NuvinaryLambdaFactory extends Construct {
  private readonly table: dynamodb.ITable;
  private readonly bucket?: s3.IBucket;
  private static readonly SES_NOTIFICATION_ARN =
    'arn:aws:ses:eu-central-1:635256138522:identity/dev.project.notifications@gmail.com';
  private static readonly STABLE_IMAGE_CORE_MODEL_ARN =
    'arn:aws:bedrock:us-west-2::foundation-model/stability.stable-image-core-v1:1';

  constructor(scope: Construct, id: string, props: LambdaFactoryProps) {
    super(scope, id);
    this.table = props.table;
    this.bucket = props.bucket;
  }

  createFunction(id: string, props: NuvinaryLambdaProps): lambda.Function {
    if (props.permissions?.s3 && !this.bucket) {
      throw new Error(
        `Lambda '${id}' requests S3 permissions, but NuvinaryLambdaFactory was not given a bucket.`,
      );
    }

    const fn = new NodejsFunction(this, id, {
      entry: props.entry,
      handler: props.handler ?? 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: props.memorySize ?? LAMBDA_DEFAULTS.MEMORY_SIZE,
      timeout: props.timeOut ?? LAMBDA_DEFAULTS.TIMEOUT,
      environment: {
        TABLE_NAME: this.table.tableName,
        ...(this.bucket ? { BUCKET_NAME: this.bucket.bucketName } : {}),
      },
      projectRoot: path.join(__dirname, '../../../'),
      bundling: {
        forceDockerBundling: false,
      },
    });

    if (props.permissions?.dynamoDb === 'read') {
      this.table.grantReadData(fn);
    } else if (props.permissions?.dynamoDb === 'write') {
      this.table.grantWriteData(fn);
    } else if (props.permissions?.dynamoDb === 'readWrite') {
      this.table.grantReadWriteData(fn);
    }

    if (props.permissions?.s3 === 'read') {
      this.bucket!.grantRead(fn);
    } else if (props.permissions?.s3 === 'write') {
      this.bucket!.grantWrite(fn);
    } else if (props.permissions?.s3 === 'readWrite') {
      this.bucket!.grantReadWrite(fn);
    }

    if (props.permissions?.ses === true) {
      fn.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ['ses:SendEmail', 'ses:SendRawEmail'],
          resources: [NuvinaryLambdaFactory.SES_NOTIFICATION_ARN],
        }),
      );
    }

    if (props.permissions?.bedrock === true) {
      fn.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ['bedrock:InvokeModel'],
          resources: [NuvinaryLambdaFactory.STABLE_IMAGE_CORE_MODEL_ARN],
        }),
      );
    }

    return fn;
  }
}
