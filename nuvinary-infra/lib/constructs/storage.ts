import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cw_actions from 'aws-cdk-lib/aws-cloudwatch-actions';

interface StorageConstructProps {
  subDomainName: string;
  isProd: boolean;
  alarmTopic?: sns.ITopic;
  s3StorageLimitBytes: number;
}

export class StorageConstruct extends Construct {
  readonly table: dynamodb.Table;
  readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: StorageConstructProps) {
    super(scope, id);

    this.table = new dynamodb.Table(this, 'NuvinaryData', {
      tableName: `nuvinary-data-${props.isProd ? 'prod' : 'dev'}`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /**
     * For the community section to get all creations at once
     */
    this.table.addGlobalSecondaryIndex({
      indexName: 'CreationIndex',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
    });

    this.bucket = new s3.Bucket(this, 'CreationsBucket', {
      bucketName: `nuvinary-creations-${props.subDomainName.replace(/\./g, '-')}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    if (props.alarmTopic) {
      const dynamoDBErrorAlarm = new cloudwatch.Alarm(
        this,
        'DynamoDBErrorAlarm',
        {
          metric: this.table.metricUserErrors(),
          threshold: 1,
          evaluationPeriods: 1,
          alarmDescription: 'DynamoDB hat User-Fehler produziert!',
        },
      );

      dynamoDBErrorAlarm.addAlarmAction(
        new cw_actions.SnsAction(props.alarmTopic),
      );

      const s3SizeMetric = new cloudwatch.Metric({
        namespace: 'AWS/S3',
        metricName: 'BucketSizeBytes',
        dimensionsMap: {
          BucketName: this.bucket.bucketName,
          StorageType: 'StandardStorage',
        },
        period: cdk.Duration.days(1),
        statistic: 'Average',
      });

      const s3StorageAlarm = new cloudwatch.Alarm(this, 'S3StorageAlarm', {
        metric: s3SizeMetric,
        threshold: props.s3StorageLimitBytes,
        evaluationPeriods: 1,
        datapointsToAlarm: 1,
      });

      s3StorageAlarm.addAlarmAction(new cw_actions.SnsAction(props.alarmTopic));
    }
  }
}
