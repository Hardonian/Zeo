import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface StitchPageInfo {
  slug: string;
  title: string;
  filePath: string;
}

const STITCH_ROOT = path.join(process.cwd(), 'src/panels/stitch/stitch_decision_branching_view');

function slugify(name: string): string {
  return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function getStitchPages(): Promise<StitchPageInfo[]> {
  const entries = await fs.readdir(STITCH_ROOT, { withFileTypes: true });
  const dirs = entries.filter((entry) => entry.isDirectory());
  const pages: StitchPageInfo[] = [];

  for (const dir of dirs) {
    const filePath = path.join(STITCH_ROOT, dir.name, 'code.html');
    try {
      await fs.access(filePath);
      pages.push({
        slug: slugify(dir.name),
        title: dir.name.replace(/_/g, ' '),
        filePath,
      });
    } catch {
      continue;
    }
  }

  return pages.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getStitchHtml(slug: string): Promise<StitchPageInfo & { html: string } | null> {
  const pages = await getStitchPages();
  const page = pages.find((item) => item.slug === slug);
  if (!page) {
    return null;
  }

  const html = await fs.readFile(page.filePath, 'utf8');
  return { ...page, html };
}
