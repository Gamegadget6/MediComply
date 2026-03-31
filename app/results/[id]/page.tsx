import { createClient } from '@supabase/supabase-js';
import { CheckCircle2, XCircle, Lock, Unlock } from 'lucide-react';
import { notFound } from 'next/navigation';
import { unlock } from '@/app/actions/unlock';
import { PrintButton } from '@/components/print-button';

// 1. Force dynamic rendering so we always fetch fresh data
export const dynamic = 'force-dynamic';

async function getScan(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from('scans')
    .select('id, url, email, results')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Fetch Error:', error);
    return null;
  }

  return data;
}

// FIX: 'params' is now a Promise in Next.js 15. We must type it as Promise and await it.
export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {

  // Await the params to get the ID
  const { id } = await params;

  const scan = await getScan(id);

  if (!scan) {
    notFound();
  }

  // Read the values from the JSONB 'results' column
  const resultsData = typeof scan.results === 'string'
    ? JSON.parse(scan.results)
    : scan.results;

  const { 
    hasCookieBanner, 
    hasPrivacyPolicy,
    foundTrackers = [], // default to [] to prevent breaking old scans
    hasInsecureForms = false, // default to false
    missingAltTagsCount = 0 // default to 0
  } = resultsData;

  // Check the 'email' column to see if it is unlocked
  const isUnlocked = !!scan.email;

  return (
    <main className="min-h-screen bg-slate-50 p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white shadow-xl rounded-xl overflow-hidden">

        {/* Header */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Compliance Report</h1>
          <p className="opacity-90 mt-1">{scan.url}</p>
        </div>

        <div className="p-8">
          {/* Status Badge */}
          <div className="flex justify-center mb-8">
            {isUnlocked ? (
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                <Unlock className="w-4 h-4" /> Report Unlocked
              </span>
            ) : (
              <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4" /> Critical Issues Found
              </span>
            )}
          </div>

          {/* Checklist Items */}
          <div className="space-y-6">
            {/* Item 1: Cookie Banner */}
            <div className={`flex items-center justify-between p-4 border rounded-lg ${!isUnlocked ? 'blur-sm select-none' : ''}`}>
              <div className="flex items-center gap-4">
                {isUnlocked ? (
                  hasCookieBanner ? <CheckCircle2 className="text-green-500 w-8 h-8" /> : <XCircle className="text-red-500 w-8 h-8" />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                )}
                <div>
                  <h3 className="font-semibold text-lg">Cookie Consent Banner</h3>
                  <p className="text-slate-500 text-sm">Required for GDPR/CCPA compliance.</p>
                </div>
              </div>
            </div>

            {/* Item 2: Privacy Policy */}
            <div className={`flex items-center justify-between p-4 border rounded-lg ${!isUnlocked ? 'blur-sm select-none' : ''}`}>
              <div className="flex items-center gap-4">
                {isUnlocked ? (
                  hasPrivacyPolicy ? <CheckCircle2 className="text-green-500 w-8 h-8" /> : <XCircle className="text-red-500 w-8 h-8" />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                )}
                <div>
                  <h3 className="font-semibold text-lg">Privacy Policy Link</h3>
                  <p className="text-slate-500 text-sm">Must be clearly visible on homepage.</p>
                </div>
              </div>
            </div>

            {/* Item 3: Trackers (HIPAA Risk) */}
            <div className={`flex items-center justify-between p-4 border rounded-lg ${!isUnlocked ? 'blur-sm select-none' : ''}`}>
              <div className="flex items-center gap-4">
                {isUnlocked ? (
                  foundTrackers.length === 0 ? <CheckCircle2 className="text-green-500 w-8 h-8 flex-shrink-0" /> : <XCircle className="text-red-500 w-8 h-8 flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-semibold text-lg hover:text-red-600 transition-colors">Third-Party Trackers</h3>
                  <p className="text-slate-500 text-sm">
                    {foundTrackers.length > 0 
                      ? `Warning: Found ${foundTrackers.join(', ')}. High HIPAA violation risk.` 
                      : 'No major advertising scripts detected on homepage.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Item 4: Insecure Forms (HIPAA Risk) */}
            <div className={`flex items-center justify-between p-4 border rounded-lg ${!isUnlocked ? 'blur-sm select-none' : ''}`}>
              <div className="flex items-center gap-4">
                {isUnlocked ? (
                  !hasInsecureForms ? <CheckCircle2 className="text-green-500 w-8 h-8 flex-shrink-0" /> : <XCircle className="text-red-500 w-8 h-8 flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-semibold text-lg">Form Encryption checks</h3>
                  <p className="text-slate-500 text-sm">
                    {hasInsecureForms 
                      ? 'Critical Warning: Client intake forms are transmitting over unencrypted HTTP.' 
                      : 'All detected forms utilize secure HTTPS or relative paths.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Item 5: ADA Compliance (Alt Tags) */}
            <div className={`flex items-center justify-between p-4 border rounded-lg ${!isUnlocked ? 'blur-sm select-none' : ''}`}>
              <div className="flex items-center gap-4">
                {isUnlocked ? (
                  missingAltTagsCount === 0 ? <CheckCircle2 className="text-green-500 w-8 h-8 flex-shrink-0" /> : <XCircle className="text-red-500 w-8 h-8 flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-semibold text-lg hover:text-red-600 transition-colors">ADA Accessibility Risks</h3>
                  <p className="text-slate-500 text-sm">
                    {missingAltTagsCount > 0 
                      ? `Warning: Found ${missingAltTagsCount} images missing 'alt' text. ADA lawsuit liability.` 
                      : 'Basic screen-reader checks passed.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Unlock Form */}
          {!isUnlocked && (
            <div className="mt-8 bg-slate-50 p-6 rounded-lg border border-slate-200 text-center relative print:hidden">
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-0" />
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Unlock Full Report</h3>
                <p className="text-slate-600 mb-4">Enter your email to see exactly what is missing.</p>

                {/* NOTE: We use scan.id here. 
                   Since this is a server component, we bind the ID directly to the action.
                */}
                <form action={unlock.bind(null, scan.id)} className="flex gap-2 max-w-sm mx-auto">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="doctor@clinic.com"
                    className="flex-1 px-4 py-2 border rounded-md"
                  />
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700">
                    Unlock
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Print Button (Only show if unlocked) */}
          {isUnlocked && <PrintButton />}
        </div>
      </div>
    </main>
  );
}