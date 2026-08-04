import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { PostConfirmationTriggerEvent } from 'aws-lambda';
import { METADATA_SK, userPk } from '@shared/db-keys.js';
import { AVATAR_COLORS, User } from '../user/user.model.js';
import { createUser } from '../user/user.repository.js';

const sesClient = new SESClient({ region: 'eu-central-1' });

export const handler = async (event: PostConfirmationTriggerEvent) => {
  const { sub, given_name, family_name } = event.request.userAttributes;

  const newUser: User = {
    PK: userPk(sub),
    SK: METADATA_SK,
    uid: sub,
    firstName: given_name,
    lastName: family_name,
    displayName: `${given_name} ${family_name}`.trim(),
    credits: 10,
    avatarColor:
      AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    createdAt: new Date().toISOString(),
  };

  await createUser(newUser);

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
