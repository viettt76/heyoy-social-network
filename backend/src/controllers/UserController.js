const { AppDataSource } = require('../data-source');
const { User } = require('../entity/User');
const { PictureOfPost } = require('../entity/PictureOfPost');
const ApiError = require('../utils/ApiError');
const { Post } = require('../entity/Post');

const userRepository = AppDataSource.getRepository(User);
const pictureOfPostRepository = AppDataSource.getRepository(PictureOfPost);

class UserController {
  // [GET] /user/my-info
  async getMyInfo(req, res, next) {
    const { id } = req.userToken;

    const user = await userRepository.findOneBy({
      id,
    });

    if (user) {
      res.status(200).json({
        id: user.id,
        lastName: user.lastName,
        firstName: user.firstName,
        birthday: user.birthday,
        homeTown: user.homeTown,
        school: user.school,
        workplace: user.workplace,
        avatar: user.avatar,
      });
    } else {
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      res.status(404).json({
        message: 'The user does not exist',
      });
    }
  }

  // [PUT] /user/my-info
  async updateMyInfo(req, res, next) {
    const { id } = req.userToken;
    const { homeTown, school, workplace, avatar, birthday } = req.body;
    const user = await userRepository.findOneBy({
      id,
    });

    if (user) {
      if (homeTown !== null) user.homeTown = homeTown !== '' ? homeTown : null;
      if (school !== null) user.school = school !== '' ? school : null;
      if (workplace !== null)
        user.workplace = workplace !== '' ? workplace : null;
      if (avatar !== null) user.avatar = avatar;
      if (birthday !== null) user.birthday = birthday;

      await userRepository.save(user);

      return res.status(204).json();
    }

    throw new ApiError(404, "Couldn't update personal info");
  }

  // [GET] /user/user-info
  async getUserInfo(req, res, next) {
    const { userId } = req.params;

    const user = await userRepository.findOneBy({
      id: userId,
    });

    if (user) {
      return res.status(200).json({
        id: user.id,
        lastName: user.lastName,
        firstName: user.firstName,
        birthday: user.birthday,
        homeTown: user.homeTown,
        school: user.school,
        workplace: user.workplace,
        avatar: user.avatar,
      });
    }
    throw new ApiError(404, "Couldn't find user");
  }

  // [GET] /user/pictures/:userId
  async getPictures(req, res, next) {
    const { userId } = req.params;

    const pictures = await pictureOfPostRepository
      .createQueryBuilder('pictures')
      .innerJoin(Post, 'post', 'pictures.postId = post.id')
      .innerJoin(User, 'user', 'post.poster = user.id')
      .where('user.id = :userId', { userId })
      .select(['pictures.id as pictureId', 'pictures.picture as pictureUrl'])
      .getRawMany();

    res.status(200).json(pictures);
  }
}

module.exports = new UserController();
