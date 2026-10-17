'use client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
let auth: SupabaseClient | undefined;
export function authClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return (auth ??= createClient(url, key));
}
export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const session = await authClient()?.auth.getSession();
  if (session?.data.session)
    headers.set('Authorization', `Bearer ${session.data.session.access_token}`);
  return fetch(path, { ...init, headers, cache: 'no-store' });
}
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await apiFetch(path, init);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message ?? 'The request failed. Please try again.');
  return body as T;
}
export function exportCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
) {
  const escape = (v: string | number | null | undefined) => {
    let s = String(v ?? '');
    if (/^[=+@\-]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  const blob = new Blob(
    ['\uFEFF' + [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n')],
    { type: 'text/csv;charset=utf-8;' },
  );
  const url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
