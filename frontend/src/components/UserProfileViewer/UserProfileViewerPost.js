import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faCakeCandles, faGraduationCap, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import styles from './UserProfileViewer.module.scss';
import Post from '~/components/Post';
import { useEffect, useState } from 'react';
import { getMyPostService } from '~/services/postServices';
import { getPicturesOfUserService, getUserInfoService } from '~/services/userServices';
import WritePost from '~/components/WritePost';
import { calculateTime } from '~/utils/commonUtils';
import { Link, useParams } from 'react-router-dom';

const UserProfileViewerPost = () => {
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

    const [myPosts, setMyPosts] = useState([]);

    const [birthdayDisplay, setBirthdayDisplay] = useState(null);

    useEffect(() => {
        setBirthdayDisplay(userInfo?.birthday ? calculateTime(new Date(userInfo?.birthday).toISOString()) : '');
    }, [userInfo?.birthday]);

    useEffect(() => {
        const fetchMyPosts = async () => {
            try {
                if (userInfo?.id) {
                    const res = await getMyPostService(userInfo?.id);
                    setMyPosts(res);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchMyPosts();
    }, [userInfo?.id]);

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

    // useEffect(() => {
    //     const handleNewPost = (newPost) => {
    //         setMyPosts((prev) => [{ ...newPost, currentEmotionId: null, currentEmotionName: null }, ...prev]);
    //     };
    //     socket.on('myNewPost', handleNewPost);

    //     return () => {
    //         socket.off('myNewPost', handleNewPost);
    //     };
    // }, []);

    return (
        <div className={clsx('container d-flex justify-content-center')}>
            <div className={clsx('row', styles['container'])}>
                <div className={clsx('col-5', styles['sidebar'])}>
                    <div className={clsx(styles['sidebar-item'])}>
                        <h6 className={clsx(styles['sidebar-item-title'])}>Giới thiệu</h6>
                        <div className={clsx(styles['sidebar-item-content'], styles['introduction'])}>
                            {userInfo?.birthday && (
                                <div className={clsx(styles['sidebar-item-content-item'])}>
                                    <FontAwesomeIcon
                                        icon={faCakeCandles}
                                        className={clsx(styles['sidebar-item-content-item-icon'])}
                                    />
                                    Ngày sinh:{' '}
                                    {`${birthdayDisplay?.day}/${birthdayDisplay?.month}/${birthdayDisplay?.year}`}
                                </div>
                            )}
                            {userInfo?.homeTown && (
                                <div className={clsx(styles['sidebar-item-content-item'])}>
                                    <FontAwesomeIcon
                                        icon={faLocationDot}
                                        className={clsx(styles['sidebar-item-content-item-icon'])}
                                    />
                                    Quê quán: {userInfo?.homeTown}
                                </div>
                            )}
                            {userInfo?.school && (
                                <div className={clsx(styles['sidebar-item-content-item'])}>
                                    <FontAwesomeIcon
                                        icon={faGraduationCap}
                                        className={clsx(styles['sidebar-item-content-item-icon'])}
                                    />
                                    Trường học: {userInfo?.school}
                                </div>
                            )}
                            {userInfo?.workplace && (
                                <div className={clsx(styles['sidebar-item-content-item'])}>
                                    <FontAwesomeIcon
                                        icon={faBuilding}
                                        className={clsx(styles['sidebar-item-content-item-icon'])}
                                    />
                                    Nơi làm việc: {userInfo?.workplace}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={clsx(styles['sidebar-item'])}>
                        <div className="d-flex align-items-center justify-content-between">
                            <h6 className={clsx(styles['sidebar-item-title'])}>Ảnh</h6>
                            <Link to={'photos'} className={clsx(styles['see-all-imgs'])}>
                                Xem tất cả ảnh
                            </Link>
                        </div>
                        <div className={clsx(styles['sidebar-item-content'])}>
                            <div className={clsx(styles['picture-wrapper'])}>
                                {pictures?.length > 0 &&
                                    pictures?.map((picture) => {
                                        return <img key={`picture-${picture?.pictureId}`} src={picture?.pictureUrl} />;
                                    })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={clsx('col-7')}>
                    {/* <WritePost /> */}
                    {myPosts?.map((post) => (
                        <Post key={`post-${post?.id}`} postInfo={post} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserProfileViewerPost;
