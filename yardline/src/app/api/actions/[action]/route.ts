import { NextResponse } from 'next/server';
import { authenticate, authorize, checkOrigin } from '@/server/auth';
import { database } from '@/server/db';
import { failure } from '@/server/http';
import { ready, snapshot } from '@/server/service';
import {
  createYard,
  createZone,
  dispatchContainer,
  generateBlock,
  moveContainer,
  registerContainer,
  updateSlot,
  updateYard,
  verifyContainer,
} from '@/server/operations';
import { AppError } from '@/server/validation';
export const runtime = 'nodejs';
const handlers = {
  register: registerContainer,
  move: moveContainer,
  dispatch: dispatchContainer,
  verify: verifyContainer,
  'generate-block': generateBlock,
  'create-zone': createZone,
  'update-slot': updateSlot,
  'update-yard': updateYard,
  'create-yard': createYard,
};
export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  try {
    checkOrigin(request);
    const subject = await authenticate(request);
    await ready();
    if (Number(request.headers.get('content-length') ?? 0) > 3_000_000)
      throw new AppError(
        'TOO_LARGE',
        'The image is too large. Choose a photograph under 2 MB.',
        413,
      );
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      throw new AppError('INVALID_JSON', 'Send a valid JSON request.', 400);
    }
    if (!body || typeof body !== 'object' || Array.isArray(body))
      throw new AppError('INVALID_JSON', 'Send a JSON object.');
    const { action } = await params;
    const handler = handlers[action as keyof typeof handlers];
    if (!handler) throw new AppError('NOT_FOUND', 'Operation not found.', 404);
    const result = await database().transaction(async (tx) => {
      const yardId = typeof body.yardId === 'string' ? body.yardId : undefined;
      if (action !== 'create-yard' && !yardId)
        throw new AppError('VALIDATION_ERROR', 'yardId is required.', 422);
      const actor = await authorize(tx, subject, yardId);
      const id = await handler(tx, body, actor);
      const state = await snapshot(tx, actor, action === 'create-yard' ? (id as string) : yardId);
      return { state, entityId: id ?? null };
    });
    return NextResponse.json(result);
  } catch (error) {
    return failure(error);
  }
}
