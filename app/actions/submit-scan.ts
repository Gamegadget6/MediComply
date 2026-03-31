'use server';

import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { scanUrl } from './scan';

function getSupabaseClient() {
  // Use the Service Role Key to bypass RLS policies for server-side writes
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are not configured');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}

export async function submitScan(formData: FormData): Promise<{ error: string } | never> {
  const rawUrl = formData.get('url');

  if (typeof rawUrl !== 'string') {
    return { error: 'Invalid URL format' };
  }

  const url = rawUrl.trim();
  if (!url) {
    return { error: 'URL is required' };
  }

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err: any) {
    return { error: 'Configuration Error: ' + err.message };
  }

  const scanResult = await scanUrl(url);

  // FIX: Saving 'hasCookieBanner' and 'hasPrivacyPolicy' inside the 'results' JSON column
  const { data, error } = await supabase
    .from('scans')
    .insert({
      url: url,
      results: scanResult, // This matches the 'jsonb' column in Supabase
      email: null,         // This matches the 'email' column (not contact_email)
    })
    .select('id')
    .single();

  if (error) {
    console.error('Supabase Insert Error:', error);
    return { error: 'Database Error: ' + error.message };
  }

  if (!data) {
    return { error: 'No data returned from insert' };
  }

  redirect(`/results/${data.id}`);
}