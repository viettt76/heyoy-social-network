const { AppDataSource } = require('../data-source');
const { Post } = require('../entity/Post');
const { PictureOfPost } = require('../entity/PictureOfPost');
const { Relationship } = require('../entity/Relationship');
const { User } = require('../entity/User');
const { EmotionType } = require('../entity/EmotionType');
const { EmotionPost } = require('../entity/EmotionPost');
const { Comment } = require('../entity/Comment');
const ApiError = require('../utils/ApiError');

const postRepository = AppDataSource.getRepository(Post);
const pictureOfPostRepository = AppDataSource.getRepository(PictureOfPost);
const emotionTypeRepository = AppDataSource.getRepository(EmotionType);
const emotionPostRepository = AppDataSource.getRepository(EmotionPost);
const relationshipRepository = AppDataSource.getRepository(Relationship);
const userRepository = AppDataSource.getRepository(User);
const commentRepository = AppDataSource.getRepository(Comment);

class PostController {
  constructor() {}
  // [POST] /posts
  async post(req, res, next) {
    const { io } = req;
    const { id } = req.userToken;
    const { visibility, content, images } = req.body;
    const post = await postRepository.save({
      poster: id,
      visibilityTypeId: visibility,
      content: content,
    });

    if (images?.length > 0) {
      await Promise.all(
        images.map((image) => {
          pictureOfPostRepository.save({
            postId: post?.id,
            picture: image,
          });
        })
      );
    }

    const friends = await relationshipRepository
      .createQueryBuilder('relationship')
      .select(
        'CASE WHEN relationship.user1 = :currentUserId THEN relationship.user2 ELSE relationship.user1 END',
        'friendId'
      )
      .where(
        '(relationship.user1 = :currentUserId OR relationship.user2 = :currentUserId)'
      )
      .setParameters({ currentUserId: id })
      .getRawMany();

    const userInfo = await userRepository.findOne({
      where: { id },
      select: {
        firstName: true,
        lastName: true,
        avatar: true,
      },
    });

    const picturesOfPost = await pictureOfPostRepository
      .createQueryBuilder('picture')
      .select(['picture.id', 'picture.picture AS pictureUrl'])
      .where('picture.postId = :postId', { postId: post.id })
      .getRawMany();

    friends.forEach((friend) => {
      io.to(`user-${friend.friendId}`).emit('newPost', {
        id: post.id,
        posterId: id,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        avatar: userInfo.avatar,
        groupName: '',
        createdAt: post.createdAt,
        visibility: post.visibility,
        content: post.content,
        emotions: [],
        pictures: picturesOfPost,
      });
    });

    io.to(`user-${id}`).emit('myNewPost', {
      id: post.id,
      posterId: id,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      avatar: userInfo.avatar,
      groupName: '',
      createdAt: post.createdAt,
      visibility: post.visibility,
      content: post.content,
      emotions: [],
      pictures: picturesOfPost,
    });

    res.status(201).json();
  }

