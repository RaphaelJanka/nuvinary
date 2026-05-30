import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';

export const createAlarmTopic = (scope: Construct): sns.ITopic => {
  const alertEmail = process.env.ALERT_EMAIL;
  if (!alertEmail) throw new Error('ERROR: Variable "ALERT_EMAIL" not set!');

  const topic = new sns.Topic(scope, 'NuvinaryAlarmTopic', {
    displayName: 'Nuvinary Alarms',
  });
  topic.addSubscription(new subscriptions.EmailSubscription(alertEmail));
  return topic;
};
