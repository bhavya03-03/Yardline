import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import testing from 'next/experimental/testing/server';
import { config, proxy } from '../src/proxy';

const { unstable_doesMiddlewareMatch } = testing;

const keys = [
  'YARDLINE_REQUIRE_ACCESS_GATE',
  'YARDLINE_ACCESS_USERNAME',
  'YARDLINE_ACCESS_PASSWORD',
];
const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
afterEach(() => {
  for (const key of keys) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
});

function configure() {
  process.env.YARDLINE_REQUIRE_ACCESS_GATE = 'true';
  process.env.YARDLINE_ACCESS_USERNAME = 'test-worker';
  process.env.YARDLINE_ACCESS_PASSWORD = 'local-test-credential';
}

test('unconfigured local development keeps its existing access behavior', async () => {
  for (const key of keys) delete process.env[key];
  const response = await proxy(new NextRequest('http://localhost:3000/'));
  assert.equal(response.headers.get('x-middleware-next'), '1');
});

test('required deployment gate fails closed when credentials are missing', async () => {
  configure();
  delete process.env.YARDLINE_ACCESS_PASSWORD;
  const response = await proxy(new NextRequest('https://example.test/api/state'));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.code, 'ACCESS_CONFIGURATION');
});

test('deployment pages and APIs require valid access credentials', async () => {
  configure();
  for (const url of ['/', '/api/state', '/api/actions/register', '/api/session']) {
    for (const authorization of ['', 'Basic ' + btoa('test-worker:wrong-password')]) {
      const response = await proxy(
        new NextRequest('https://example.test' + url, { headers: { authorization } }),
      );
      assert.equal(response.status, 401);
      assert.match(response.headers.get('www-authenticate') ?? '', /^Basic /);
      assert.equal(response.headers.get('cache-control'), 'private, no-store');
      assert.equal((await response.json()).error.code, 'ACCESS_REQUIRED');
    }
  }
});

test('valid access reaches the existing role-protected application without public caching', async () => {
  configure();
  const response = await proxy(
    new NextRequest('https://example.test/api/state', {
      headers: { authorization: 'Basic ' + btoa('test-worker:local-test-credential') },
    }),
  );
  assert.equal(response.headers.get('x-middleware-next'), '1');
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(response.headers.get('netlify-cdn-cache-control'), 'no-store');
  assert.equal(response.headers.has('authorization'), false);
});

test('proxy matches dynamic pages and all API depths while allowing public build assets', () => {
  for (const url of ['/', '/api/state', '/api/actions/move', '/api/containers/test/photo'])
    assert.equal(unstable_doesMiddlewareMatch({ config, url }), true, url);
  for (const url of ['/_next/static/chunk.js', '/ocr/worker.min.js', '/icon.svg'])
    assert.equal(unstable_doesMiddlewareMatch({ config, url }), false, url);
});
