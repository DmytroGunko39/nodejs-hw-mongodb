import './loadEnv.js';
import { setupServer } from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';
import { createDirIfNotExists } from './utils/createDirIfNotExists.js';
import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from './constants/index.js';

// const start = async () => {
//   try {
//     await initMongoConnection();
//     setupServer();
//   } catch (err) {
//     console.error('Failed to start app', err);
//     process.exit(1);
//   }
// };
// start();

const bootstrap = async () => {
  try {
    await initMongoConnection();
    await createDirIfNotExists(TEMP_UPLOAD_DIR);
    await createDirIfNotExists(UPLOAD_DIR);
    setupServer();
  } catch (err) {
    console.error('Failed to start app', err);
    process.exit(1);
  }
};

void bootstrap();
