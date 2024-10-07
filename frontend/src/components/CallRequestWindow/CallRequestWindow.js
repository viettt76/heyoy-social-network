import { useEffect, useState } from 'react';
import clsx from 'clsx';
import styles from './CallRequestWindow.module.scss';
import socket from '~/socket';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faVideo, faXmark } from '@fortawesome/free-solid-svg-icons';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { userInfoSelector } from '~/redux/selectors';
import { useSelector } from 'react-redux';

const CallRequestWindow = () => {
    const userInfo = useSelector(userInfoSelector);

    const [showRequestCalling, setShowRequestCalling] = useState(false);
    const [showCalling, setShowCalling] = useState(false);

    /* CALLER */
    // caller receives data
    const [callerToken, setCallerToken] = useState('');
    const [receiverInfo, setReceiverInfo] = useState('');

    // client is caller
    useEffect(() => {
        socket.on('callerToken', ({ callerToken: callerTokenFromServer, receiverInfo: receiverInfoFromServer }) => {
            setShowRequestCalling(true);
            setCallerToken(callerTokenFromServer);
            setReceiverInfo(receiverInfoFromServer);
        });

        socket.on('friendAcceptCall', () => {
            setShowCalling(true);
            setShowRequestCalling(false);
        });

        socket.on('callRejected', () => {
            setShowRequestCalling(false);
            setCallerToken('');
            setReceiverInfo('');
        });
    }, []);

    const cancelCalling = () => {
        socket.emit('cancelCalling', receiverInfo?.id);
        setShowRequestCalling(false);
        setCallerToken('');
        setReceiverInfo('');
    };

    /* CALL RECIPIENT */
    // call recipient receives data
    const [receiverToken, setReceiverToken] = useState('');
    const [callerInfo, setCallerInfo] = useState({});
    const [roomId, setRoomId] = useState('');

    // client is call recipient
    useEffect(() => {
        socket.on('hasRequestPrivateCall', ({ roomId: roomIdFromServer, callerInfo: callerInfoFromServer }) => {
            setShowRequestCalling(true);
            setRoomId(roomIdFromServer);
            setCallerInfo(callerInfoFromServer);
        });

        socket.on('startPrivateCall', (receiverTokenFromServer) => {
            setReceiverToken(receiverTokenFromServer);
            setShowCalling(true);
            setShowRequestCalling(false);
        });

        socket.on('callCancelled', () => {
            setShowRequestCalling(false);
            setReceiverToken('');
            setCallerInfo('');
        });
    }, []);

    const handleAcceptCall = () => {
        socket.emit('acceptPrivateCall', { acceptorId: userInfo?.id, callerId: callerInfo?.id, roomId });
    };

    const handleRefuseCall = () => {
        socket.emit('refusePrivateCall', { denierId: userInfo?.id, callerId: callerInfo?.id, roomId });
        setShowRequestCalling(false);
        setCallerInfo('');
        setReceiverToken('');
    };

    useEffect(() => {
        if (!showRequestCalling && showCalling && (receiverToken || callerToken)) {
            const callingWindow = window.open('/calling', '_blank', 'width=800,height=600');

            if (callingWindow) {
                callingWindow.onload = function () {
                    setTimeout(() => {
                        const token = receiverToken || callerToken;
                        callingWindow.postMessage({ token }, '*');
                    }, 100);
                };
            }
        }
    }, [showRequestCalling, showCalling, receiverToken, callerToken]);

    return (
        <>
            {showRequestCalling && (
                <div className={clsx(styles['call-notification'])}>
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <img
                                className={clsx(styles['call-notification-avatar'])}
                                src={receiverInfo?.avatar || callerInfo?.avatar || defaultAvatar}
                                alt={
                                    receiverInfo?.lastName && receiverInfo?.firstName
                                        ? `${receiverInfo?.lastName} ${receiverInfo?.firstName}`
                                        : `${callerInfo?.lastName} ${callerInfo?.firstName}`
                                }
                            />
                            <div className={clsx(styles['call-notification-name'])}>
                                {receiverInfo?.lastName && receiverInfo?.firstName
                                    ? `${receiverInfo?.lastName} ${receiverInfo?.firstName}`
                                    : `${callerInfo?.lastName} ${callerInfo?.firstName}`}
                            </div>
                        </div>
                        {(callerInfo?.id || receiverInfo?.id) && (
                            <div className="d-flex align-items-center">
                                {callerInfo?.id && !receiverInfo?.id && (
                                    <>
                                        <div
                                            className={clsx(
                                                styles['call-notification-btn'],
                                                styles['call-notification-btn__accept'],
                                            )}
                                            onClick={handleAcceptCall}
                                        >
                                            <FontAwesomeIcon
                                                className={clsx(styles['call-notification-btn-icon'])}
                                                icon={faPhone}
                                            />
                                        </div>
                                        {/* <FontAwesomeIcon className={clsx(styles['chat-options'])} icon={faVideo} /> */}
                                        <div
                                            className={clsx(
                                                styles['call-notification-btn'],
                                                styles['call-notification-btn__refuse'],
                                            )}
                                            onClick={handleRefuseCall}
                                        >
                                            <FontAwesomeIcon
                                                className={clsx(styles['call-notification-btn-icon'])}
                                                icon={faXmark}
                                            />
                                        </div>
                                    </>
                                )}
                                {!callerInfo?.id && receiverInfo?.id && (
                                    <div
                                        className={clsx(
                                            styles['call-notification-btn'],
                                            styles['call-notification-btn__cancel'],
                                        )}
                                        onClick={cancelCalling}
                                    >
                                        <FontAwesomeIcon
                                            className={clsx(styles['call-notification-btn-icon'])}
                                            icon={faPhone}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default CallRequestWindow;
