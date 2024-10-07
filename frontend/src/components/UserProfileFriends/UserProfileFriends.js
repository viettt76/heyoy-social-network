import { useEffect, useState } from 'react';
import Friend from '~/components/Friend';
import {
    getAllFriendsService,
    getFriendRequestService,
    getSentFriendRequestsService,
    sendFriendRequestService,
} from '~/services/relationshipServices';
import clsx from 'clsx';
import styles from './UserProfileFriends.module.scss';
import { useSelector } from 'react-redux';
import { userInfoSelector } from '~/redux/selectors';

const UserProfileFriends = ({ friends: friendsProp, viewModeAsOther }) => {
    const userInfo = useSelector(userInfoSelector);

    const [friends, setFriends] = useState([]);
    const [myFriends, setMyFriends] = useState([]);
    const [myFriendRequests, setMyFriendRequests] = useState([]);
    const [mySentFriendRequests, setMySentFriendRequests] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                if (userInfo?.id) {
                    const res = await getAllFriendsService(userInfo?.id);
                    setMyFriends(res);
                }
            } catch (error) {
                console.log(error);
            }
        })();
    }, [userInfo?.id]);

    useEffect(() => {
        (async () => {
            try {
                const res = await getFriendRequestService();
                setMyFriendRequests(res);
            } catch (error) {
                console.log(error);
            }
        })();

        (async () => {
            try {
                const res = await getSentFriendRequestsService();
                setMySentFriendRequests(res);
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);

    useEffect(() => {
        setFriends(friendsProp);
    }, [friendsProp]);

    const handleSendFriendRequest = async (id) => {
        try {
            setFriends((prev) => {
                prev.map((item) => (item?.id === id ? { ...item, isSentFriendRequest: true } : item));
            });
            await sendFriendRequestService(id);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            {friends?.length <= 0 ? (
                <div>Không có bạn bè</div>
            ) : (
                <div className={clsx('container')}>
                    <div className={clsx(styles['friends-wrapper'])}>
                        {friends.map((friend) => {
                            let type;
                            let hasHandleSendFriendRequest = false;

                            if (viewModeAsOther && myFriends?.some((i) => i?.id === friend?.id)) {
                                type = 'friend-suggestion';
                            } else if (myFriends?.some((i) => i?.id === friend?.id)) {
                                type = 'friend';
                            } else if (myFriendRequests?.some((i) => i?.id === friend?.id)) {
                                type = 'friend-request';
                            } else if (mySentFriendRequests?.some((i) => i?.id === friend?.id)) {
                                type = 'sent-friend-request';
                            } else if (friend?.isSentFriendRequest) {
                                type = 'sent-friend-request';
                            } else {
                                type = 'friend-suggestion';
                                hasHandleSendFriendRequest = true;
                            }

                            return (
                                <Friend
                                    key={`friend-${friend?.id}`}
                                    type={type}
                                    id={friend?.id}
                                    firstName={friend?.firstName}
                                    lastName={friend?.lastName}
                                    avatar={friend?.avatar}
                                    numberOfCommonFriends={friend?.numberOfCommonFriends}
                                    handleSendFriendRequest={hasHandleSendFriendRequest && handleSendFriendRequest}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
};

export default UserProfileFriends;
