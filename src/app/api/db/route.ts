import { auth } from '@/auth';
import { db } from '@/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  const admin = process.env.ADMIN?.split(',').map((email) => email.trim()) || [];
  const isAdmin = admin.includes(session?.user?.email ?? '');
  if (!isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { query } = await req.json();

  try {
    const result = await db.run(query);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Database query error:', error);
    return new NextResponse(error.message, { status: 500 });
  }
}
