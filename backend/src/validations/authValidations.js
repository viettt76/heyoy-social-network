const Joi = require('joi');
const validationHandler = require('../utils/validationHandler');

const signup = (req, res, next) => {
  const correctValidation = Joi.object({
    firstName: Joi.string().max(30).required().trim().strict(),
    lastName: Joi.string().max(30).required().trim().strict(),
    username: Joi.string().max(30).required().trim().strict(),
    password: Joi.string().min(6).max(20).required().trim().strict(),
  });

  validationHandler(correctValidation, req.body, res, next);
};

const login = (req, res, next) => {
  const correctValidation = Joi.object({
    username: Joi.string().max(30).required().trim().strict(),
    password: Joi.string().min(6).max(20).required().trim().strict(),
  });

  validationHandler(correctValidation, req.body, res, next);
};

module.exports = {
  signup,
  login,
};
