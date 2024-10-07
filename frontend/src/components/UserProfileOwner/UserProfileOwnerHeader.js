import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faPencil } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import styles from './UserProfileOwner.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { loadingSelector, userInfoSelector } from '~/redux/selectors';
import { useState } from 'react';
import { Button, Dropdown, Modal } from 'react-bootstrap';
import { updateMyInfoService } from '~/services/userServices';
import * as actions from '~/redux/actions';
import Cropper from 'react-easy-crop';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { Link, useLocation } from 'react-router-dom';
import { getCroppedImg, uploadToCloudinary } from '~/utils/commonUtils';
import LoadingOverlay from '~/components/LoadingOverlay';

const UserProfileOwnerHeader = ({ handleOnViewMode, numberOfFriends }) => {
    const dispatch = useDispatch();
    const userInfo = useSelector(userInfoSelector);
    const loading = useSelector(loadingSelector);

    const location = useLocation();

    const [updateAvatar, setUpdateAvatar] = useState(null);
    const [showModalUpdateAvatar, setShowModalUpdateAvatar] = useState(false);

    const handleChooseFile = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = (s) => {
                setUpdateAvatar(s.target.result);
                setShowModalUpdateAvatar(true);
            };

            reader.readAsDataURL(file);
        }
    };

    const handleHideModalUpdateAvatar = () => setShowModalUpdateAvatar(false);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleSave = async () => {
        try {
            dispatch(actions.startLoading('updateAvatar'));
            const croppedImage = await getCroppedImg(updateAvatar, croppedAreaPixels);
            const file = await fetch(croppedImage)
                .then((res) => res.blob())
                .then((blob) => new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' }));
            const imageUrl = await uploadToCloudinary(file);
            await updateMyInfoService({ avatar: imageUrl });

            dispatch(actions.saveUserInfo({ avatar: imageUrl }));
            handleHideModalUpdateAvatar();
        } catch (error) {
            console.error('Failed to crop image', error);
        } finally {
            dispatch(actions.stopLoading('updateAvatar'));
        }
    };

    return (
        <>
            {loading?.updateAvatar && <LoadingOverlay />}
            <div className={clsx(styles['header'])}>
                <div className={clsx(styles['header-left'])}>
                    <img className={clsx(styles['avatar'])} src={userInfo?.avatar || defaultAvatar} />
                    <div>
                        <h3 className={clsx(styles['full-name'])}>{`${userInfo.lastName} ${userInfo.firstName}`}</h3>
                        <div className={clsx(styles['number-of-friends'])}>{numberOfFriends} bạn bè</div>
                    </div>
                </div>
                <div className={clsx(styles['header-right'])}>
                    <label htmlFor="change-avatar-input" className={clsx(styles['edit-profile-btn'])}>
                        <FontAwesomeIcon icon={faPencil} />
                        <span>Đổi ảnh đại diện</span>
                    </label>
                    <input type="file" id="change-avatar-input" hidden onChange={handleChooseFile} />
                    <Modal
                        className={clsx(styles['modal'])}
                        show={showModalUpdateAvatar}
                        onHide={handleHideModalUpdateAvatar}
                    >
                        <Modal.Header>
                            <Modal.Title>Chọn ảnh đại diện</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className={clsx(styles['modal-body'])}>
                            <div className={clsx(styles['crop-container'])}>
                                <Cropper
                                    image={updateAvatar}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    cropShape="round"
                                    showGrid={false}
                                />
                            </div>
                            <div className={clsx(styles['controls'])}>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => {
                                        setZoom(e.target.value);
                                    }}
                                    className={clsx(styles['zoom-range'])}
                                />
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <div className="d-flex align-items-revert">
                                <div className={clsx(styles['btn-cancel'])} onClick={handleHideModalUpdateAvatar}>
                                    Huỷ
                                </div>
                                <Button variant="primary" className="fz-16" onClick={handleSave}>
                                    Xác nhận
                                </Button>
                            </div>
                        </Modal.Footer>
                    </Modal>
                    <div className={clsx(styles['header-right-menu'])}>
                        <Dropdown>
                            <Dropdown.Toggle id="dropdown-basic">
                                <FontAwesomeIcon className={clsx(styles['header-right-menu-icon'])} icon={faEllipsis} />
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item onClick={handleOnViewMode}>Xem với view người khác</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
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
        </>
    );
};

export default UserProfileOwnerHeader;
