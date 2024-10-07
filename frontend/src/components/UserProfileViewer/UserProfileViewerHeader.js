import clsx from 'clsx';
import styles from './UserProfileViewer.module.scss';
import { useEffect, useState } from 'react';
import { getUserInfoService } from '~/services/userServices';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { Link, useParams } from 'react-router-dom';

const UserProfileViewerHeader = ({ numberOfFriends }) => {
    const { userId } = useParams();

    const [userInfo, setUserInfo] = useState({});
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await getUserInfoService(userId);
                setUserInfo(res);
            } catch (error) {
                console.log(error);
            }
        };
        fetchUserInfo();
    }, [userId]);

    return (
        <div className={clsx('container', styles['profile-wrapper'])}>
            <div className={clsx(styles['header'])}>
                <div className={clsx(styles['header-left'])}>
                    <img className={clsx(styles['avatar'])} src={userInfo?.avatar || defaultAvatar} />
                    <div>
                        <h3 className={clsx(styles['full-name'])}>{`${userInfo?.lastName} ${userInfo?.firstName}`}</h3>
                        <div className={clsx(styles['number-of-friends'])}>{numberOfFriends} bạn bè</div>
                    </div>
                </div>
            </div>
            <div className={clsx(styles['profile-tabs-wrapper'])}>
                <Link
                    className={clsx(styles['profile-tabs'], {
                        [[styles['active']]]: location.pathname === `/profile/${userInfo?.id}`,
                    })}
                    to={`/profile/${userInfo?.id}`}
                >
                    Bài đăng
                </Link>
                <Link
                    className={clsx(styles['profile-tabs'], {
                        [[styles['active']]]: location.pathname === `/profile/${userInfo?.id}/friends`,
                    })}
                    to={`/profile/${userInfo?.id}/friends`}
                >
                    Bạn bè
                </Link>
                <Link
                    className={clsx(styles['profile-tabs'], {
                        [[styles['active']]]: location.pathname === `/profile/${userInfo?.id}/photos`,
                    })}
                    to={`/profile/${userInfo?.id}/photos`}
                >
                    Ảnh
                </Link>
            </div>
        </div>
    );
};

export default UserProfileViewerHeader;
