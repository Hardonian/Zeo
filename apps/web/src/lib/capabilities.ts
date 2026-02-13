import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface CapabilityPageInfo {
  slug: string;
  title: string;
  filePath: string;
  category: string;
}

const CAPABILITIES_ROOT = path.join(process.cwd(), 'src/panels/capabilities');

const PANEL_CATEGORIES: Record<string, string> = {
  stitch_decision_branching_view: 'Decision Intelligence',
  stitch_oss_governance_dashboard: 'Governance & Compliance',
  stitch_cli_assist_overlay: 'CLI & Automation',
  stitch_merge_confirmation_dialog: 'Collaboration',
  stitch_runner_status_popover: 'Monitoring',
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function formatTitle(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

async function findCodeHtmlFiles(dirPath: string): Promise<{ filePath: string; category: string }[]> {
  const results: { filePath: string; category: string }[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const codeHtmlPath = path.join(fullPath, 'code.html');
        try {
          await fs.access(codeHtmlPath);
          const parentDir = path.basename(dirPath);
          const category = PANEL_CATEGORIES[parentDir] || 'Fundamentals';
          results.push({ filePath: codeHtmlPath, category });
        } catch {
          const subResults = await findCodeHtmlFiles(fullPath);
          results.push(...subResults);
        }
      }
    }
  } catch {
    return [];
  }

  return results;
}

export async function getCapabilityPages(): Promise<CapabilityPageInfo[]> {
  const codeFiles = await findCodeHtmlFiles(CAPABILITIES_ROOT);
  const slugUsage = new Map<string, number>();

  const pages = codeFiles.map(({ filePath, category }) => {
    const dirName = path.basename(path.dirname(filePath));
    const relPath = path.relative(CAPABILITIES_ROOT, path.dirname(filePath));
    const baseSlug = slugify(relPath);
    const seen = slugUsage.get(baseSlug) || 0;
    slugUsage.set(baseSlug, seen + 1);
    const slug = seen === 0 ? baseSlug : `${baseSlug}-${seen + 1}`;

    return {
      slug,
      title: formatTitle(dirName),
      filePath,
      category,
    };
  });

  return pages.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }

    return a.title.localeCompare(b.title);
  });
}

export async function getCapabilityPagesByCategory(): Promise<Record<string, CapabilityPageInfo[]>> {
  const pages = await getCapabilityPages();
  const byCategory: Record<string, CapabilityPageInfo[]> = {};

  for (const page of pages) {
    if (!byCategory[page.category]) {
      byCategory[page.category] = [];
    }
    byCategory[page.category].push(page);
  }

  return byCategory;
}

export async function getCapabilityHtml(slug: string): Promise<(CapabilityPageInfo & { html: string }) | null> {
  const pages = await getCapabilityPages();
  const page = pages.find((item) => item.slug === slug);
  if (!page) {
    return null;
  }

  const html = await fs.readFile(page.filePath, 'utf8');
  return { ...page, html };
}
