import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@zeo/db';

function computePolicyPackHash(content: unknown): string {
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

function validatePolicyPackSchema(input: any): { name: string; version: string; description?: string } {
  if (!input || typeof input !== 'object' || typeof input.name !== 'string' || typeof input.version !== 'string') {
    throw new Error('Invalid policy pack. Expected object with string name and version.');
  }

  return {
    name: input.name,
    version: input.version,
    description: typeof input.description === 'string' ? input.description : undefined,
    ...input,
  };
}

export async function GET() {
  const packs = await prisma.policyPack.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(packs);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const content = validatePolicyPackSchema(body);
    const packHash = computePolicyPackHash(content);

    const pack = await prisma.policyPack.upsert({
      where: {
        organizationId_name_version: {
          organizationId: 'default-org',
          name: content.name,
          version: content.version,
        },
      },
      update: {
        contentsJson: JSON.stringify(content),
        packHash,
        description: content.description,
      },
      create: {
        organizationId: 'default-org',
        name: content.name,
        version: content.version,
        description: content.description,
        contentsJson: JSON.stringify(content),
        packHash,
        signingMode: 'none',
      },
    });

    return NextResponse.json(pack);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Policy pack write failed' }, { status: 400 });
  }
}
