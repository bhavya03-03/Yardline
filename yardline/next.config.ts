import type { NextConfig } from 'next';
const config: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  serverExternalPackages: ['pg'],
  outputFileTracingIncludes: {
    '/api/**': ['./migrations/001_schema.sql'],
  },
  poweredByHeader: false,
  devIndicators: false,
  allowedDevOrigins: ['127.0.0.1'],
};
export default config;
