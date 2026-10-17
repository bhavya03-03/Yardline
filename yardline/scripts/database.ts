import './env';
import { database } from '../src/server/db';
import { resetDemo, seedDemo } from '../src/server/seed';
const command = process.argv[2] ?? 'setup';
try {
  await database().setup();
  if (command === 'seed') await database().transaction(seedDemo);
  else if (command === 'reset') {
    if (!process.argv.includes('--confirm-demo-reset'))
      throw new Error('Pass --confirm-demo-reset to explicitly reset the local demo.');
    await database().transaction(resetDemo);
  } else if (command !== 'setup') throw new Error('Use setup, seed, or reset.');
  console.log(`Database ${command} complete (${database().mode}).`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await database().close();
}
