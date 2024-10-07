const express = require('express');
const userController = require('../controllers/UserController');
const userValidations = require('../validations/userValidations');

const userRouter = (io) => {
  const router = express.Router();

  router.get('/my-info', userController.getMyInfo);
  router.put(
    '/my-info',
    userValidations.updateMyInfo,
    userController.updateMyInfo
  );
  router.get(
    '/user-info/:userId',
    userValidations.getUserInfo,
    userController.getUserInfo
  );
  router.get(
    '/pictures/:userId',
    userValidations.getPictures,
    userController.getPictures
  );

  return router;
};

module.exports = userRouter;
