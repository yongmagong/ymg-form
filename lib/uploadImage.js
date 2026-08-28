import { upload } from '@vercel/blob/client';

function safeImageName(filename) {
  const ext = (filename || '').split('.').pop()?.toLowerCase() || 'jpg';
  return `image-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

async function uploadImageFile(file) {
  const blob = await upload(safeImageName(file.name), file, {
    access: 'public',
    handleUploadUrl: '/api/admin/upload',
  });
  return blob.url;
}

export { uploadImageFile };
