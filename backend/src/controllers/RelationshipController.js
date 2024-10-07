const { AppDataSource } = require('../data-source');
const { User } = require('../entity/User');
const { Relationship } = require('../entity/Relationship');
const { FriendRequest } = require('../entity/FriendRequest');
const ApiError = require('../utils/ApiError');

const userRepository = AppDataSource.getRepository(User);
const relationshipRepository = AppDataSource.getRepository(Relationship);
const friendRequestRepository = AppDataSource.getRepository(FriendRequest);

class RelationshipController {
  // get common friends
  async commonFriends(userId1, userId2) {
    return await userRepository
      .createQueryBuilder('user')
      .select([
        'user.id as id',
        'user.firstName as firstName',
        'user.lastName as lastName',
        'user.homeTown as homeTown',
        'user.school as school',
        'user.workplace as workplace',
      ])
      .innerJoin(
        Relationship,
        'r1',
        `(r1.user1 = :userId1 AND r1.user2 = user.id)
          OR (r1.user2 = :userId1 AND r1.user1 = user.id)`
      )
      .innerJoin(
        Relationship,
        'r2',
        `(r2.user1 = :userId2 AND r2.user2 = user.id)
          OR (r2.user2 = :userId2 AND r2.user1 = user.id)`
      )
      .setParameters({ userId1, userId2 })
      .getRawMany();
  }

  // [GET] /relationships/friends/:userId
  friends = async (req, res, next) => {
    // const { id } = req.userToken;
    const { userId } = req.params;
    const friends = await userRepository
      .createQueryBuilder('user')
      .select([
        'user.id as id',
        'user.firstName as firstName',
        'user.lastName as lastName',
        'user.homeTown as homeTown',
        'user.school as school',
        'user.workplace as workplace',
        'user.avatar as avatar',
      ])
      .innerJoin(
        Relationship,
        'r',
        '(r.user1 = :id AND r.user2 = user.id) OR (r.user2 = :id AND r.user1 = user.id)',
        { id: userId }
      )
      .getRawMany();

    const result = await Promise.all(
      friends.map(async (user) => {
        const commonFriends = await this.commonFriends(userId, user.id);
        return {
          ...user,
          commonFriends,
          numberOfCommonFriends: commonFriends.length,
        };
      })
    );

    return res.status(200).json(result);
  };

