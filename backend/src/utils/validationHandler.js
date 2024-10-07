const validationHandler = async (schema, data, res, next) => {
  try {
    await schema.validateAsync(data, { abortEarly: false });
    next();
  } catch (error) {
    console.log(new Error(error));
    res.status(422).json({
      message: error.message,
    });
  }
};

module.exports = validationHandler;
