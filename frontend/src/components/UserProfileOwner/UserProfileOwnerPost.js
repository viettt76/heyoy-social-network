import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faCakeCandles, faGraduationCap, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import styles from './UserProfileOwner.module.scss';
import Post from '~/components/Post';
import { useDispatch, useSelector } from 'react-redux';
import { userInfoSelector } from '~/redux/selectors';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getMyPostService } from '~/services/postServices';
import { Button, Form, Modal } from 'react-bootstrap';
import { getPicturesOfUserService, updateMyInfoService } from '~/services/userServices';
import * as actions from '~/redux/actions';
import WritePost from '~/components/WritePost';
import socket from '~/socket';
import DatePicker from 'react-datepicker';
import { calculateTime } from '~/utils/commonUtils';
import { Link } from 'react-router-dom';

const UserProfileOwnerPost = () => {
    const dispatch = useDispatch();
    const userInfo = useSelector(userInfoSelector);
    const [myPosts, setMyPosts] = useState([]);

    const [showModalUpdateIntroductoryInfo, setShowModalUpdateIntroductoryInfo] = useState(false);
    const [introductoryInfo, setIntroductoryInfo] = useState({
        homeTown: '',
        school: '',
        workplace: '',
        birthday: '',
    });

    const [birthdayDisplay, setBirthdayDisplay] = useState(null);
    const [pictures, setPictures] = useState([]);

    useEffect(() => {
        setIntroductoryInfo({
            homeTown: userInfo?.homeTown ? userInfo.homeTown : '',
            school: userInfo?.school ? userInfo.school : '',
            workplace: userInfo?.workplace ? userInfo.workplace : '',
            birthday: userInfo?.birthday ? userInfo.birthday : '',
        });

        setBirthdayDisplay(userInfo?.birthday ? calculateTime(new Date(userInfo?.birthday).toISOString()) : '');
    }, [userInfo]);

    useEffect(() => {
        const fetchPicturesOfUser = async () => {
            try {
                const res = await getPicturesOfUserService(userInfo?.id);
                setPictures(res);
            } catch (error) {
                console.log(error);
            }
        };
        fetchPicturesOfUser();
    }, [userInfo?.id]);

    const handleShowModalUpdateIntroductoryInfo = () => setShowModalUpdateIntroductoryInfo(true);
    const handleHideModalUpdateIntroductoryInfo = () => {
        setShowModalUpdateIntroductoryInfo(false);
        setIntroductoryInfo({
            homeTown: userInfo?.homeTown ? userInfo.homeTown : '',
            school: userInfo?.school ? userInfo.school : '',
            workplace: userInfo?.workplace ? userInfo.workplace : '',
            birthday: userInfo?.birthday ? userInfo.birthday : '',
        });
    };

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

    const handleUpdateForm = (e) => {
        const { name, value } = e.target;

        setIntroductoryInfo({
            ...introductoryInfo,
            [name]: value,
        });
    };

    const handleUpdateIntroductoryInfo = async () => {
        try {
            await updateMyInfoService({
                homeTown: introductoryInfo.homeTown,
                school: introductoryInfo.school,
                workplace: introductoryInfo.workplace,
                birthday: introductoryInfo.birthday,
            });

            dispatch(
                actions.saveUserInfo({
                    homeTown: introductoryInfo.homeTown,
                    school: introductoryInfo.school,
                    workplace: introductoryInfo.workplace,
                    birthday: introductoryInfo.birthday,
                }),
            );
        } catch (error) {
            console.log(error);
        } finally {
            setShowModalUpdateIntroductoryInfo(false);
        }
    };

    useEffect(() => {
        const handleNewPost = (newPost) => {
            setMyPosts((prev) => [{ ...newPost, currentEmotionId: null, currentEmotionName: null }, ...prev]);
        };
        socket.on('myNewPost', handleNewPost);

        return () => {
            socket.off('myNewPost', handleNewPost);
        };
    }, []);

    const sidebarRef = useRef();
    const [isSticky, setIsSticky] = useState(false);

    useLayoutEffect(() => {
        const windowHeight = window.innerHeight;

        const handleScroll = () => {
            if (sidebarRef.current) {
                const rect = sidebarRef.current.getBoundingClientRect();

                if (rect.bottom <= windowHeight) {
                    setIsSticky(true);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className={clsx('container d-flex justify-content-center')}>
            <div className={clsx('row', styles['container'])}>
                <div className={clsx('col-5')}>
                    <div
                        ref={sidebarRef}
                        className={clsx(styles['sidebar'], {
                            [[styles['sticky']]]: isSticky,
                        })}
                    >
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

                                <button
                                    className={clsx(styles['btn-add-intro'], {
                                        ['mt-3']:
                                            userInfo?.birthday ||
                                            userInfo?.homeTown ||
                                            userInfo?.school ||
                                            userInfo?.workplace,
                                    })}
                                    onClick={handleShowModalUpdateIntroductoryInfo}
                                >
                                    Thêm thông tin giới thiệu
                                </button>
                                <Modal
                                    show={showModalUpdateIntroductoryInfo}
                                    className={clsx(styles['modal'])}
                                    onHide={handleHideModalUpdateIntroductoryInfo}
                                >
                                    <Modal.Header className="d-flex justify-content-center">
                                        <Modal.Title className={clsx(styles['modal-title'])}>
                                            Thông tin giới thiệu
                                        </Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Form>
                                            <Form.Group className="mb-3">
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <Form.Label>Ngày sinh</Form.Label>
                                                    <Button
                                                        variant="danger fz-14"
                                                        onClick={() =>
                                                            setIntroductoryInfo((prev) => ({
                                                                ...prev,
                                                                birthday: '',
                                                            }))
                                                        }
                                                    >
                                                        Xoá
                                                    </Button>
                                                </div>
                                                <DatePicker
                                                    selected={introductoryInfo?.birthday}
                                                    onChange={(date) => {
                                                        setIntroductoryInfo((prev) => ({
                                                            ...prev,
                                                            birthday: date,
                                                        }));
                                                    }}
                                                    className={clsx('form-control', styles['datepicker'])}
                                                    dateFormat="dd/MM/yyyy"
                                                    placeholderText="Ngày/tháng/năm"
                                                    showYearDropdown
                                                    showMonthDropdown
                                                    dropdownMode="select"
                                                    maxDate={new Date()}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <Form.Label>Quê quán</Form.Label>
                                                    <Button
                                                        variant="danger fz-14"
                                                        onClick={() =>
                                                            setIntroductoryInfo((prev) => ({
                                                                ...prev,
                                                                homeTown: '',
                                                            }))
                                                        }
                                                    >
                                                        Xoá
                                                    </Button>
                                                </div>
                                                <Form.Control
                                                    name="homeTown"
                                                    value={introductoryInfo?.homeTown}
                                                    onChange={handleUpdateForm}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleUpdateIntroductoryInfo();
                                                        }
                                                    }}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <Form.Label>Trường học</Form.Label>

                                                    <Button
                                                        variant="danger fz-14"
                                                        onClick={() =>
                                                            setIntroductoryInfo((prev) => ({
                                                                ...prev,
                                                                school: '',
                                                            }))
                                                        }
                                                    >
                                                        Xoá
                                                    </Button>
                                                </div>
                                                <Form.Control
                                                    name="school"
                                                    value={introductoryInfo?.school}
                                                    onChange={handleUpdateForm}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleUpdateIntroductoryInfo();
                                                        }
                                                    }}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <div className="d-flex align-items-center justify-content-between mb-2">
                                                    <Form.Label>Nơi làm việc</Form.Label>
                                                    <Button
                                                        variant="danger fz-14"
                                                        onClick={() =>
                                                            setIntroductoryInfo((prev) => ({
                                                                ...prev,
                                                                workplace: '',
                                                            }))
                                                        }
                                                    >
                                                        Xoá
                                                    </Button>
                                                </div>
                                                <Form.Control
                                                    name="workplace"
                                                    value={introductoryInfo?.workplace}
                                                    onChange={handleUpdateForm}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleUpdateIntroductoryInfo();
                                                        }
                                                    }}
                                                />
                                            </Form.Group>
                                        </Form>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button className="fz-16" onClick={handleUpdateIntroductoryInfo}>
                                            Cập nhật
                                        </Button>
                                    </Modal.Footer>
                                </Modal>
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
                                            return (
                                                <img key={`picture-${picture?.pictureId}`} src={picture?.pictureUrl} />
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={clsx('col-7')}>
                    <WritePost />
                    {myPosts?.map((post) => (
                        <Post key={`post-${post?.id}`} postInfo={post} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserProfileOwnerPost;
