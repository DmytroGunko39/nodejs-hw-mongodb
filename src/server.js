import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { getEnvVar } from './utils/getEnvVar.js';
import { getAllContacts, getContactById } from './services/contacts.js';

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
  app.use(express.json());

  app.get('/contacts', async (req, res) => {
    const contacts = await getAllContacts();
    res.json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  });

  app.get('/contacts/:contactId', async (req, res) => {
    const { contactId } = req.params;

    //Checking for right Id-format
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid contact id format',
      });
    }

    const contact = await getContactById(contactId);
    if (!contact) {
      res.json({
        status: 404,
        message: 'Contact not found',
      });
      return;
    }
    res.json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  });

  //! Middleware for error handling (takes 4 arguments)
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  app.use((err, req, res) => {
    res.status(500).json({
      message: 'Something went wrong',
      error: err.message,
    });
  });

  app.use((req, res) => {
    res.status(404).json({
      status: 404,
      message: 'Not found',
    });
  });
};
