'use client';

import { Download } from 'lucide-react';
import { generateWhitepaperPdf } from '@/lib/pdfGenerator';

export default function WhitepaperDownload() {
  return (
    <button
      onClick={generateWhitepaperPdf}
      className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
    >
      <Download className="w-5 h-5" />
      Download Whitepaper (PDF)
    </button>
  );
}
