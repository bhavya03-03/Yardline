import { NextResponse, type NextRequest } from 'next/server';

async function digest(value: string) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
}

export async function proxy(request: NextRequest) {
  const required = process.env.YARDLINE_REQUIRE_ACCESS_GATE === 'true';
  const username = process.env.YARDLINE_ACCESS_USERNAME;
  const password = process.env.YARDLINE_ACCESS_PASSWORD;
  if (!required && !username && !password) return NextResponse.next();

  const headers = {
    'Cache-Control': 'private, no-store',
    'Netlify-CDN-Cache-Control': 'no-store',
  };
  if (!username || !password) {
    return NextResponse.json(
      { error: { code: 'ACCESS_CONFIGURATION', message: 'Deployment access is not configured.' } },
      { status: 503, headers },
    );
  }

  const supplied = (request.headers.get('authorization') ?? '').replace(/^basic\s+/i, 'Basic ');
  const [actual, expected] = await Promise.all([
    digest(supplied),
    digest(`Basic ${btoa(`${username}:${password}`)}`),
  ]);
  let difference = 0;
  for (let i = 0; i < expected.length; i++) difference |= actual[i] ^ expected[i];
  if (difference !== 0) {
    return NextResponse.json(
      { error: { code: 'ACCESS_REQUIRED', message: 'Enter the deployment access credentials.' } },
      {
        status: 401,
        headers: { ...headers, 'WWW-Authenticate': 'Basic realm="Yardline demo", charset="UTF-8"' },
      },
    );
  }

  const response = NextResponse.next();
  for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|ocr/|icon\\.svg|favicon\\.ico).*)'],
};
