const Joi = require('joi');
const validationHandler = require('../utils/validationHandler');

const getMessages = (req, res, next) => {
  const correctValidation = Joi.object({
    friendId: Joi.string().uuid().required(),
  });

  validationHandler(correctValidation, req.query, res, next);
};

const sendMessage = (req, res, next) => {
  const correctValidation = Joi.object({
    friendId: Joi.string().uuid().required(),
    message: Joi.string().allow('', null),
  });

  validationHandler(correctValidation, req.body, res, next);
};

const createGroupChat = (req, res, next) => {
  const correctValidation = Joi.object({
    name: Joi.string().required().trim().strict(),
    avatar: Joi.string().allow('', null),
    members: Joi.array().min(2).items(Joi.string().uuid()),
  });

  validationHandler(correctValidation, req.body, res, next);
};

const getMessagesOfGroupChat = (req, res, next) => {
  const correctValidation = Joi.object({
    groupChatId: Joi.string().uuid().required(),
  });

  validationHandler(correctValidation, req.params, res, next);
};

const sendGroupChatMessage = (req, res, next) => {
  const correctValidation = Joi.object({
    groupChatId: Joi.string().uuid().required(),
    message: Joi.string().allow('', null),
    picture: Joi.string().allow('', null),
  });

  validationHandler(correctValidation, req.body, res, next);
};

const getGroupMembers = (req, res, next) => {
  const correctValidation = Joi.object({
    groupChatId: Joi.string().uuid().required(),
  });

  validationHandler(correctValidation, req.params, res, next);
};

const updateGroupMembers = (req, res, next) => {
  const correctValidation = Joi.object({
    groupChatId: Joi.string().uuid().required(),
    members: Joi.array().items(Joi.string().uuid()),
  });

  validationHandler(correctValidation, req.body, res, next);
};

const leaveGroup = (req, res, next) => {
  const correctValidation = Joi.object({
    groupChatId: Joi.string().uuid().required(),
  });

  validationHandler(correctValidation, req.params, res, next);
};

const updateGroupChatAvatar = (req, res, next) => {
  const correctValidation = Joi.object({
    groupChatId: Joi.string().uuid().required(),
    avatar: Joi.string().required(),
  });

  validationHandler(
    correctValidation,
    { ...req.body, ...req.params },
    res,
    next
  );
};

module.exports = {
  getMessages,
  sendMessage,
  createGroupChat,
  getMessagesOfGroupChat,
  sendGroupChatMessage,
  getGroupMembers,
  updateGroupMembers,
  leaveGroup,
  updateGroupChatAvatar,
};
