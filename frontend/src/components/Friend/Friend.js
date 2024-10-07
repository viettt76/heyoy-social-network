import clsx from 'clsx';
import styles from './Friend.module.scss';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { useDispatch } from 'react-redux';
import * as actions from '~/redux/actions';

const Friend = ({
    className,
    type,
    id,
    firstName = '',
    lastName = '',
    avatar,
    numberOfCommonFriends = 0,
    handleSendFriendRequest,
    handleRefuseFriendRequest,
    handleAcceptFriendship,
    handleShowModalUnfriend,
    handleCancelFriendRequest,
}) => {
    const dispatch = useDispatch();

    const addToChatList = () => {
        dispatch(
            actions.openChat({
                id: id,
                firstName: firstName,
                lastName: lastName,
                avatar,
            }),
        );
    };

    return (
        <div className={clsx(styles['friend-wrapper'], className)}>
            <img className={clsx(styles['friend-avatar'])} src={avatar || defaultAvatar} />
            <div className={clsx(styles['friend-detail'])}>
                <div className={clsx(styles['friend-name'])}>{`${lastName} ${firstName}`}</div>
                {numberOfCommonFriends > 0 && (
                    <div className={clsx(styles['mutual-friends'])}>{numberOfCommonFriends} bạn chung</div>
                )}
                {type === 'friend' && (
                    <div className={clsx(styles['actions'])}>
                        <button className="btn btn-primary fz-16 w-100" onClick={addToChatList}>
                            Nhắn tin
                        </button>
                        <button
                            className="btn btn-danger fz-16 w-100 mt-2"
                            onClick={() => handleShowModalUnfriend(id, firstName, lastName)}
                        >
                            Huỷ kết bạn
                        </button>
                    </div>
                )}
                {type === 'friend-request' && (
                    <div className={clsx(styles['actions'])}>
                        <button className="btn btn-primary fz-16 w-100" onClick={() => handleAcceptFriendship(id)}>
                            Chấp nhận
                        </button>
                        <button
                            className="btn btn-danger fz-16 w-100 mt-2"
                            onClick={() => handleRefuseFriendRequest(id)}
                        >
                            Từ chối
                        </button>
                    </div>
                )}
                {type === 'friend-suggestion' && (
                    <div className={clsx(styles['actions'])}>
                        <button className="btn btn-primary fz-16 w-100" onClick={() => handleSendFriendRequest(id)}>
                            Thêm bạn bè
                        </button>
                    </div>
                )}
                {type === 'sent-friend-request' && (
                    <div className={clsx(styles['actions'])}>
                        <button
                            className="btn btn-danger fz-16 w-100 mt-2"
                            onClick={() => handleCancelFriendRequest(id)}
                        >
                            Thu hồi
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Friend;
