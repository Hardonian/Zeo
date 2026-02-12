import { promises as fs } from 'node:fs';
import path from 'node:path';

const READYLAYER_SITE_ROOT = path.join(process.cwd(), '..', '..', 'vendor', 'readylayer', 'site');

function rebrandContent(html: string): string {
  return html
    .replace(/ReadyLayer — Enforcement-first code review for AI-assisted teams/g, 'Zeo — Enforcement-first review for deterministic quant decision workflows')
    .replace(/ReadyLayer/g, 'Zeo')
    .replace(/readylayer/g, 'zeo')
    .replace(/Open-core enforcement platform/g, 'Deterministic quant decision PR analyzer')
    .replace(/Free tier is deterministic and runs without AI keys\./g, 'Deterministic mode runs locally; Zeo integrates key and ReadyLayer elements into GitHub-native review workflows.')
    .replace(/href="https:\/\/github\.com\/readylayer\/readylayer#readme"/g, 'href="https://github.com/scott/zeo#readme"')
    .replace(/<img[^>]*>/g, '<div class="visual-note">Zeo product visual integrated from the vendored static story layer.</div>');
}

function rewriteSitePaths(html: string): string {
  return html
    .replace(/href="styles\.css"/g, 'href="/platform/assets/styles.css"')
    .replace(/src="assets\//g, 'src="/platform/assets/assets/');
}

export async function loadReadyLayerSiteHtml(): Promise<string | null> {
  try {
    const htmlPath = path.join(READYLAYER_SITE_ROOT, 'index.html');
    const html = await fs.readFile(htmlPath, 'utf8');
    const rebranded = rebrandContent(html);
    const rewrittenPaths = rewriteSitePaths(rebranded);
    const brandStyles = '<style>.visual-note{border:1px solid #d1d5db;background:#f9fafb;border-radius:12px;padding:20px;color:#374151;font-size:14px;line-height:1.5;}</style>';
    return rewrittenPaths.replace('</head>', `${brandStyles}</head>`);
  } catch {
    return null;
  }
}

export async function loadReadyLayerSiteAsset(assetPath: string[]): Promise<{ content: Buffer; contentType: string } | null> {
  const normalizedPath = path.normalize(assetPath.join('/')).replace(/^\.+[\\/]/, '');
  const filePath = path.join(READYLAYER_SITE_ROOT, normalizedPath);

  if (!filePath.startsWith(READYLAYER_SITE_ROOT)) {
    return null;
  }

  try {
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = ext === '.css'
      ? 'text/css; charset=utf-8'
      : ext === '.svg'
        ? 'image/svg+xml'
        : 'application/octet-stream';

    return { content, contentType };
  } catch {
    return null;
  }
}
