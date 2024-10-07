import clsx from 'clsx';
import { useEffect, useState } from 'react';
import styles from './FriendsList.module.scss';
import socket from '~/socket';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import * as actions from '~/redux/actions';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { getGroupChatsService } from '~/services/chatServices';

const FriendsList = () => {
    const dispatch = useDispatch();

    const [onlineFriends, setOnlineFriends] = useState([]);
    const [myChatGroups, setMyChatGroups] = useState([]);

    useEffect(() => {
        socket.emit('getFriendsOnline');

        const handleFriendOnline = (resOnlineFriends) => {
            setOnlineFriends(resOnlineFriends);
        };
        socket.on('friendsOnline', handleFriendOnline);

        (async () => {
            try {
                const res = await getGroupChatsService();
                setMyChatGroups(res);
            } catch (error) {
                console.log(error);
            }
        })();

        return () => {
            socket.off('friendsOnline', handleFriendOnline);
        };
    }, []);

    const addToChatList = (friend) => {
        dispatch(actions.openChat(friend));
    };

    return (
        <>
            <label className={clsx(styles['btn-show__mobile-label'])} htmlFor="checkbox-show-friends-list">
                <FontAwesomeIcon className={clsx(styles['btn-show__mobile-icon'])} icon={faUserGroup} />
            </label>
            <input
                className={clsx(styles['btn-show__mobile-checkbox'])}
                type="checkbox"
                id="checkbox-show-friends-list"
            />
            <div className={clsx(styles['wrapper'])}>
                <ul className={clsx(styles['friends-list-wrapper'])}>
                    <div className={clsx(styles['title'])}>Bạn bè</div>
                    {onlineFriends?.map((friend, index) => {
                        return (
                            <li
                                key={`friend-${index}`}
                                className={clsx(styles['friend'])}
                                onClick={() => addToChatList(friend)}
                            >
                                <div
                                    className={clsx(styles['friend-avatar'], {
                                        [[styles['is-online']]]: friend?.isOnline,
                                    })}
                                >
                                    <img src={friend?.avatar || defaultAvatar} />
                                </div>
                                <div
                                    className={clsx(styles['friend-name'])}
                                >{`${friend?.lastName} ${friend?.firstName}`}</div>
                            </li>
                        );
                    })}
                </ul>
                <ul className={clsx(styles['friends-list-wrapper'])}>
                    <div className={clsx(styles['title'])}>Nhóm chat</div>
                    {myChatGroups?.map((group, index) => {
                        return (
                            <li
                                key={`friend-${index}`}
                                className={clsx(styles['friend'])}
                                onClick={() => addToChatList({ ...group, isGroupChat: true })}
                            >
                                <div className={clsx(styles['friend-avatar'])}>
                                    <img src={group?.avatar || defaultAvatar} />
                                </div>
                                <div className={clsx(styles['friend-name'])}>{group?.name}</div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </>
    );
};

export default FriendsList;
