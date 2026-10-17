import { createClient } from '@supabase/supabase-js';
import type { Actor, Role } from '@/lib/types';
import type { Tx } from './db';
import { demoNames } from './demo-profiles';
import { AppError } from './validation';

export async function authenticate(
  request: Request,
): Promise<{ id: string; name: string; demoRole?: Role }> {
  if (process.env.AUTH_MODE && !['demo', 'supabase'].includes(process.env.AUTH_MODE))
    throw new AppError(
      'AUTH_CONFIGURATION',
      'AUTH_MODE must be demo or supabase. No authentication fallback was used.',
      503,
    );
  if (process.env.AUTH_MODE !== 'supabase') {
    const cookie = request.headers
      .get('cookie')
      ?.match(/(?:^|;\s*)yardline_role=(administrator|operator|viewer)(?:;|$)/)?.[1] as
      Role | undefined;
    const role = cookie ?? 'administrator';
    return {
      id: `demo-${role}`,
      name: demoNames[role],
      demoRole: role,
    };
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key)
    throw new AppError(
      'AUTH_CONFIGURATION',
      'Supabase authentication is not configured. No demo fallback was used.',
      503,
    );
  const token = request.headers.get('authorization')?.replace(/^Bearer /i, '');
  if (!token) throw new AppError('UNAUTHENTICATED', 'Sign in to access your yard.', 401);
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user)
    throw new AppError('UNAUTHENTICATED', 'Your session has expired. Sign in again.', 401);
  return {
    id: data.user.id,
    name: data.user.user_metadata?.display_name ?? data.user.email ?? 'Yard user',
  };
}
export async function authorize(
  tx: Tx,
  subject: Awaited<ReturnType<typeof authenticate>>,
  yardId?: string,
): Promise<Actor> {
  if (subject.demoRole) {
    await tx.run(
      'INSERT INTO user_profiles(id,display_name) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET display_name=excluded.display_name',
      [subject.id, subject.name],
    );
    return { id: subject.id, name: subject.name, role: subject.demoRole };
  }
  const member = yardId
    ? await tx.one<{ role: Role }>(
        'SELECT role FROM yard_memberships WHERE user_id=? AND yard_id=?',
        [subject.id, yardId],
      )
    : await tx.one<{ role: Role }>(
        "SELECT role FROM yard_memberships WHERE user_id=? ORDER BY CASE role WHEN 'administrator' THEN 1 WHEN 'operator' THEN 2 ELSE 3 END LIMIT 1",
        [subject.id],
      );
  if (!member) throw new AppError('FORBIDDEN', 'You do not have a role in this yard.', 403);
  return { id: subject.id, name: subject.name, role: member.role };
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return;
  const targetHost = request.headers.get('host') ?? new URL(request.url).host;
  try {
    const source = new URL(origin);
    if (!['http:', 'https:'].includes(source.protocol) || source.host !== targetHost)
      throw new Error('Origin mismatch');
  } catch {
    throw new AppError('CROSS_ORIGIN', 'Cross-origin mutations are not allowed.', 403);
  }
}
