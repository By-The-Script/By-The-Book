import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://tkwmncykdrhnpipsqsop.supabase.co';
const SUPABASE_KEY = 'sb_publishable_9wB_Gx2ZQQ9uCCGuTdws0g_xutBBtgq';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BUCKET = 'userBooks';

export async function uploadBook(file, storagePath) {
    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, {
            upsert: true,
            contentType: 'application/pdf'
        });

    if (error) throw error;

    const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

    return data.publicUrl;
}

export async function uploadCommunityCover(file, storagePath) {
    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, {
            upsert: true,
            contentType: file.type || 'image/jpeg',
        });

    if (error) throw error;

    const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

    return data.publicUrl;
}