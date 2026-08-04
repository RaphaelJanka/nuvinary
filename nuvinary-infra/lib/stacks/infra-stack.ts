import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import { WebsiteHostingConstruct } from '../constructs/website-hosting';
import { StorageConstruct } from '../constructs/storage';
import { NuvinaryStackProps, StorageLimits } from '../types/interfaces';
import { createAlarmTopic } from '../utils/monitoring';
import { getS3StorageLimit } from '../utils/config-helper';
import { AuthConstruct } from '../constructs/auth';
import { NuvinaryLambdaFactory } from '../constructs/lambda-factory';
import { ApiConstruct } from '../constructs/api';

export class NuvinaryInfraStack extends cdk.Stack {
  readonly alarmTopic: sns.ITopic | undefined;
  readonly storageLimit: number;

  constructor(scope: Construct, id: string, props: NuvinaryStackProps) {
    super(scope, id, props);

    this.alarmTopic = props.isProd ? createAlarmTopic(this) : undefined;
    this.storageLimit = getS3StorageLimit(this, props.isProd);

    new WebsiteHostingConstruct(this, 'WebsiteHosting', {
      certificate: props.certificate,
      subDomainName: props.subDomainName,
      isProd: props.isProd,
      alarmTopic: this.alarmTopic,
    });

    const storage = new StorageConstruct(this, 'NuvinaryStorage', {
      subDomainName: props.subDomainName,
      isProd: props.isProd,
      alarmTopic: this.alarmTopic,
      s3StorageLimitBytes: this.storageLimit,
    });

    const lambdaFactory = new NuvinaryLambdaFactory(this, 'LambdaFactory', {
      table: storage.table,
      bucket: storage.bucket,
    });

    const postConfirmAuthFn = lambdaFactory.createFunction('PostConfirm', {
      entry: '../nuvinary-backend/src/triggers/post-confirmation.ts',
      handler: 'handler',
      permissions: {
        dynamoDb: 'readWrite',
        ses: true,
      },
    });

    const auth = new AuthConstruct(this, 'Auth', {
      isProd: props.isProd,
      alarmTopic: this.alarmTopic,
      postConfirmationFn: postConfirmAuthFn,
    });

    const getUserProfileFn = lambdaFactory.createFunction('GetUserProfile', {
      entry: '../nuvinary-backend/src/user/get-user.ts',
      handler: 'handler',
      permissions: {
        dynamoDb: 'read',
      },
    });

    const updateUserProfileFn = lambdaFactory.createFunction(
      'UpdateUserProfile',
      {
        entry: '../nuvinary-backend/src/user/update-user.ts',
        handler: 'handler',
        permissions: {
          dynamoDb: 'readWrite',
        },
      },
    );

    const generateCreationFn = lambdaFactory.createFunction(
      'GenerateCreation',
      {
        entry: '../nuvinary-backend/src/creation/generate-creation.ts',
        handler: 'handler',
        permissions: {
          bedrock: true,
          dynamoDb: 'readWrite',
          s3: 'readWrite',
        },
      },
    );

    const listUserCreationsFn = lambdaFactory.createFunction(
      'ListUserCreations',
      {
        entry: '../nuvinary-backend/src/creation/list-user-creations.ts',
        handler: 'handler',
        permissions: {
          dynamoDb: 'read',
          s3: 'read',
        },
      },
    );

    const listCommunityCreationsFn = lambdaFactory.createFunction(
      'ListCommunityCreations',
      {
        entry: '../nuvinary-backend/src/creation/list-community-creations.ts',
        handler: 'handler',
        permissions: {
          dynamoDb: 'read',
          s3: 'read',
        },
      },
    );

    const updateCreationFn = lambdaFactory.createFunction('UpdateCreation', {
      entry: '../nuvinary-backend/src/creation/update-creation.ts',
      handler: 'handler',
      permissions: {
        dynamoDb: 'readWrite',
      },
    });

    const deleteCreationFn = lambdaFactory.createFunction('DeleteCreation', {
      entry: '../nuvinary-backend/src/creation/delete-creation.ts',
      handler: 'handler',
      permissions: {
        dynamoDb: 'readWrite',
        s3: 'readWrite',
      },
    });

    const listCollectionsFn = lambdaFactory.createFunction('ListCollections', {
      entry: '../nuvinary-backend/src/collection/list.ts',
      handler: 'handler',
      permissions: {
        dynamoDb: 'read',
        s3: 'read',
      },
    });

    const createCollectionFn = lambdaFactory.createFunction(
      'CreateCollection',
      {
        entry: '../nuvinary-backend/src/collection/create.ts',
        handler: 'handler',
        permissions: {
          dynamoDb: 'readWrite',
        },
      },
    );

    const updateCollectionTitleFn = lambdaFactory.createFunction(
      'UpdateCollectionTitle',
      {
        entry: '../nuvinary-backend/src/collection/update-title.ts',
        handler: 'handler',
        permissions: {
          dynamoDb: 'readWrite',
        },
      },
    );

    const deleteCollectionFn = lambdaFactory.createFunction(
      'DeleteCollection',
      {
        entry: '../nuvinary-backend/src/collection/delete.ts',
        handler: 'handler',
        permissions: {
          dynamoDb: 'readWrite',
        },
      },
    );

    const addCreationToCollectionFn = lambdaFactory.createFunction(
      'AddCreationToCollection',
      {
        entry: '../nuvinary-backend/src/collection/add-creation.ts',
        handler: 'handler',
        permissions: {
          dynamoDb: 'readWrite',
        },
      },
    );

    const removeCreationFromCollectionFn = lambdaFactory.createFunction(
      'RemoveCreationFromCollection',
      {
        entry: '../nuvinary-backend/src/collection/remove-creation.ts',
        handler: 'handler',
        permissions: {
          dynamoDb: 'readWrite',
        },
      },
    );

    new ApiConstruct(this, 'NuvinaryApi', {
      stageName: props.isProd ? 'prod' : 'dev',
      userPool: auth.userPool,
      routes: [
        {
          fetchType: 'GET',
          path: '/me',
          fn: getUserProfileFn,
        },
        {
          fetchType: 'PUT',
          path: '/users/{uid}',
          fn: updateUserProfileFn,
        },
        {
          fetchType: 'POST',
          path: '/creations',
          fn: generateCreationFn,
        },
        {
          fetchType: 'GET',
          path: '/creations',
          fn: listUserCreationsFn,
        },
        {
          fetchType: 'GET',
          path: '/community',
          fn: listCommunityCreationsFn,
        },
        {
          fetchType: 'PATCH',
          path: '/creations/{id}',
          fn: updateCreationFn,
        },
        {
          fetchType: 'DELETE',
          path: '/creations/{id}',
          fn: deleteCreationFn,
        },
        {
          fetchType: 'GET',
          path: '/collections',
          fn: listCollectionsFn,
        },
        {
          fetchType: 'POST',
          path: '/collections',
          fn: createCollectionFn,
        },
        {
          fetchType: 'PATCH',
          path: '/collections/{id}',
          fn: updateCollectionTitleFn,
        },
        {
          fetchType: 'DELETE',
          path: '/collections/{id}',
          fn: deleteCollectionFn,
        },
        {
          fetchType: 'POST',
          path: '/collections/{id}/creations',
          fn: addCreationToCollectionFn,
        },
        {
          fetchType: 'DELETE',
          path: '/collections/{id}/creations/{creationId}',
          fn: removeCreationFromCollectionFn,
        },
      ],
    });
  }
}
