import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const PRESIGNED_URL_TTL_SECONDS = 60 * 60 * 24;

export const s3Client = new S3Client({});

/** Creates a 24h presigned GET URL, since the creations bucket blocks all public access. */
export function getPresignedImageUrl(imageKey: string): Promise<string> {
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: imageKey,
    }),
    { expiresIn: PRESIGNED_URL_TTL_SECONDS },
  );
}
