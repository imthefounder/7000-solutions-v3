import { jsPDF } from 'jspdf';

// Generates the whitepaper as a downloadable PDF using jsPDF.
export function generateWhitepaperPdf() {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 60;
  const pageWidth = 595.28;
  const contentWidth = pageWidth - margin * 2;
  let y = 80;

  doc.setFontSize(24);
  doc.setTextColor(15, 118, 110);
  doc.text('The 7,000 Solutions Whitepaper', margin, y);
  y += 40;

  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);

  const sections: Array<[string, string]> = [
    [
      'Executive Summary',
      'The 7,000 Solutions Platform is a blueprint for city-scale problem solving in the AI era. It combines a structured catalog of AI-generated solutions to world issues, a municipal operating layer where cities track implementation progress, and a community flywheel (Watch-Build-Teach) that turns every solution into local action.',
    ],
    [
      'Methodology',
      'Solutions are AI-drafted, then reviewed and refined by domain experts. A structured taxonomy spans 20+ categories from Education to Digital Equity. Every solution is scored on feasibility, cost, and expected community impact. Semantic search lets users find solutions by meaning, not just keywords, and solutions can be pinned to specific cities and neighborhoods.',
    ],
    [
      'Municipal Operating Layer',
      'City officials get a live dashboard: which solutions are planned, in progress, or completed; which neighborhoods are covered; and how community members are contributing. Every status change is public, so residents can hold their city accountable.',
    ],
    [
      'Karma System (Watch-Build-Teach)',
      'Residents earn karma by learning a solution, implementing it, or teaching it to others. This creates a self-reinforcing loop of local problem solving and community recognition.',
    ],
    [
      'Pilot Roadmap',
      'Phase 1 (Weeks 1-4): seed 1,000 priority solutions and onboard city staff. Phase 2 (Weeks 5-8): launch public browsing with feedback and tracking. Phase 3 (Weeks 9-12): enable Watch-Build-Teach with karma and publish city progress reports. Phase 4 (Months 4-6): expand to all 7,000 solutions and additional pilot cities.',
    ],
  ];

  for (const [title, body] of sections) {
    if (y > 700) {
      doc.addPage();
      y = 80;
    }
    doc.setFontSize(14);
    doc.setTextColor(15, 118, 110);
    doc.text(title, margin, y);
    y += 24;

    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(body, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 16 + 28;
  }

  doc.save('7000-solutions-whitepaper.pdf');
}
