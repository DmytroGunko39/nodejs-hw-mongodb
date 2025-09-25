import { SORT_ORDER } from '../constants/index.js';
import { ContactsCollection } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactsQuery = ContactsCollection.find();
  // const contactsCount = await ContactsCollection.find()
  //   .merge(contactsQuery)
  //   .countDocuments();

  // const contacts = await contactsQuery
  //   .skip(skip)
  //   .limit(limit)
  //   .sort({ [sortBy]: sortOrder })
  //   .exec();
  //?Refactoring code:
  const [contactsCount, contacts] = await Promise.all([
    ContactsCollection.find().merge(contactsQuery).countDocuments(),
    contactsQuery
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .exec(),
  ]);

  const paginationData = calculatePaginationData(contactsCount, perPage, page);

  return {
    data: contacts,
    ...paginationData,
  };
};

export const getContactById = async (contactId) => {
  const contact = await ContactsCollection.findById(contactId);
  return contact;
};

export const createContact = async (payload) => {
  const contact = await ContactsCollection.create(payload);
  return contact;
};

export const deleteContact = async (contactId) => {
  const contact = await ContactsCollection.findByIdAndDelete(contactId);
  return contact;
};

export const replaceContact = async (contactId, payload, options = {}) => {
  const newResult = await ContactsCollection.findByIdAndUpdate(
    contactId,
    payload,
    {
      new: true,
      upsert: true, //create a new document if there does not have any
      includeResultMetadata: true,
      ...options,
    },
  );
  if (!newResult || !newResult.value) return null;

  return {
    contact: newResult.value,
    isNew: Boolean(newResult?.lastErrorObject?.upserted),
  };
};

export const updateContact = async (contactId, payload) => {
  return ContactsCollection.findByIdAndUpdate(contactId, payload, {
    new: true,
  });
};
