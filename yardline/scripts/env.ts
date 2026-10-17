import { existsSync } from 'node:fs';
// Match Next's local setup without overwriting variables supplied by the shell.
for (const file of ['.env.local', '.env']) if (existsSync(file)) process.loadEnvFile(file);
