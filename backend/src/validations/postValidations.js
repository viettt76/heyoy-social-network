const Joi = require('joi');
const validationHandler = require('../utils/validationHandler');

const post = (req, res, next) => {
  const correctValidation = Joi.object({
    visibility: Joi.number().required(),
    content: Joi.string().max(256).allow(''),
    images: Joi.array().items().empty(Joi.array().length(0)),
  });

  validationHandler(correctValidation, req.body, res, next);
};

const releaseEmotion = (req, res, next) => {
  const correctValidation = Joi.object({
    emotionId: Joi.number().integer().required(),
    postId: Joi.string().uuid().required(),
  });

  validationHandler(
    correctValidation,
    { ...req.body, ...req.params },
    res,
    next
  );
};

const cancelReleasedEmotion = (req, res, next) => {
  const correctValidation = Joi.object({
    postId: Joi.string().uuid().required(),
  });

  validationHandler(correctValidation, req.params, res, next);
};

const getUserPosts = (req, res, next) => {
  const correctValidation = Joi.object({
    userId: Joi.string().uuid().required(),
  });

  validationHandler(correctValidation, req.params, res, next);
};

const getComments = (req, res, next) => {
  const correctValidation = Joi.object({
    postId: Joi.string().uuid().required(),
    sortField: Joi.string().allow(''),
    sortType: Joi.string().allow(''),
  });

  validationHandler(
    correctValidation,
    { ...req.params, ...req.query },
    res,
    next
  );
};

const comment = (req, res, next) => {
  const correctValidation = Joi.object({
    postId: Joi.string().uuid().required(),
    parentCommentId: Joi.string().uuid().allow(null),
    content: Joi.string().max(256).allow(''),
  });

  validationHandler(correctValidation, req.body, res, next);
};

module.exports = {
  post,
  releaseEmotion,
  cancelReleasedEmotion,
  getUserPosts,
  getComments,
  comment,
};
