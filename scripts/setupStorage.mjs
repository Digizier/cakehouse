import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.abearjwgkahpaemmueur:_h5zi9L_rdJc8*H@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres';

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database to configure Storage...');
    await client.connect();

    // 1. Create public bucket 'cake-images'
    await client.query(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        'cake-images',
        'cake-images',
        true,
        52428800,
        ARRAY['image/webp', 'image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
      )
      ON CONFLICT (id) DO UPDATE SET public = true;
    `);
    console.log('Bucket "cake-images" created and configured as public.');

    // 2. Enable RLS on storage.objects and grant public read, insert, update, delete
    await client.query(`
      DROP POLICY IF EXISTS "Public storage select" ON storage.objects;
      DROP POLICY IF EXISTS "Public storage insert" ON storage.objects;
      DROP POLICY IF EXISTS "Public storage update" ON storage.objects;
      DROP POLICY IF EXISTS "Public storage delete" ON storage.objects;

      CREATE POLICY "Public storage select" ON storage.objects
      FOR SELECT USING (bucket_id = 'cake-images');

      CREATE POLICY "Public storage insert" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'cake-images');

      CREATE POLICY "Public storage update" ON storage.objects
      FOR UPDATE USING (bucket_id = 'cake-images') WITH CHECK (bucket_id = 'cake-images');

      CREATE POLICY "Public storage delete" ON storage.objects
      FOR DELETE USING (bucket_id = 'cake-images');
    `);
    console.log('Storage RLS policies configured successfully.');

    // Also check storage permissions for anon role
    await client.query(`
      GRANT ALL ON SCHEMA storage TO anon, authenticated, service_role;
      GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon, authenticated, service_role;
    `);
    console.log('Storage permissions granted to anon & authenticated roles.');

  } catch (err) {
    console.error('Error setting up storage:', err);
  } finally {
    await client.end();
  }
}

run();
