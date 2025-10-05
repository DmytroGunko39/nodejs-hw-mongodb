import { Router } from 'express';
import contactsRouter from './contacts.js';
import authRouter from './auth.js';
import { authenticate } from '../middlewares/authenticate.js';
const router = Router();

router.use('/auth', authRouter);
router.use('/contacts', authenticate, contactsRouter);

export default router;
