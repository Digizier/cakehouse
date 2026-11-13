import { supabase } from './supabase';

/**
 * Compresses any image (PNG, JPG, JPEG, WEBP) to an optimized WebP format
 * with reduced dimensions and high visual quality, bringing file sizes
 * down to the lightweight kilobyte (KB) range (30KB - 90KB).
 */
export async function compressImageToWebP(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<File> {
  return new Promise((resolve, reject) => {
    // If not in a browser environment, return original
    if (typeof window === 'undefined') {
      return resolve(file);
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        return resolve(file);
      }
      img.src = e.target.result as string;
    };

    reader.onerror = (err) => reject(err);

    img.onload = () => {
      let { width, height } = img;

      // Scale down while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(file);
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
          const webpFile = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(webpFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a file directly to Supabase Storage and returns its short public CDN URL.
 * Automatically compresses to WebP first!
 */
export async function uploadImageAndGetUrl(
  file: File,
  bucket = 'cake-images',
  folder = 'uploads'
): Promise<{ url: string | null; error: string | null }> {
  try {
    // 1. Compress to WebP in browser
    const compressedFile = await compressImageToWebP(file);

    // 2. Generate a clean, unique file path
    const timestamp = Date.now();
    const cleanName = compressedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${folder}/${timestamp}_${cleanName}`;

    // 3. Upload binary to Supabase Storage bucket
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, compressedFile, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      console.warn(`Storage upload to '${bucket}' failed, falling back to local object URL:`, uploadError.message);
      // As safe fallback if bucket not yet created or permission issue:
      const fallbackUrl = URL.createObjectURL(compressedFile);
      return { url: fallbackUrl, error: uploadError.message };
    }

    // 4. Retrieve public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    console.error('Image upload failed:', err);
    return { url: null, error: err?.message || 'Upload error' };
  }
}
