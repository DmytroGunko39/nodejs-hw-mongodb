import { setupServer } from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';

const start = async () => {
  try {
    await initMongoConnection();
    setupServer();
  } catch (err) {
    console.error('Failed to start app', err);
    process.exit(1);
  }
};
start();