  // [GET] /relationships/suggestion
  async suggestion(req, res, next) {
    const { id: userId } = req.userToken;

    const currentUser = await userRepository.findOne({
      where: { id: userId },
    });

    const suggestions = await userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.homeTown',
        'user.school',
        'user.workplace',
        'user.avatar',
      ])
      .leftJoinAndSelect('user.relationshipAsUser1', 'r1')
      .leftJoinAndSelect('user.relationshipAsUser2', 'r2')
      .where((qb) => {
        const subQuery1 = qb
          .subQuery()
          .select('r.user2')
          .from(Relationship, 'r')
          .where('r.user1 = :userId', { userId })
          .getQuery();

        const subQuery2 = qb
          .subQuery()
          .select('r.user1')
          .from(Relationship, 'r')
          .where('r.user2 = :userId', { userId })
          .getQuery();

        const subQuery3 = qb
          .subQuery()
          .select('fq.receiverId')
          .from(FriendRequest, 'fq')
          .where('fq.senderId = :userId', { userId })
          .getQuery();

        const subQuery4 = qb
          .subQuery()
          .select('fq.senderId')
          .from(FriendRequest, 'fq')
          .where('fq.receiverId = :userId', { userId })
          .getQuery();

        return `user.id NOT IN (${subQuery1}) AND user.id NOT IN (${subQuery2}) AND user.id NOT IN (${subQuery3}) AND user.id NOT IN (${subQuery4})`;
      })
      .andWhere('user.id != :userId', { userId })
      .addSelect((subQuery) => {
        const subQuery1 = subQuery
          .subQuery()
          .select('r.user2')
          .from(Relationship, 'r')
          .where('r.user1 = :userId', { userId })
          .getQuery();

        const subQuery2 = subQuery
          .subQuery()
          .select('r.user1')
          .from(Relationship, 'r')
          .where('r.user2 = :userId', { userId })
          .getQuery();

        return subQuery.subQuery().select('count(*)').from(Relationship, 'r')
          .where(`(r.user1 = user.id AND r.user2 IN (${subQuery1}))
                    OR (r.user1 = user.id AND r.user2 IN (${subQuery2}))
                    OR (r.user2 = user.id AND r.user1 IN (${subQuery1}))
                    OR (r.user2 = user.id AND r.user1 IN (${subQuery2}))
               `);
      }, 'commonFriends')
      .addSelect(
        `(CASE WHEN user.homeTown = :homeTown THEN 1 ELSE 0 END)`,
        'commonHomeTown'
      )
      .addSelect(
        `(CASE WHEN user.school = :school THEN 1 ELSE 0 END)`,
        'commonSchool'
      )
      .addSelect(
        `(CASE WHEN user.workplace = :workplace THEN 1 ELSE 0 END)`,
        'commonWorkplace'
      )
      .setParameters({
        userId,
        homeTown: currentUser?.homeTown || '',
        school: currentUser?.school || '',
        workplace: currentUser?.workplace || '',
      })
      .orderBy('commonFriends', 'DESC')
      .addOrderBy('commonHomeTown', 'DESC')
      .addOrderBy('commonSchool', 'DESC')
      .addOrderBy('commonWorkplace', 'DESC')
      .take(10)
      .getRawMany();

    const formattedSuggestions = suggestions.reduce((acc, cur) => {
      const existingUser = acc.find((u) => u.id === cur.user_id);

      if (existingUser) {
        existingUser.commonFriends.push(
          cur?.r1_id
            ? cur?.user_id === cur?.r1_user1
              ? cur?.r1_user2
              : cur?.r1_user1
            : cur?.user_id === cur?.r2_user1
            ? cur?.r2_user2
            : cur?.r2_user1
        );
      } else {
        acc.push({
          id: cur.user_id,
          firstName: cur.user_firstName,
          lastName: cur.user_lastName,
          homeTown: cur.user_homeTown,
          school: cur.user_school,
          workplace: cur.user_workplace,
          avatar: cur.user_avatar,
          numberOfCommonFriends: parseInt(cur.commonFriends),
          commonFriends:
            parseInt(cur.commonFriends) > 0
              ? [
                  cur?.r1_id
                    ? cur?.user_id === cur?.r1_user1
                      ? cur?.r1_user2
                      : cur?.r1_user1
                    : cur?.user_id === cur?.r2_user1
                    ? cur?.r2_user2
                    : cur?.r2_user1,
                ]
              : [],
        });
      }

      return acc;
    }, []);

    const result = await Promise.all(
      formattedSuggestions.map(async (suggestion) => {
        if (suggestion.numberOfCommonFriends > 0) {
          const friendsDetails = await Promise.all(
            suggestion.commonFriends.map(async (friendId) => {
              return await userRepository.findOne({
                where: { id: friendId },
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              });
            })
          );
          suggestion.commonFriends = friendsDetails;
        }
        return suggestion;
      })
    );

    res.status(200).json(result);
  }

  // [POST] /relationships/request
  request = async (req, res, next) => {
    const { io } = req;
    const { relationship, receiverId } = req.body;
    const { id } = req.userToken;

    if (!relationship || relationship === 1) {
      await friendRequestRepository.save({
        senderId: id,
        receiverId: receiverId,
      });

      const userInfo = await userRepository.findOne({
        where: { id: id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          homeTown: true,
          school: true,
          workplace: true,
        },
      });

      const commonFriends = this.commonFriends(id, receiverId);

      io.to(`user-${receiverId}`).emit('newFriendRequest', {
        ...userInfo,
        commonFriends,
        numberOfCommonFriends: commonFriends?.length,
      });
    } else {
      await relationshipRepository.save({
        user1: id,
        user2: receiverId,
        relationship: relationship,
      });
    }

    return res.status(201).json();
  };

  // [GET] /relationships/request
  friendRequests = async (req, res, next) => {
    const { id } = req.userToken;

    const all = await userRepository
      .createQueryBuilder('user')
      .select([
        'user.id as id',
        'user.firstName as firstName',
        'user.lastName as lastName',
        'user.homeTown as homeTown',
        'user.school as school',
        'user.workplace as workplace',
        'user.avatar as avatar',
      ])
      .innerJoin(
        FriendRequest,
        'fq',
        'fq.receiverId = :receiverId AND fq.senderId = user.id',
        {
          receiverId: id,
        }
      )
      .getRawMany();

    const result = await Promise.all(
      all.map(async (user) => {
        const commonFriends = await this.commonFriends(id, user.id);
        return {
          ...user,
          commonFriends,
          numberOfCommonFriends: commonFriends.length,
        };
      })
    );

    return res.status(200).json(result);
  };

  // [DELETE] /relationships/request/:senderId
  async refuseFriendRequest(req, res, next) {
    const { io } = req;
    const { id } = req.userToken;
    const { senderId } = req.params;

    const friendRequest = await friendRequestRepository.findOne({
      where: {
        senderId: senderId,
        receiverId: id,
      },
    });

    if (friendRequest) {
      await friendRequestRepository.remove(friendRequest);

      io.to(`user-${senderId}`).emit('friendRequestDenied', id);

      return res.status(204).json();
    }

    throw new ApiError(404, 'Not found this friend request');
  }

  // [POST] /relationships/accept
  async accept(req, res, next) {
    const { io } = req;
    const { id } = req.userToken;
    const { friendId } = req.body;

    const existedRelationship = await relationshipRepository.findOne({
      where: [
        { user1: id, user2: friendId },
        { user1: friendId, user2: id },
      ],
    });

    const existedFriendRequest = await friendRequestRepository.findOne({
      where: {
        senderId: friendId,
        receiverId: id,
      },
    });

    if (!existedRelationship && existedFriendRequest) {
      await relationshipRepository.save({
        user1: id,
        user2: friendId,
        relationshipTypeId: 1,
      });

      await friendRequestRepository.remove(existedFriendRequest);

      const currentUserInfo = await userRepository.findOne({
        where: { id: id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          homeTown: true,
          school: true,
          workplace: true,
        },
      });

      io.to(`user-${friendId}`).emit('acceptFriendRequest', currentUserInfo);

      return res.status(200).json();
    }

    throw new ApiError(404, 'Not found this friend request');
  }

  // [DELETE] /relationships/:friendId
  async unfriend(req, res, next) {
    const { io } = req;
    const { id } = req.userToken;
    const { friendId } = req.params;

    const existedRelationship = await relationshipRepository.findOne({
      where: [
        { user1: id, user2: friendId },
        { user1: friendId, user2: id },
      ],
    });

    if (existedRelationship) {
      await relationshipRepository.remove(existedRelationship);

      io.to(`user-${friendId}`).emit('unfriend', id);

      return res.status(204).json();
    }

    throw new ApiError(404, 'Not found this friend');
  }

  // [GET] /relationships/sent-requests
  sentFriendRequests = async (req, res, next) => {
    const { id } = req.userToken;

    const all = await userRepository
      .createQueryBuilder('user')
      .select([
        'user.id as id',
        'user.firstName as firstName',
        'user.lastName as lastName',
        'user.homeTown as homeTown',
        'user.school as school',
        'user.workplace as workplace',
        'user.avatar as avatar',
      ])
      .innerJoin(
        FriendRequest,
        'fq',
        'fq.receiverId = user.id AND fq.senderId = :senderId',
        {
          senderId: id,
        }
      )
      .getRawMany();

    const result = await Promise.all(
      all.map(async (user) => {
        const commonFriends = await this.commonFriends(id, user.id);
        return {
          ...user,
          commonFriends,
          numberOfCommonFriends: commonFriends.length,
        };
      })
    );

    return res.status(200).json(result);
  };

  // [DELETE] /relationships/sent-request
  cancelFriendRequest = async (req, res, next) => {
    const { io } = req;
    const { id } = req.userToken;
    const { receiverId } = req.params;

    const friendRequest = await friendRequestRepository.findOne({
      where: {
        senderId: id,
        receiverId,
      },
    });

    if (friendRequest) {
      await friendRequestRepository.remove(friendRequest);

      io.to(`user-${receiverId}`).emit('cancelFriendRequest', id);

      return res.status(204).json();
    }

    throw new ApiError(404, "Couldn't recall friend request");
  };
}

module.exports = new RelationshipController();
