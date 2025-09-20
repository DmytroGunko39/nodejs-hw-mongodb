import createHttpError from 'http-errors';

export const notFoundHandler = (req, res, next) => {
  return next(createHttpError.NotFound('Route not found'));
};
