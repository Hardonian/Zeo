import { loadReadyLayerSiteAsset } from '@/lib/readylayer-site';

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const asset = await loadReadyLayerSiteAsset(path);

  if (!asset) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(new Uint8Array(asset.content), {
    headers: {
      'Content-Type': asset.contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
