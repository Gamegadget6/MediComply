'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are not configured');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}

export async function unlock(scanId: string, formData: FormData) {
  const email = formData.get('email');

  if (typeof email !== 'string' || !email.trim()) {
    throw new Error('Email is required');
  }

  const supabase = getSupabaseClient();

  // FIX: Updating the 'email' column (instead of 'contact_email')
  const { error } = await supabase
    .from('scans')
    .update({ email: email.trim() })
    .eq('id', scanId);

  if (error) {
    console.error('Unlock Error:', error);
    throw new Error('Unable to unlock report');
  }

  revalidatePath(`/results/${scanId}`);
}