import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const PRESIGNED_URL_TTL_SECONDS = 60 * 60 * 24;

export const s3Client = new S3Client({});

/**
 * Creates a time-limited (24h) presigned GET URL for an object in the creations bucket.
 * Required because the bucket blocks all public access — this is the only way a browser
 * can load an image without the Lambda's own AWS credentials. The frontend also refetches
 * this URL whenever the gallery is opened, so the TTL mainly guards a single long-lived visit.
 */
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
