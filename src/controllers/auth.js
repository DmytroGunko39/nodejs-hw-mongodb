import { THIRTY_DAYS } from '../constants/index.js';
import {
  loginUser,
  logOutUser,
  refreshUsersSession,
  registerUser,
} from '../services/auth.js';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in a user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logOutUserController = async (req, res) => {
  if (req.cookies.sessionId && req.cookies.refreshToken) {
    await logOutUser(req.cookies.sessionId, req.cookies.refreshToken);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.send(204).send();
};

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
};

//*Process of updating the user session and interacting with the client via HTTP:
export const refreshUserSessionController = async (req, res) => {
  //Session refresh
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });
  //Setting new cookies
  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};
