import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';

interface StorageConstructProps {
  subDomainName: string;
  isProd: boolean;
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
  }
}
