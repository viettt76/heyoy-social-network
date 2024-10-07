const { AppDataSource } = require('../data-source');
const { Message } = require('../entity/Message');
const { Relationship } = require('../entity/Relationship');
const { GroupChat } = require('../entity/GroupChat');
const { GroupMember } = require('../entity/GroupMember');
const { User } = require('../entity/User');
const { Notifications } = require('../entity/Notifications');
const { NotificationType } = require('../entity/NotificationType');
const { ApiError } = require('../utils/ApiError');

const relationshipRepository = AppDataSource.getRepository(Relationship);
const messageRepository = AppDataSource.getRepository(Message);
const groupChatRepository = AppDataSource.getRepository(GroupChat);
const groupMemberRepository = AppDataSource.getRepository(GroupMember);
const notificationsRepository = AppDataSource.getRepository(Notifications);
const notificationTypeRepository =
  AppDataSource.getRepository(NotificationType);

class ChatController {
  // [GET] /chat/messages?friendId=
  async getMessages(req, res, next) {
    const { id } = req.userToken;
    const { friendId } = req.query;
    const messages = await messageRepository
      .createQueryBuilder('message')
      .select([
        'message.id as id',
        'message.sender as sender',
        'message.receiver as receiver',
        'message.message as message',
        'message.createdAt as createdAt',
      ])
      .where(
        `(sender = :id AND receiver = :friendId) OR (sender = :friendId AND receiver = :id)`
      )
      .setParameters({ id, friendId })
      .orderBy('message.createdAt')
      .getRawMany();

    res.status(200).json(messages);
  }

  // [POST] /chat/message
  async sendMessage(req, res, next) {
    const { io } = req;
    const { id, firstName, lastName } = req.userToken;
    const { friendId, message } = req.body;
    const newMessage = await messageRepository.save({
      sender: id,
      receiver: friendId,
      message: message,
    });

    // const notificationTypes = await notificationTypeRepository.find();

    // const notification = await notificationsRepository.save({
    //   userId: friendId,
    //   senderId: id,
    //   type: notificationTypes.find((type) => type.name === 'message')?.id,
    //   relatedId: newMessage.id,
    //   content: `${lastName} ${firstName} đã gửi cho bạn 1 tin nhắn`,
    // });

    io.to(`user-${friendId}`).emit('newMessage', { newMessage });

    res.status(201).json({
      id: newMessage.id,
    });
  }

  // [POST] /chat/group-chat
  async createGroupChat(req, res, next) {
    const { io } = req;
    const { id } = req.userToken;
    const { name, avatar, members } = req.body;

    const newGroupChat = await groupChatRepository.save({
      name: name,
      avatar: avatar,
      administratorId: id,
    });

    await groupMemberRepository.save({
      groupChatId: newGroupChat.id,
      memberId: id,
    });

    members.forEach(async (memberId) => {
      await groupMemberRepository.save({
        groupChatId: newGroupChat.id,
        memberId: memberId,
      });
    });

    res.status(201).json();
  }

  // [GET] /chat/group-chat
  async getGroupChats(req, res, next) {
    const { id } = req.userToken;

    const groupChats = await groupChatRepository
      .createQueryBuilder('gc')
      .select([
        'gc.id as id',
        'gc.name as name',
        'gc.avatar as avatar',
        'gc.administratorId as administratorId',
      ])
      .leftJoin(GroupMember, 'gm', 'gm.groupChatId = gc.id')
      .where('gm.memberId = :id', { id })
      .getRawMany();

    res.status(200).json(groupChats);
  }

  // [GET] /chat/group-chat/messages/:groupChatId
  async getMessagesOfGroupChat(req, res, next) {
    const { groupChatId } = req.params;

    const messages = await messageRepository
      .createQueryBuilder('message')
      .leftJoin(User, 'sender', 'sender.id = message.sender')
      .select([
        'message.id as id',
        'message.sender as sender',
        'message.message as message',
        'sender.id as senderId',
        'sender.firstName as senderFirstName',
        'sender.lastName as senderLastName',
        'sender.avatar as senderAvatar',
        'message.createdAt as createdAt',
      ])
      .where('recipientGroup = :groupChatId', { groupChatId })
      .orderBy('message.createdAt')
      .getRawMany();

    res.status(200).json(messages);
  }

  // [POST] /chat/group-chat/message
  async sendGroupChatMessage(req, res, next) {
    const { io } = req;
    const { id } = req.userToken;

    const { groupChatId, message, picture } = req.body;

    const newMessage = await messageRepository.save({
      sender: id,
      recipientGroup: groupChatId,
      message,
      picture,
    });

    const newGroupChatMessage = await messageRepository
      .createQueryBuilder('message')
      .leftJoin(User, 'sender', 'sender.id = message.sender')
      .select([
        'message.id as id',
        'message.sender as sender',
        'message.message as message',
        'sender.id as senderId',
        'sender.firstName as senderFirstName',
        'sender.lastName as senderLastName',
        'sender.avatar as senderAvatar',
        'message.createdAt as createdAt',
      ])
      .where('message.id = :id', { id: newMessage.id })
      .getRawOne();

    io.to(`group-chat-${groupChatId}`)
      .except(`user-${id}`)
      .emit('newGroupChatMessage', newGroupChatMessage);

    res.status(201).json();
  }

