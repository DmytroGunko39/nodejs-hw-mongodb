import { isHttpError } from 'http-errors';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (isHttpError(err)) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
      data: err,
    });
    return;
  }
  console.error(err);

  res.status(500).json({
    status: 500,
    message: 'Something went wrong',
    error: err.message,
  });
};
