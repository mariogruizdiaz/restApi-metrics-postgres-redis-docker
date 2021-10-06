import {resolve as _resolve} from 'node:path';
import {load} from 'migrate';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import stateStore from '../src/persistence/postgres-state-storage.js';

const migrationsDirectory = _resolve(__dirname, '../src/migrations');

const [command] = process.argv.slice(2);

new Promise((resolve, reject) => {
  load(
    {
      stateStore,
      migrationsDirectory,
    },
    (error, set) => {
      if (error) {
        reject(error);
      }

      if (typeof set[command] !== 'function') {
        reject(new Error('Command is not a function'));
      }

      set[command]((error) => {
        if (error) reject(error);
        resolve();
      });
    },
  );
})
  .then(() => {
    console.log(`migrations "${command}" successfully ran`);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(0);
  })
  .catch((error) => {
    console.error(error.stack);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  });