  // [GET] /chat/group-chat/members
  async getGroupMembers(req, res, next) {
    const { groupChatId } = req.params;

    const members = await groupMemberRepository.find({
      relations: ['user'],
      where: {
        groupChatId: groupChatId,
      },
      select: {
        id: true,
        memberId: true,
        user: {
          id: true,
          lastName: true,
          firstName: true,
          avatar: true,
        },
      },
    });

    res.status(200).json(members);
  }

  // [POST] /chat/group-chat/members
  async updateGroupMembers(req, res, next) {
    const { groupChatId, members } = req.body;

    await Promise.all(
      members?.map((member) => {
        groupMemberRepository.save({
          groupChatId,
          memberId: member,
        });
      })
    );

    res.status(201).json();
  }

  // [DELETE] /chat/group-chat/member/:groupChatId
  async leaveGroup(req, res, next) {
    const { id } = req.userToken;
    const { groupChatId } = req.params;

    const groupMember = await groupMemberRepository.findOne({
      where: { memberId: id, groupChatId },
    });

    if (groupMember) {
      await groupMemberRepository.remove(groupMember);
      return res.status(204).json();
    }

    throw new ApiError(404, 'Not found group member');
  }

  // [GET] /chat/latest
  async getLatestConversation(req, res, next) {
    const { id } = req.userToken;

    const privateConversations = await messageRepository
      .createQueryBuilder('message')
      .leftJoin(
        User,
        'friend',
        '(friend.id = message.receiver OR friend.id = message.sender) AND friend.id != :id',
        { id }
      )
      .select([
        'LEAST(message.sender, message.receiver) AS participant1',
        'GREATEST(message.sender, message.receiver) AS participant2',
        'friend.id AS friendId',
        'friend.firstName AS friendFirstName',
        'friend.lastName AS friendLastName',
        'friend.avatar AS friendAvatar',
        'message.id as id',
        'message.sender as senderId',
        'message.message as message',
        'message.picture as picture',
        'message.createdAt AS createdAt',
      ])
      .where(
        '(message.sender = :userId OR message.receiver = :userId) AND recipientGroup IS NULL',
        {
          userId: id,
        }
      )
      .andWhere(
        'message.createdAt IN ' +
          `(SELECT MAX(createdAt) FROM message 
          WHERE (sender = :userId OR receiver = :userId)
          GROUP BY LEAST(sender, receiver), GREATEST(sender, receiver))`,
        { userId: id }
      )
      .groupBy('participant1, participant2')
      .orderBy('message.createdAt', 'DESC')
      .getRawMany();

    const groupConversations = await messageRepository
      .createQueryBuilder('message')
      .innerJoin(
        GroupMember,
        'groupMember',
        'groupMember.groupChatId = message.recipientGroup'
      )
      .leftJoin(GroupChat, 'groupChat', 'groupChat.id = message.recipientGroup')
      .leftJoin(User, 'sender', 'message.sender = sender.id')
      .select([
        'message.id as id',
        'message.message as message',
        'message.picture as picture',
        'message.recipientGroup as groupId',
        'groupChat.administratorId as administratorId',
        'groupChat.name as groupName',
        'groupChat.avatar as groupAvatar',
        'sender.id as senderId',
        'sender.firstName as senderFirstName',
        'sender.lastName as senderLastName',
        'message.createdAt as createdAt',
      ])
      .where('groupMember.memberId = :userId', { userId: id })
      .andWhere('message.recipientGroup IS NOT NULL')
      .andWhere(
        'message.createdAt = (SELECT MAX(innerMsg.createdAt) FROM message innerMsg WHERE innerMsg.recipientGroup = message.recipientGroup)'
      )
      .orderBy('message.createdAt', 'DESC')
      .getRawMany();

    const combinedConversations = [
      ...privateConversations,
      ...groupConversations,
    ];

    combinedConversations.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.status(200).json(combinedConversations);
  }

  // [PATCH] /chat/group-chat/avatar/:groupChatId
  async updateGroupChatAvatar(req, res, next) {
    const { groupChatId } = req.params;
    const { avatar } = req.body;

    const groupChat = await groupChatRepository.findOne({
      where: {
        id: groupChatId,
      },
    });

    if (groupChat) {
      groupChat.avatar = avatar;

      await groupChatRepository.save(groupChat);

      res.status(204).json();
    }

    throw new ApiError(404, 'Not found group chat');
  }
}

module.exports = new ChatController();
