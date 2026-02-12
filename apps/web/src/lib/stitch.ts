import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface StitchPageInfo {
  slug: string;
  title: string;
  filePath: string;
  category: string;
}

const STITCH_ROOT = path.join(process.cwd(), 'src/panels/stitch');

// Panel categories for marketing organization
const PANEL_CATEGORIES: Record<string, string> = {
  'stitch_decision_branching_view': 'Decision Intelligence',
  'stitch_oss_governance_dashboard': 'Governance & Compliance',
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function formatTitle(name: string): string {
  // Convert snake_case and kebab-case to readable title
  return name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function findCodeHtmlFiles(dirPath: string): Promise<{ filePath: string; category: string }[]> {
  const results: { filePath: string; category: string }[] = [];
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Check if this directory contains code.html
        const codeHtmlPath = path.join(fullPath, 'code.html');
        try {
          await fs.access(codeHtmlPath);
          // Determine category from parent directory name
          const parentDir = path.basename(dirPath);
          const category = PANEL_CATEGORIES[parentDir] || 'General';
          results.push({ filePath: codeHtmlPath, category });
        } catch {
          // No code.html here, recurse into subdirectories
          const subResults = await findCodeHtmlFiles(fullPath);
          results.push(...subResults);
        }
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }
  
  return results;
}

export async function getStitchPages(): Promise<StitchPageInfo[]> {
  const codeFiles = await findCodeHtmlFiles(STITCH_ROOT);
  const pages: StitchPageInfo[] = [];

  for (const { filePath, category } of codeFiles) {
    const dirName = path.basename(path.dirname(filePath));
    pages.push({
      slug: slugify(dirName),
      title: formatTitle(dirName),
      filePath,
      category,
    });
  }

  return pages.sort((a, b) => {
    // Sort by category first, then by title
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.title.localeCompare(b.title);
  });
}

export async function getStitchPagesByCategory(): Promise<Record<string, StitchPageInfo[]>> {
  const pages = await getStitchPages();
  const byCategory: Record<string, StitchPageInfo[]> = {};
  
  for (const page of pages) {
    if (!byCategory[page.category]) {
      byCategory[page.category] = [];
    }
    byCategory[page.category].push(page);
  }
  
  return byCategory;
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
