import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export async function savePhoto(input: { bytes: Buffer; mime: string }, root = path.resolve('storage/photos')) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(input.mime)) throw new Error('UNSUPPORTED_IMAGE');
  await mkdir(root, { recursive: true });
  const filename = `${randomUUID()}.bin`;
  await writeFile(path.join(root, filename), input.bytes);
  return { filename, mime: input.mime };
}
