import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import dotenv from 'dotenv';
import { getEnvVar } from './utils/getEnvVar.js';
import contactsRouter from './routers/contacts.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

dotenv.config();

const PORT = Number(getEnvVar('PORT', 3000));

export const setupServer = () => {
  const app = express();

  //!pino and pino-pretty app(Logging of requests)
  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );
  //!cors app(exchange information between web resources from different domains)
  app.use(cors());
  app.use(express.json()); //*parse the req.body in app.json content type
  app.use('/contacts', contactsRouter); //* add router to app like a middleware

  //! Middleware for error handling (takes 4 arguments)
  app.listen(PORT, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Server is running on port ${PORT}`);
  });

  //handle 404 error
  app.use(notFoundHandler);
  //handle internal Server error
  app.use(errorHandler);
};
