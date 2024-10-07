import clsx from 'clsx';
import styles from './UserProfileOwner.module.scss';
import UserProfileOwnerHeader from './UserProfileOwnerHeader';
import { useEffect, useState } from 'react';
import UserProfileViewer from '~/components/UserProfileViewer';
import { Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { userInfoSelector } from '~/redux/selectors';
import UserProfileOwnerPost from './UserProfileOwnerPost';
import UserProfilePhotos from '~/components/UserProfilePhotos';
import { getAllFriendsService } from '~/services/relationshipServices';
import UserProfileFriends from '~/components/UserProfileFriends';

const UserProfileOwner = () => {
    const userInfo = useSelector(userInfoSelector);

    const [viewMode, setViewMode] = useState(false);

    const handleOnViewMode = () => setViewMode(true);
    const handleOffViewMode = () => setViewMode(false);

    const [friends, setFriends] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                if (userInfo?.id) {
                    const res = await getAllFriendsService(userInfo.id);
                    setFriends(res);
                }
            } catch (error) {
                console.log(error);
            }
        })();
    }, [userInfo?.id]);

    return (
        <>
            {viewMode ? (
                <>
                    <div className={clsx(styles['view-mode-wrapper'])}>
                        <div className={clsx(styles['view-mode-text'])}>Đang trong chế độ xem của người khác</div>
                        <div className={clsx(styles['view-mode-btn'])} onClick={handleOffViewMode}>
                            Thoát
                        </div>
                    </div>
                    <div className={clsx(styles['user-profile-viewer-view-mode'])}>
                        <UserProfileViewer viewModeAsOther={true} />
                    </div>
                </>
            ) : (
                <>
                    <div className={clsx('container', styles['profile-wrapper'])}>
                        <UserProfileOwnerHeader handleOnViewMode={handleOnViewMode} numberOfFriends={friends?.length} />
                    </div>
                    <Routes>
                        <Route path="" element={<UserProfileOwnerPost />} />
                        <Route
                            path="friends"
                            element={userInfo?.id ? <UserProfileFriends friends={friends} /> : <></>}
                        />
                        <Route
                            path="photos"
                            element={userInfo?.id ? <UserProfilePhotos userId={userInfo?.id} /> : <></>}
                        />
                    </Routes>
                </>
            )}
        </>
    );
};

export default UserProfileOwner;
