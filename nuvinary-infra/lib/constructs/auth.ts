import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as cdk from 'aws-cdk-lib/core';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import {
  AuthConstructProps,
  NuvinaryInfraBaseProps,
} from '../types/interfaces';

export class AuthConstruct extends Construct {
  readonly userPool: cognito.UserPool;
  readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: AuthConstructProps) {
    super(scope, id);

    this.userPool = new cognito.UserPool(this, 'NuvinaryUserPool', {
      userPoolName: `nuvinary-user-pool-${props.isProd ? 'prod' : 'dev'}`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      standardAttributes: {
        email: { required: true, mutable: true },
        givenName: { required: true, mutable: true },
        familyName: { required: true, mutable: true },
      },
      userVerification: {
        emailSubject: 'Verify your Nuvinary account',
        emailBody: 'Thanks for signing up! Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      removalPolicy: props.isProd
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    this.userPoolClient = this.userPool.addClient('NuvinaryAppClient', {
      userPoolClientName: 'nuvinary-web-app-client',
      generateSecret: false,
      authFlows: {
        userPassword: true,
      },
    });

    if (props.alarmTopic) {
      const signInThrottlesMetric = new cloudwatch.Metric({
        namespace: 'AWS/Cognito',
        metricName: 'SignInThrottles',
        dimensionsMap: {
          UserPoolId: this.userPool.userPoolId,
        },
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      });

      new cloudwatch.Alarm(this, 'CognitoThrottlingAlarm', {
        metric: signInThrottlesMetric,
        threshold: 10,
        evaluationPeriods: 1,
        alarmDescription: 'Cognito is throttling sign-in attempts!',
      });
    }
  }
}
