import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { AVATAR_COLORS } from '../models/user.model.js';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: 'eu-central-1' });
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: any) => {
  const { sub, email, given_name, family_name } = event.request.userAttributes;

  const newUser = {
    PK: `USER#${sub}`,
    SK: `METADATA`,
    uid: sub,
    email: email,
    firstName: given_name,
    lastName: family_name,
    displayName: `${given_name} ${family_name || ''}`.trim(),
    credits: 10,
    avatarColor:
      AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    createdAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: newUser,
    }),
  );

  try {
    await sesClient.send(
      new SendEmailCommand({
        Source: 'dev.project.notifications@gmail.com',
        Destination: {
          ToAddresses: ['dev.project.notifications@gmail.com'],
        },
        Message: {
          Subject: { Data: 'Neue Registrierung bei Nuvinary!' },
          Body: {
            Text: {
              Data: `Es gab eine neue Registrierung:
                     
                     User-ID: ${sub}
                     Zeitpunkt: ${new Date().toISOString()}
                     
                     Bitte prüfe den User im Admin-Dashboard/DynamoDB.`,
            },
          },
        },
      }),
    );
  } catch (err) {
    console.error('Fehler beim Senden der Benachrichtigung:', err);
  }

  return event;
};
