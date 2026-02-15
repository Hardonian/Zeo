const FALLBACK_SITE_URL = 'https://zeo.dev';
const SITE_NAME = 'Zeo';
const DEFAULT_OG_IMAGE = '/og-image.svg';

function getMetadataBase() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_SITE_URL;
  try {
    return new URL(configuredUrl);
  } catch {
    return new URL(FALLBACK_SITE_URL);
  }
}

function canonicalFromPath(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
}

export function buildMetadata({
  title,
  description,
  canonicalPath,
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
}: {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  noindex?: boolean;
}) {
  const canonical = canonicalFromPath(canonicalPath);

  return {
    metadataBase: getMetadataBase(),
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${SITE_NAME} preview` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function siteMetadataBase() {
  return getMetadataBase();
}
