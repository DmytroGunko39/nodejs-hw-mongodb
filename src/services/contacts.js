import { SORT_ORDER } from '../constants/index.js';
import { ContactsCollection } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
  userId,
}) => {
  const skip = page > 0 ? (page - 1) * perPage : 0;

  const contactsQuery = ContactsCollection.find({ userId });

  if (filter.contactType) {
    contactsQuery.where('contactType').equals(filter.contactType);
  }

  if (typeof filter.isFavourite === 'boolean') {
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }
  // contactsQuery.clone() = ContactsCollection.find().merge(contactsQuery)
  //*Refactored code:
  const [contactsTotal, contacts] = await Promise.all([
    contactsQuery.clone().countDocuments(),
    contactsQuery
      .skip(skip)
      .limit(perPage)
      .sort({ [sortBy]: sortOrder })
      .exec(),
  ]);

  const paginationData = calculatePaginationData(contactsTotal, perPage, page);

  return {
    data: contacts,
    ...paginationData,
  };
};

export const getContactById = async ({ contactId, userId }) => {
  const contact = await ContactsCollection.findOne({ _id: contactId, userId });
  return contact;
};

export const createContact = async (payload, userId) => {
  const contact = await ContactsCollection.create({
    ...payload,
    userId,
  });
  return contact;
};

export const deleteContact = async ({ contactId, userId }) => {
  const contact = await ContactsCollection.findByIdAndDelete({
    _id: contactId,
    userId,
  });
  return contact;
};

// export const replaceContact = async (contactId, payload, options = {}) => {
//
// const { userId } = options;

//const filter = { _id: contactId, userId };

//   const newResult = await ContactsCollection.findByIdAndUpdate(
//    filter,
//     { ...payload, userId },
//     {
//       new: true,
//       upsert: true, //create a new document if there does not have any
//       includeResultMetadata: true,
//     },
//   );
//   if (!newResult || !newResult.value) return null;

//   return {
//     contact: newResult.value,
//     isNew: Boolean(newResult?.lastErrorObject?.upserted),
//   };
// };

export const replaceContact = async (contactId, payload, options = {}) => {
  const { userId } = options;

  // Security check: verify the contact belongs to the user before updating
  const filter = { _id: contactId, userId };

  // Check if the contact exists and belongs to this user
  const existingContact = await ContactsCollection.findOne(filter);

  if (existingContact) {
    // Contact exists - UPDATE it
    const updatedContact = await ContactsCollection.findOneAndUpdate(
      filter,
      { ...payload, userId }, // Ensure userId stays in the document
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
      },
    );

    return {
      contact: updatedContact,
      isNew: false,
    };
  } else {
    // Contact doesn't exist - CREATE a new one
    // DO NOT use the provided contactId (security risk)
    // Let MongoDB generate a new _id
    const newContact = await ContactsCollection.create({
      ...payload,
      userId, // Ensure the contact belongs to the current user
    });

    return {
      contact: newContact,
      isNew: true,
    };
  }
};

export const updateContact = async (contactId, payload, userId) => {
  return ContactsCollection.findByIdAndUpdate(
    { _id: contactId, userId },
    payload,
    {
      new: true,
    },
  );
};
