import { PublicShell } from '@/components/site/PublicShell';
import { loadReadyLayerSiteHtml } from '@/lib/readylayer-site';

export default async function PlatformPage() {
  const html = await loadReadyLayerSiteHtml();

  if (!html) {
    return (
      <PublicShell title="Platform resources unavailable">
        <p className="text-gray-700">The vendored static Zeo story layer could not be loaded in this environment.</p>
        <p className="mt-2 text-sm text-gray-600">
          This route expects local assets under <code>vendor/readylayer/site</code> and rebrands them for the Zeo experience.
        </p>
      </PublicShell>
    );
  }

  return (
    <PublicShell title="Zeo platform and enforcement story">
      <p className="mb-4 text-gray-700">
        This page uses vendored static elements and rebrands them into Zeo content so the Zeo product storyline stays consistent.
      </p>
      <div className="rounded border border-gray-200 bg-white p-2">
        <iframe title="Zeo platform story page" srcDoc={html} className="h-[1200px] w-full" sandbox="allow-scripts allow-same-origin" />
      </div>
    </PublicShell>
  );
}
