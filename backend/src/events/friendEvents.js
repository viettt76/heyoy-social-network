const { AppDataSource } = require('../data-source');
const { Relationship } = require('../entity/Relationship');
const { User } = require('../entity/User');

const relationshipRepository = AppDataSource.getRepository(Relationship);
const userRepository = AppDataSource.getRepository(User);

const friendEvents = async (socket, io, client, userToken) => {
  const setUserOnline = async (userId) => {
    try {
      const userKey = `user_online_${userId}`;
      await client.set(userKey, 'true');
    } catch (error) {
      console.error(`Failed to set user ${userId} online:`, error);
    }
  };

  const setUserOffline = async (userId) => {
    await client.del(`user_online_${userId}`);
  };

  const isUserOnline = async (userId) => {
    try {
      const exists = await client.exists(`user_online_${userId}`);
      return exists === 1;
    } catch (error) {
      console.log(error);
    }
  };

  const friendsOnline = async (userId) => {
    const friends = await relationshipRepository
      .createQueryBuilder('relationship')
      .select(
        'CASE WHEN relationship.user1 = :currentUserId THEN relationship.user2 ELSE relationship.user1 END',
        'friendId'
      )
      .where(
        '(relationship.user1 = :currentUserId OR relationship.user2 = :currentUserId)'
      )
      .setParameters({ currentUserId: userId })
      .getRawMany();

    const onlineFriends = [];
    const offlineFriends = [];

    for (const friend of friends) {
      const isOnline = await isUserOnline(friend.friendId);
      if (isOnline) {
        onlineFriends.push(friend.friendId);
      } else {
        offlineFriends.push(friend.friendId);
      }
    }

    const totalFriends = [
      ...onlineFriends.slice(0, 20),
      ...offlineFriends.slice(0, 20 - onlineFriends.length),
    ].slice(0, 20);

    const result = await Promise.all(
      totalFriends.map(async (friendId) => {
        const fr = await userRepository.findOne({
          where: { id: friendId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        });

        const isOnline = await isUserOnline(friendId);

        return {
          ...fr,
          isOnline: isOnline,
        };
      })
    );

    return result;
  };

  await setUserOnline(userToken.id);

  const getFriendsOnline = async () => {
    io.to(`user-${userToken.id}`).emit(
      'friendsOnline',
      await friendsOnline(userToken.id)
    );
  };

  socket.on('getFriendsOnline', () => {
    getFriendsOnline();
  });

  const intervalId = setInterval(() => {
    getFriendsOnline();
  }, 20000);

  socket.on('checkFriendOnline', async (friendId) => {
    const result = await isUserOnline(friendId);
    io.to(`user-${userToken?.id}`).emit('isFriendOnline', result);
  });

  socket.on('disconnect', async () => {
    await setUserOffline(userToken.id);
    clearInterval(intervalId);
  });
};

module.exports = friendEvents;
