import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { getUserContext } from '@/lib/console-auth';

export async function POST(request: NextRequest) {
  try {
    const { user } = await getUserContext();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const artifactId = String(body?.artifactId || '');
    if (!artifactId) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    const service = createSupabaseServiceClient();

    const { data: artifact } = await service
      .schema('zeo')
      .from('artifacts')
      .eq('id', artifactId)
      .maybeSingle('id, storage_path, org_id');

    if (!artifact) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { data: member } = await service.schema('zeo').from('org_members').eq('org_id', artifact.org_id).eq('user_id', user.id).maybeSingle('org_id');
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data, error } = await service.storage.from('zeo').createSignedUrl(artifact.storage_path, 60 * 10);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ url: data.signedUrl });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
