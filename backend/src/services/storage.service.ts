import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('[SUPABASE] Missing Supabase credentials. File uploads will use placeholder URLs.');
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function uploadPDFToStorage(
  fileName: string,
  fileBuffer: Buffer,
  lectureId: string
): Promise<string> {
  if (!supabase) {
    console.warn('[SUPABASE] Supabase not configured, returning placeholder URL');
    return `https://storage.example.com/${lectureId}.pdf`;
  }

  try {
    console.log('[SUPABASE] Uploading file:', fileName);

    const bucketName = 'lecture-pdfs';
    const filePath = `${lectureId}/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      console.error('[SUPABASE] Upload error:', error.message);
      throw error;
    }

    console.log('[SUPABASE] File uploaded successfully:', data.path);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const fileUrl = publicUrlData.publicUrl;
    console.log('[SUPABASE] Public URL:', fileUrl);

    return fileUrl;
  } catch (error: any) {
    console.error('[SUPABASE] Error uploading file:', error.message);
    // Return placeholder URL on error
    return `https://storage.example.com/${lectureId}.pdf`;
  }
}

export async function deletePDFFromStorage(fileUrl: string): Promise<boolean> {
  if (!supabase || !fileUrl.includes('supabase')) {
    console.log('[SUPABASE] Skipping deletion for non-Supabase URL');
    return true;
  }

  try {
    console.log('[SUPABASE] Deleting file:', fileUrl);

    // Extract path from URL
    const urlParts = fileUrl.split('/');
    const bucketName = 'lecture-pdfs';
    const filePath = urlParts.slice(-2).join('/');

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('[SUPABASE] Delete error:', error.message);
      return false;
    }

    console.log('[SUPABASE] File deleted successfully');
    return true;
  } catch (error: any) {
    console.error('[SUPABASE] Error deleting file:', error.message);
    return false;
  }
}
