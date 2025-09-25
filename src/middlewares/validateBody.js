import createHttpError from 'http-errors';

//? Conspectus example
// export const validateBody = (schema) => async (req, res, next) => {
//   try {
//     await schema.validateAsync(req.body, {
//       abortEarly: false,
//     });
//     next();
//   } catch (err) {
//     const error = createHttpError(400, 'Bad Request', {
//       errors: err.details,
//     });
//     next(error);
//   }
// };

//?Lesson Ex.
export function validateBody(schema) {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body, {
        abortEarly: false,
      });
      next();
    } catch (err) {
      const errors = err.details.map((detail) => detail.message);
      next(
        createHttpError(400, 'Bad Request!', {
          errors,
        }),
      );
    }
  };
}
