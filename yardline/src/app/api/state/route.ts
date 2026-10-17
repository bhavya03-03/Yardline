import { NextResponse } from 'next/server';
import { authenticate, authorize } from '@/server/auth';
import { database } from '@/server/db';
import { failure } from '@/server/http';
import { ready, snapshot } from '@/server/service';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    const subject = await authenticate(request);
    await ready();
    const yardId = new URL(request.url).searchParams.get('yard') ?? undefined;
    const data = await database().transaction(async (tx) => {
      const actor = await authorize(tx, subject, yardId);
      const state = await snapshot(tx, actor, yardId);
      state.actor = await authorize(tx, subject, state.yard.id);
      return state;
    });
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return failure(error);
  }
}
