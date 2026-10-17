import { NextResponse } from 'next/server';
import { authenticate, authorize } from '@/server/auth';
import { database } from '@/server/db';
import { failure } from '@/server/http';
import { ready } from '@/server/service';
import { AppError } from '@/server/validation';
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const subject = await authenticate(request);
    await ready();
    const { id } = await params;
    const photo = await database().transaction(async (tx) => {
      const c = await tx.one<{ photo: string | null; current_yard_id: string }>(
        'SELECT photo,current_yard_id FROM containers WHERE id=?',
        [id],
      );
      if (!c?.photo) throw new AppError('NOT_FOUND', 'No photograph attached.', 404);
      await authorize(tx, subject, c.current_yard_id);
      return c.photo;
    });
    const [meta, base64] = photo.split(',');
    return new NextResponse(Buffer.from(base64, 'base64'), {
      headers: {
        'Content-Type': meta.slice(5, -7),
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return failure(error);
  }
}
