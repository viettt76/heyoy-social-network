import clsx from 'clsx';
import styles from './UserProfileViewer.module.scss';
import UserProfileViewerHeader from './UserProfileViewerHeader';
import { Route, Routes, useParams } from 'react-router-dom';
import UserProfileViewerPost from './UserProfileViewerPost';
import UserProfilePhotos from '~/components/UserProfilePhotos';
import { useEffect, useState } from 'react';
import { getAllFriendsService } from '~/services/relationshipServices';
import UserProfileFriends from '~/components/UserProfileFriends';

const UserProfileViewer = ({ viewModeAsOther }) => {
    const { userId } = useParams();

    const [friends, setFriends] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                if (userId) {
                    const res = await getAllFriendsService(userId);
                    setFriends(res);
                }
            } catch (error) {
                console.log(error);
            }
        })();
    }, [userId]);

    return (
        <>
            <div className={clsx('container', styles['profile-wrapper'])}>
                <UserProfileViewerHeader numberOfFriends={friends?.length} />
            </div>
            <Routes>
                <Route path="" element={<UserProfileViewerPost />} />
                <Route
                    path="friends"
                    element={
                        userId ? <UserProfileFriends friends={friends} viewModeAsOther={viewModeAsOther} /> : <></>
                    }
                />
                <Route path="photos" element={userId ? <UserProfilePhotos userId={userId} /> : <></>} />
            </Routes>
        </>
    );
};

export default UserProfileViewer;
