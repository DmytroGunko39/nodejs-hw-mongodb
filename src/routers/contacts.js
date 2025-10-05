import { Router } from 'express';
import {
  getContactByIdController,
  getContactsController,
  createContactController,
  deleteContactController,
  upsertContactController,
  patchContactsController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../validation/contacts.js';
// import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

// router.use(authenticate);
router.get('/', ctrlWrapper(getContactsController));
router.get('/:contactId', isValidId, ctrlWrapper(getContactByIdController));
router.post(
  '/',
  validateBody(createContactSchema),
  ctrlWrapper(createContactController),
);
router.delete('/:contactId', isValidId, ctrlWrapper(deleteContactController));
router.put(
  '/:contactId',
  isValidId,
  validateBody(createContactSchema),
  ctrlWrapper(upsertContactController),
);
router.patch(
  '/:contactId',
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(patchContactsController),
);

export default router;
