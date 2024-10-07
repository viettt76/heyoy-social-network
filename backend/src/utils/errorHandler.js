require('dotenv').config();

const errorHandler = (error, req, res, next) => {
  const responseError = {
    statusCode: error.statusCode || 500,
    message: error.message || 'INTERNAL_SERVER_ERROR',
    stack: error.stack,
  };
  console.log(responseError);

  if (process.env.BUILD_MODE !== 'dev') delete responseError.stack;

  res.status(responseError.statusCode).json(responseError);
};

module.exports = {
  errorHandler,
};
