import {
  getAllContacts,
  getContactById,
  createContact,
  deleteContact,
  replaceContact,
  updateContact,
} from '../services/contacts.js';
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';

export const getContactsController = async (req, res, next) => {
  try {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(req.query);

    const contacts = await getAllContacts({
      page,
      perPage,
      sortBy,
      sortOrder,
    });

    res.json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  } catch (err) {
    next(err);
  }
};

// eslint-disable-next-line no-unused-vars
export const getContactByIdController = async (req, res, next) => {
  const { contactId } = req.params;

  const contact = await getContactById(contactId);
  if (!contact) {
    throw new createHttpError.NotFound('Contact not found');
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const contact = await createContact(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: contact,
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;
  const contact = await deleteContact(contactId);

  if (!contact) {
    throw new createHttpError.NotFound('Contact not found');
  }
  res.status(204).end();
};

export const upsertContactController = async (req, res) => {
  const { contactId } = req.params;

  const resultContact = await replaceContact(contactId, req.body, {
    upsert: true,
  });

  if (!resultContact) {
    throw new createHttpError.NotFound('Contact not found');
  }

  const status = resultContact.isNew ? 201 : 200;

  res.status(status).json({
    status,
    message: `Successfully upserted a contact!`,
    data: resultContact.contact,
  });
};

export const patchContactsController = async (req, res) => {
  const { contactId } = req.params;
  const resultContact = await updateContact(contactId, req.body);

  if (!resultContact) {
    throw new createHttpError.NotFound('Contact not found');
  }

  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: resultContact,
  });
};
