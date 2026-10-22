import { createAdminClient } from './supabase-admin';

export type StorageBucket = 'avatars' | 'covers' | 'articles' | 'media' | 'gallery';

export async function uploadFileToStorage(
  bucket: StorageBucket,
  path: string,
  file: File | Blob,
  contentType?: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createAdminClient();

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: contentType || (file as File).type || 'image/jpeg',
      upsert: true,
    });

    if (error) {
      return { url: null, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Storage upload failed' };
  }
}

export async function deleteFileFromStorage(
  bucket: StorageBucket,
  paths: string[]
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}
