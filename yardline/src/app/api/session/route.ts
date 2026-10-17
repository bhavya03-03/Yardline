import { NextResponse } from 'next/server';
import { checkOrigin } from '@/server/auth';
import { failure } from '@/server/http';
import { AppError } from '@/server/validation';
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    if (process.env.AUTH_MODE === 'supabase')
      throw new AppError('FORBIDDEN', 'Demo roles are disabled.', 403);
    const { role } = await request.json();
    if (!['administrator', 'operator', 'viewer'].includes(role))
      throw new AppError('VALIDATION_ERROR', 'Choose a valid demo role.');
    const response = NextResponse.json({ ok: true });
    response.cookies.set('yardline_role', role, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      secure: new URL(request.url).protocol === 'https:',
    });
    return response;
  } catch (error) {
    return failure(error);
  }
}
