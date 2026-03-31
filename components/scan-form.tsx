'use client';

import { useState, useTransition } from 'react';
import { submitScan } from '@/app/actions/submit-scan';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export function ScanForm() {
  const [url, setUrl] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await submitScan(formData);
      } catch (err) {
        if (isRedirectError(err)) {
          throw err;
        }
        console.error(err);
        setError('Unable to submit scan right now. Please try again.');
      }
    });
  };

  return (
    <form
      action={handleSubmit}
      className="w-full max-w-2xl space-y-4 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70"
    >
      <div className="space-y-2">
        <label
          htmlFor="url"
          className="text-sm font-medium text-zinc-800 dark:text-zinc-100"
        >
          Clinic website URL
        </label>
        <input
          id="url"
          name="url"
          type="url"
          required
          placeholder="https://drsmithdental.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          We’ll check for cookie consent and privacy policy signals.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700/50 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Scanning…' : 'Scan website'}
      </button>
    </form>
  );
}
