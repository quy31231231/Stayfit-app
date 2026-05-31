// Tầng truy cập Cloudflare R2 (S3-compatible) — CHỈ chạy server (không import vào client).
// Bucket để PRIVATE: upload qua presigned PUT, đọc qua presigned GET.
// Key do server đặt theo uid (xem app/api/r2/sign/route.js) nên không cần RLS riêng cho storage.

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const isR2Configured =
  !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET);

let _client = null;
function client() {
  if (_client) return _client;
  _client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
  return _client;
}

const BUCKET = () => process.env.R2_BUCKET;

// URL tạm để client PUT ảnh THẲNG lên R2 (không qua hàm Vercel).
export function presignPut(key, contentType, expiresIn = 300) {
  return getSignedUrl(
    client(),
    new PutObjectCommand({ Bucket: BUCKET(), Key: key, ContentType: contentType }),
    { expiresIn }
  );
}

// URL tạm để hiển thị ảnh (private bucket).
export function presignGet(key, expiresIn = 3600) {
  return getSignedUrl(client(), new GetObjectCommand({ Bucket: BUCKET(), Key: key }), { expiresIn });
}
