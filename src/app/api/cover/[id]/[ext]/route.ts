import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import path from 'path';
import fs from 'fs/promises';

export async function GET(req: NextRequest, { params }: { params: { id: string; ext: string } }) {
  const session = await auth();
  const whitelist = process.env.WHITELIST?.split(',').map((email) => email.trim()) || [];
  if (!session?.user || !whitelist.includes(session.user.email ?? '')) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id, ext } = await params; // IDE says the await is unnecessary here, it isn't. Otherwise you get Error: Route "/api/cover/[id]/[ext]" used `params.ext`. `params` should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
  const imagePath = path.join(process.cwd(), 'storage', 'books', id, `cover.${ext}`);

  try {
    const image = await fs.readFile(imagePath);
    return new NextResponse(image, {
      headers: { 'Content-Type': `image/${ext}` },
    });
  } catch (err) {
    return new NextResponse('Not found', { status: 404 });
  }
}