  // [GET] /posts
  async getAll(req, res, next) {
    const { id } = req.userToken;

    const posts = await postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect(PictureOfPost, 'picture', 'picture.postId = post.id')
      .innerJoin(User, 'user', 'user.id = post.poster')
      .select([
        'post.id as id',
        'post.poster as posterId',
        'user.firstName as firstName',
        'user.lastName as lastName',
        'user.avatar as avatar',
        'post.visibility as visibility',
        'post.content as content',
        'post.createdAt as createdAt',
        "CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', picture.id, 'pictureUrl', picture.picture)), ']') as pictures",
      ])
      .addSelect((qb) => {
        return qb
          .subQuery()
          .from(EmotionPost, 'ep')
          .leftJoin(EmotionType, 'et', 'et.id = ep.emotionTypeId')
          .select('et.id')
          .where('ep.userId = :userId AND ep.postId = post.id', {
            userId: id,
          });
      }, 'currentEmotionId')
      .addSelect((qb) => {
        return qb
          .subQuery()
          .from(EmotionPost, 'ep')
          .leftJoin(EmotionType, 'et', 'et.id = ep.emotionTypeId')
          .select('et.name')
          .where('ep.userId = :userId AND ep.postId = post.id', {
            userId: id,
          });
      }, 'currentEmotionName')
      .where((qb) => {
        const subQuery1 = qb
          .subQuery()
          .select('r.user2')
          .from(Relationship, 'r')
          .where('r.user1 = :id', { id })
          .getQuery();

        const subQuery2 = qb
          .subQuery()
          .select('r.user1')
          .from(Relationship, 'r')
          .where('r.user2 = :id', { id })
          .getQuery();

        return `post.poster IN (${subQuery1}) OR post.poster IN (${subQuery2})`;
      })
      .groupBy('post.id')
      .orderBy('post.createdAt', 'DESC')
      .take(10)
      .getRawMany();

    const result = await Promise.all(
      posts.map(async (post) => {
        const emotions = await emotionPostRepository.find({
          relations: ['emotion', 'userInfo'],
          where: { postId: post.id },
          select: {
            id: true,
            emotion: {
              id: true,
              name: true,
            },
            userInfo: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        });
        return {
          ...post,
          emotions,
          pictures:
            JSON.parse(post.pictures)[0]?.id === null
              ? []
              : JSON.parse(post.pictures),
        };
      })
    );

    return res.status(200).json(result);
  }

  // [GET] /posts/emotions
  async getEmotions(req, res, next) {
    const emotions = await emotionTypeRepository.find();

    return res.status(200).json(emotions);
  }

  // [PUT] /posts/emotion/:postId
  async releaseEmotion(req, res, next) {
    const { io } = req;
    const { id } = req.userToken;
    const { emotionId } = req.body;
    const { postId } = req.params;

    const emotionPost = await emotionPostRepository.findOne({
      where: { postId, userId: id },
    });

    if (emotionPost) {
      emotionPost.emotionTypeId = emotionId;
      await emotionPostRepository.save(emotionPost);

      const emotionName = await emotionTypeRepository.findOne({
        where: { id: emotionId },
        select: {
          name: true,
        },
      });

      io.emit('updateEmotion', {
        id: emotionPost.id,
        postId,
        emotionTypeId: emotionId,
        emotionTypeName: emotionName.name,
      });

      return res.status(200).json();
    } else {
      const userInfo = await userRepository.findOne({
        where: { id },
        select: {
          firstName: true,
          lastName: true,
          avatar: true,
        },
      });

      const newEmoPost = await emotionPostRepository.save({
        postId,
        userId: id,
        emotionTypeId: emotionId,
      });

      const emotionName = await emotionTypeRepository.findOne({
        where: { id: emotionId },
        select: {
          name: true,
        },
      });

      io.emit('releaseEmotion', {
        id: newEmoPost.id,
        postId,
        userId: id,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        avatar: userInfo.avatar,
        emotionTypeId: emotionId,
        emotionTypeName: emotionName.name,
      });
      return res.status(201).json();
    }
  }

  // [DELETE] /posts/emotion/:postId
  async cancelReleasedEmotion(req, res, next) {
    const { io } = req;
    const { id } = req.userToken;
    const { postId } = req.params;

    const emotionPost = await emotionPostRepository.findOne({
      where: {
        userId: id,
        postId: postId,
      },
    });

    if (emotionPost) {
      await emotionPostRepository.remove(emotionPost);

      io.emit('cancelReleasedEmotion', {
        postId,
        userId: id,
      });

      return res.status(204).json();
    }

    throw new ApiError(404, 'Not found this emotion post');
  }

  // [GET] /posts/user/:userId
  async getUserPosts(req, res, next) {
    const { userId } = req.params;

    const posts = await postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect(PictureOfPost, 'picture', 'picture.postId = post.id')
      .innerJoin(User, 'user', 'user.id = post.poster')
      .select([
        'post.id as id',
        'post.poster as posterId',
        'user.firstName as firstName',
        'user.lastName as lastName',
        'user.avatar as avatar',
        'post.visibility as visibility',
        'post.content as content',
        'post.createdAt as createdAt',
        "CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', picture.id, 'pictureUrl', picture.picture)), ']') as pictures",
      ])
      .addSelect((qb) => {
        return qb
          .subQuery()
          .from(EmotionPost, 'ep')
          .leftJoin(EmotionType, 'et', 'et.id = ep.emotionTypeId')
          .select('et.id')
          .where('ep.userId = :userId AND ep.postId = post.id', {
            userId,
          });
      }, 'currentEmotionId')
      .addSelect((qb) => {
        return qb
          .subQuery()
          .from(EmotionPost, 'ep')
          .leftJoin(EmotionType, 'et', 'et.id = ep.emotionTypeId')
          .select('et.name')
          .where('ep.userId = :userId AND ep.postId = post.id', {
            userId,
          });
      }, 'currentEmotionName')
      .where('post.poster = :id', { id: userId })
      .groupBy('post.id')
      .orderBy('post.createdAt', 'DESC')
      .take(10)
      .getRawMany();

    const result = await Promise.all(
      posts.map(async (post) => {
        const emotions = await emotionPostRepository.find({
          relations: ['emotion', 'userInfo'],
          where: { postId: post.id },
          select: {
            id: true,
            emotion: {
              id: true,
              name: true,
            },
            userInfo: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        });
        return {
          ...post,
          emotions,
          pictures:
            JSON.parse(post.pictures)[0]?.id === null
              ? []
              : JSON.parse(post.pictures),
        };
      })
    );

    return res.status(200).json(result);
  }

  // [GET] /posts/comments/:postId
  async getComments(req, res, next) {
    const { postId } = req.params;
    const { sortField, sortType } = req.query;

    const nestComments = (comments) => {
      const commentMap = {};
      const nestedComments = [];

      comments.forEach((comment) => {
        comment.children = [];
        commentMap[comment.id] = comment;
      });

      comments.forEach((comment) => {
        if (comment.parentCommentId) {
          const id = comment.parentCommentId;
          delete comment.parentCommentId;
          commentMap[id].children.push(comment);
        } else {
          delete comment.parentCommentId;
          nestedComments.push(comment);
        }
      });

      return nestedComments;
    };

    const comments = await commentRepository.find({
      where: {
        postId,
      },
      relations: ['commentatorInfo'],
      select: {
        id: true,
        parentCommentId: true,
        content: true,
        createdAt: true,
        commentatorInfo: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      order: {
        [sortField || 'createdAt']: sortType || 'DESC',
      },
    });

    const numberOfComments = comments.length;

    const result = nestComments(comments);

    return res.status(200).json({ comments: result, numberOfComments });
  }

  // [POST] /posts/comment
  async comment(req, res, next) {
    const { io } = req;
    const { id } = req.userToken;
    const { postId, parentCommentId, content } = req.body;

    const newComment = await commentRepository.save({
      postId,
      commentator: id,
      parentCommentId: parentCommentId ? parentCommentId : null,
      content,
    });

    const commentDetails = await commentRepository.findOne({
      where: { id: newComment.id },
      relations: ['commentatorInfo'],
      select: {
        id: true,
        content: true,
        createdAt: true,
        commentatorInfo: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    });

    if (parentCommentId) {
      io.to(`post-${postId}`).emit('newChildComment', {
        postId,
        id: commentDetails.id,
        content: commentDetails.content,
        parentCommentId,
        commentatorInfo: commentDetails.commentatorInfo,
        createdAt: commentDetails.createdAt,
        children: [],
      });
    } else {
      io.to(`post-${postId}`).emit('newComment', {
        postId,
        id: commentDetails.id,
        content: commentDetails.content,
        commentatorInfo: commentDetails.commentatorInfo,
        createdAt: commentDetails.createdAt,
        children: [],
      });
    }

    io.emit('newComment-numberOfComments', postId);

    return res.status(201).json();
  }
}

module.exports = new PostController();
