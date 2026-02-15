/**
 * Audit Export — generates exportable audit reports from decision records.
 *
 * Supports:
 * - JSON export (structured, machine-readable)
 * - PDF export (human-readable, uses browser print-to-PDF via a styled HTML document)
 *
 * No heavy PDF library dependencies — generates a printable HTML document
 * and triggers the browser's native print/save-as-PDF dialog.
 */

import type { DecisionRecord, ReplayResult } from './decision-ledger';

/* ------------------------------------------------------------------ */
/*  JSON Export                                                        */
/* ------------------------------------------------------------------ */

export interface AuditReportJSON {
  version: string;
  exportedAt: string;
  record: DecisionRecord;
  reproducibility?: {
    replayMatch: boolean;
    dataDrift: boolean;
    engineDrift: boolean;
    replayOutputHash: string;
    currentDatasetHash: string;
  };
}

/**
 * Export a decision record as a downloadable JSON file.
 */
export function exportJSON(record: DecisionRecord, replay?: ReplayResult): void {
  const report: AuditReportJSON = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    record,
  };

  if (replay) {
    report.reproducibility = {
      replayMatch: replay.match,
      dataDrift: replay.dataDrift,
      engineDrift: replay.engineDrift,
      replayOutputHash: replay.replayOutputHash,
      currentDatasetHash: replay.datasetHashCurrent,
    };
  }

  const json = JSON.stringify(report, null, 2);
  downloadFile(json, `zeo-audit-${record.id}.json`, 'application/json');
}

/* ------------------------------------------------------------------ */
/*  PDF Export (via printable HTML)                                     */
/* ------------------------------------------------------------------ */

/**
 * Export a decision record as a printable PDF.
 * Opens a new window with formatted HTML and triggers the browser print dialog.
 */
export function exportPDF(record: DecisionRecord, replay?: ReplayResult): void {
  const html = buildPDFHTML(record, replay);
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  // Slight delay to ensure styles render before print dialog
  setTimeout(() => {
    win.print();
  }, 400);
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildPDFHTML(record: DecisionRecord, replay?: ReplayResult): string {
  const date = new Date(record.timestamp).toLocaleString();
  const planRows = record.executionPlan
    .map(
      (p) =>
        `<tr><td style="font-family:monospace;font-size:12px;padding:4px 8px;border:1px solid #e2e8f0">${escapeHTML(p.command)}</td><td style="padding:4px 8px;border:1px solid #e2e8f0;color:#64748b">${escapeHTML(p.description)}</td></tr>`,
    )
    .join('');

  const numericRows = Object.entries(record.numericBreakdown)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 8px;border:1px solid #e2e8f0;color:#64748b">${escapeHTML(k)}</td><td style="padding:4px 8px;border:1px solid #e2e8f0;font-weight:600">${escapeHTML(v)}</td></tr>`,
    )
    .join('');

  const driversList = record.keyDrivers
    .map((d) => `<li>${escapeHTML(d)}</li>`)
    .join('');

  let reproSection = '';
  if (replay) {
    const statusColor = replay.match ? '#16a34a' : '#dc2626';
    const statusText = replay.match ? 'MATCH — Output is reproducible' : 'MISMATCH — Output has diverged';
    reproSection = `
      <div style="margin-top:24px;padding:16px;border:2px solid ${statusColor};border-radius:8px">
        <h2 style="margin:0 0 8px;font-size:16px;color:${statusColor}">Reproducibility: ${statusText}</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <tr><td style="padding:4px 8px">Replay output hash</td><td style="padding:4px 8px;font-family:monospace;font-size:11px">${escapeHTML(replay.replayOutputHash)}</td></tr>
          <tr><td style="padding:4px 8px">Original output hash</td><td style="padding:4px 8px;font-family:monospace;font-size:11px">${escapeHTML(record.cliOutputHash)}</td></tr>
          <tr><td style="padding:4px 8px">Data drift detected</td><td style="padding:4px 8px">${replay.dataDrift ? 'Yes' : 'No'}</td></tr>
          <tr><td style="padding:4px 8px">Engine drift detected</td><td style="padding:4px 8px">${replay.engineDrift ? 'Yes' : 'No'}</td></tr>
        </table>
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Zeo Audit Report — ${escapeHTML(record.id)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; color: #1e293b; line-height: 1.6; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    h2 { font-size: 16px; margin-top: 24px; margin-bottom: 8px; color: #334155; }
    .meta { font-size: 13px; color: #64748b; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { text-align: left; padding: 6px 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
    .summary { background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    ul { padding-left: 20px; }
    li { margin-bottom: 4px; font-size: 14px; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <h1>Zeo Decision Audit Report</h1>
  <div class="meta">
    Record ID: <strong>${escapeHTML(record.id)}</strong> &middot; ${escapeHTML(date)} &middot; Engine v${escapeHTML(record.engineVersion)}
  </div>

  <h2>Query</h2>
  <div class="summary">${escapeHTML(record.naturalLanguageQuery)}</div>

  <h2>Classified Intent</h2>
  <p><span class="badge" style="background:#eff6ff;color:#1d4ed8">${escapeHTML(record.intent)}</span></p>

  <h2>Executive Summary</h2>
  <div class="summary">${escapeHTML(record.narrativeSummary)}</div>

  <h2>Key Drivers</h2>
  <ul>${driversList}</ul>

  <h2>Recommended Action</h2>
  <p>${escapeHTML(record.recommendedAction)}</p>

  <h2>Confidence Note</h2>
  <p style="color:#64748b">${escapeHTML(record.confidenceNote)}</p>

  <h2>Execution Plan</h2>
  <table>
    <thead><tr><th>Command</th><th>Description</th></tr></thead>
    <tbody>${planRows}</tbody>
  </table>

  ${numericRows ? `
  <h2>Numeric Breakdown</h2>
  <table>
    <thead><tr><th>Metric</th><th>Value</th></tr></thead>
    <tbody>${numericRows}</tbody>
  </table>` : ''}

  <h2>Integrity</h2>
  <table style="font-size:13px">
    <tr><td style="padding:4px 8px;border:1px solid #e2e8f0;color:#64748b">Dataset hash</td><td style="padding:4px 8px;border:1px solid #e2e8f0;font-family:monospace;font-size:11px">${escapeHTML(record.datasetHash)}</td></tr>
    <tr><td style="padding:4px 8px;border:1px solid #e2e8f0;color:#64748b">Output hash</td><td style="padding:4px 8px;border:1px solid #e2e8f0;font-family:monospace;font-size:11px">${escapeHTML(record.cliOutputHash)}</td></tr>
    <tr><td style="padding:4px 8px;border:1px solid #e2e8f0;color:#64748b">Engine version</td><td style="padding:4px 8px;border:1px solid #e2e8f0">${escapeHTML(record.engineVersion)}</td></tr>
  </table>

  ${reproSection}

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8">
    Generated by Zeo Decision Governance &middot; ${escapeHTML(new Date().toISOString())}
  </div>
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/*  Utility                                                            */
/* ------------------------------------------------------------------ */

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
