import { ScanForm } from "@/components/scan-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white px-6 py-24 font-sans text-zinc-900 dark:from-black dark:via-zinc-950 dark:to-black">
      <main className="mx-auto flex max-w-5xl flex-col gap-12">
        <section className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            MediComply
          </p>
          <h1 className="text-4xl font-bold leading-tight text-zinc-900 dark:text-white sm:text-5xl">
            Is your clinic&apos;s website HIPAA/GDPR compliant?
          </h1>
          <p className="max-w-3xl text-lg text-zinc-600 dark:text-zinc-300">
            Paste a URL to scan for cookie consent banners and privacy policy
            coverage. Get a quick compliance snapshot in seconds.
          </p>
        </section>

        <ScanForm />
      </main>
    </div>
  );
}
