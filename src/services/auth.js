import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';
import { UserCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';

export const registerUser = async (payload) => {
  const user = await UserCollection.findOne({ email: payload.email });
  if (user) throw createHttpError(409, 'Email in use!');

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  return await UserCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

//*The session "refresh logic" is part of the token authorization mechanism.
const createSession = () => {
  return {
    accessToken: randomBytes(30).toString('base64'),
    refreshToken: randomBytes(30).toString('base64'),
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

//*Login function: Authentication
export const loginUser = async (payload) => {
  const user = await UserCollection.findOne({ email: payload.email });
  if (!user) throw createHttpError(401, 'User not found');

  const isEqual = await bcrypt.compare(payload.password, user.password);
  if (!isEqual) {
    throw createHttpError(401, 'User not found');
  }

  await SessionsCollection.deleteOne({ userId: user._id });

  const newSession = createSession();

  return SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });
};

//*Logout function
export const logOutUser = async (sessionId, refreshToken) => {
  await SessionsCollection.deleteOne({
    _id: sessionId,
    refreshToken,
  });
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  //*#1 Search for an existing session:
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }
  //*#2 Checking the session token expiration date:
  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  //*#3 Creating a new session:
  const newSession = createSession();

  await SessionsCollection.deleteOne({
    _id: sessionId,
    refreshToken,
  });

  //*#4 Saving a new session in the DB:
  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};
