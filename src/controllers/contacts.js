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
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const getContactsController = async (req, res, next) => {
  try {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(req.query);
    const filter = parseFilterParams(req.query);

    const contacts = await getAllContacts({
      page,
      perPage,
      sortBy,
      sortOrder,
      filter,
      userId: req.user._id,
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
  const userId = req.user._id;

  const contact = await getContactById(contactId, userId);

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
  const userId = req.user._id;
  const photo = req.file;

  let photoUrl;

  if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
    photoUrl = await saveFileToCloudinary(photo);
  } else {
    photoUrl = await saveFileToUploadDir(photo);
  }

  const contact = await createContact(
    {
      ...req.body,
      photo: photoUrl,
    },
    userId,
  );

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: contact,
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const contact = await deleteContact({ contactId, userId });

  if (!contact) {
    throw new createHttpError.NotFound('Contact not found');
  }
  res.status(204).end();
};

export const upsertContactController = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;

  const resultContact = await replaceContact(contactId, req.body, userId);

  if (!resultContact) {
    throw new createHttpError.NotFound('Contact not found or access denied');
  }

  const status = resultContact.isNew ? 201 : 200;
  const message = resultContact.isNew
    ? 'Successfully created a contact!'
    : 'Successfully updated a contact!';

  res.status(status).json({
    status,
    message,
    data: resultContact.contact,
  });
};

export const patchContactsController = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const photo = req.file;

  let photoUrl;

  if (photo) {
    if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  const resultContact = await updateContact(contactId, userId, {
    ...req.body,
    photo: photoUrl,
  });

  if (!resultContact) {
    throw new createHttpError.NotFound('Contact not found');
  }

  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: resultContact,
  });
};

// export const patchContactController = async (req, res) => {
//   const { contactId } = req.params;
//   const photo = req.file;

//   let photoUrl;

//   if (photo) {
//     photoUrl = await saveFileToUploadDir(photo);
//   }

//   const result = await updateContact(contactId, {
//     ...req.body,
//     photo: photoUrl,
//   });

//   if (!result) {
//     throw new createHttpError.NotFound(404, 'Contact not found');
//   }

//   res.json({
//     status: 200,
//     message: 'Successfully patched a contact!',
//     data: result.contact,
//   });
// };

/* в photo лежить обʼєкт файлу
		{
		  fieldname: 'photo',
		  originalname: 'download.jpeg',
		  encoding: '7bit',
		  mimetype: 'image/jpeg',
		  destination: '/Users/borysmeshkov/Projects/goit-study/students-app/temp',
		  filename: '1710709919677_download.jpeg',
		  path: '/Users/borysmeshkov/Projects/goit-study/students-app/temp/1710709919677_download.jpeg',
		  size: 7
	  }
	*/
