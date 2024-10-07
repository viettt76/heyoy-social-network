import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { getPicturesOfUserService } from '~/services/userServices';
import styles from './UserProfilePhotos.module.scss';

const UserProfilePhotos = ({ userId }) => {
    const [pictures, setPictures] = useState([]);

    useEffect(() => {
        const fetchPicturesOfUser = async () => {
            try {
                const res = await getPicturesOfUserService(userId);
                setPictures(res);
            } catch (error) {
                console.log(error);
            }
        };
        fetchPicturesOfUser();
    }, [userId]);

    return (
        <PhotoProvider>
            {pictures?.length > 0 ? (
                <div className={clsx('container', styles['photos-wrapper'])}>
                    {pictures.map((picture) => (
                        <PhotoView key={`picture-${picture?.pictureId}`} src={picture?.pictureUrl}>
                            <img
                                src={picture?.pictureUrl}
                                alt={`picture-${picture?.pictureId}`}
                                className={clsx(styles['photo'])}
                            />
                        </PhotoView>
                    ))}
                </div>
            ) : (
                <div className="text-center fz-16">Không có ảnh nào</div>
            )}
        </PhotoProvider>
    );
};

export default UserProfilePhotos;
