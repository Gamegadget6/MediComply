'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors px-4 py-2 mx-auto mt-8 print:hidden"
    >
      <Printer className="w-5 h-5" />
      <span className="font-medium">Save as PDF / Print</span>
    </button>
  );
}