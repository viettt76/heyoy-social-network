import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faPhone, faThumbsUp, faVideo, faXmark } from '@fortawesome/free-solid-svg-icons';
import styles from './ChatPopup.module.scss';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { useDispatch, useSelector } from 'react-redux';
import { userInfoSelector } from '~/redux/selectors';
import * as actions from '~/redux/actions';
import { getMessagesWithFriendService, sendMessageWithFriendService } from '~/services/chatServices';
import socket from '~/socket';
import _ from 'lodash';
import useClickOutside from '~/hook/useClickOutside';
import { calculateTime } from '~/utils/commonUtils';

const ChatPopup = ({ index, friend }) => {
    const { ref: chatPopupRef, isComponentVisible: isFocus, setIsComponentVisible: setIsFocus } = useClickOutside(true);
    const userInfo = useSelector(userInfoSelector);
    const dispatch = useDispatch();

    const endOfMessagesRef = useRef(null);

    const [messages, setMessages] = useState([]);

    const [sendMessage, setSendMessage] = useState('');
    const [processingMessage, setProcessingMessage] = useState('');

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await getMessagesWithFriendService(friend?.id);
                setMessages(res);
            } catch (error) {
                console.log(error);
            }
        };
        fetchMessages();
    }, [friend]);

    useEffect(() => {
        endOfMessagesRef.current.scrollTop = endOfMessagesRef.current.scrollHeight;
    }, [messages]);

    const handleCloseChatPopup = useCallback(() => {
        dispatch(actions.closeChat(friend?.id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [friend?.id]);

    const handleSendMessage = async () => {
        try {
            setMessages((prev) => [
                ...prev,
                {
                    id: null,
                    sender: userInfo?.id,
                    message: sendMessage,
                    createdAt: new Date().toISOString(),
                },
            ]);
            const clone = sendMessage;
            setSendMessage('');
            setProcessingMessage('Đang xử lý');
            const res = await sendMessageWithFriendService({ friendId: friend?.id, message: clone });
            setMessages((prev) => {
                const index = _.findIndex(prev, { id: null, message: clone });

                if (index === -1) return prev;

                const updatedMessages = _.cloneDeep(prev);
                updatedMessages[index] = { ...updatedMessages[index], id: res?.id };

                return updatedMessages;
            });
            setProcessingMessage('');
        } catch (error) {
            console.log(error);
            setProcessingMessage('Lỗi');
        }
    };

    useEffect(() => {
        const handleNewMessage = ({ newMessage }) => {
            if (newMessage?.receiver === userInfo?.id && newMessage?.sender === friend?.id) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: newMessage?.id,
                        sender: newMessage?.sender,
                        message: newMessage?.message,
                        createdAt: newMessage?.createdAt,
                    },
                ]);
            }
        };
        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [userInfo?.id, friend?.id]);

    useEffect(() => {
        window.onkeydown = (e) => {
            if (isFocus && e.key === 'Escape') {
                handleCloseChatPopup();
            }
        };
    }, [handleCloseChatPopup, isFocus]);

    const [showSetting, setShowSetting] = useState(false);
    const handleShowSetting = () => setShowSetting(true);

    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        socket.emit('checkFriendOnline', friend?.id);

        const handleIsFriendOnline = (isFriendOnline) => {
            setIsOnline(isFriendOnline);
        };

        socket.on('isFriendOnline', handleIsFriendOnline);

        return () => {
            socket.off('isFriendOnline', handleIsFriendOnline);
        };
    }, [friend?.id]);

    const handleStartCallAudio = () => {
        socket.emit('requestPrivateCall', { callerId: userInfo?.id, receiverId: friend?.id });
    };

    return (
        <div
            style={{ right: index === 0 ? '3rem' : '38rem', zIndex: 2 - index }}
            className={clsx(styles['chat-wrapper'])}
            ref={chatPopupRef}
            onClick={() => setIsFocus(true)}
        >
            <div
                className={clsx(styles['chat-header'], {
                    [[styles['is-focus']]]: isFocus,
                })}
            >
                <div className={clsx(styles['chat-receiver'])}>
                    <div
                        className={clsx(styles['avatar'], {
                            [[styles['is-online']]]: isOnline,
                        })}
                    >
                        <img src={friend?.avatar || defaultAvatar} />
                    </div>
                    {friend?.lastName && friend?.firstName && (
                        <div className={clsx(styles['name'])}>{`${friend?.lastName} ${friend?.firstName}`}</div>
                    )}
                    <FontAwesomeIcon
                        className={clsx(styles['chat-options'])}
                        icon={faChevronDown}
                        onClick={handleShowSetting}
                    />
                    <FontAwesomeIcon
                        className={clsx(styles['chat-options'])}
                        icon={faPhone}
                        onClick={handleStartCallAudio}
                    />
                    <FontAwesomeIcon className={clsx(styles['chat-options'])} icon={faVideo} />
                </div>
                <FontAwesomeIcon
                    icon={faXmark}
                    className={clsx(styles['chat-close'])}
                    onClick={() => handleCloseChatPopup(false)}
                />
            </div>
            <div ref={endOfMessagesRef} className={clsx(styles['chat-container'])}>
                {messages?.length > 0 ? (
                    messages?.map((message, index) => {
                        let minDiff = 0;
                        let isSameDay = true;
                        const latestTime = calculateTime(message?.createdAt);
                        const beforeTime = calculateTime(new Date().toISOString());
                        if (
                            latestTime?.year !== beforeTime?.year ||
                            latestTime?.month !== beforeTime?.month ||
                            latestTime?.day !== beforeTime?.day
                        ) {
                            isSameDay = false;
                        }

                        if (index >= 1) {
                            const date1 = new Date(message?.createdAt);
                            const date2 = new Date(messages[index - 1]?.createdAt);

                            const diff = date1 - date2;
                            minDiff = diff / (1000 * 60);
                        }
                        return (
                            <div className={clsx(styles['chat-item'])} key={`chat-${index}`}>
                                {(index === 0 || minDiff >= 10) && (
                                    <div className="fz-14 text-center mt-4 mb-2">
                                        {latestTime?.hours}:{latestTime?.minutes}{' '}
                                        {!isSameDay && `${latestTime?.day}/${latestTime?.month}`}
                                    </div>
                                )}
                                <div
                                    className={clsx(styles['message-wrapper'], {
                                        [[styles['message-current-user']]]: message?.sender === userInfo?.id,
                                    })}
                                >
                                    {messages[index - 1]?.sender !== message?.sender &&
                                        message?.sender === friend?.id && (
                                            <img
                                                className={clsx(styles['message-avatar'])}
                                                src={friend?.avatar || defaultAvatar}
                                            />
                                        )}
                                    <div className={clsx(styles['message'])}>{message?.message}</div>
                                    {processingMessage &&
                                        _.findLast(messages, { sender: userInfo?.id }) &&
                                        _.isEqual(_.findLast(messages, { sender: userInfo?.id }), message) && (
                                            <div className={clsx(styles['process-message'])}>{processingMessage}</div>
                                        )}
                                </div>
                                {index === messages?.length - 1 && (
                                    <div
                                        className={clsx(styles['time-of-last-message'], {
                                            [[styles['message-of-friend']]]: message?.sender === friend?.id,
                                        })}
                                    >
                                        {latestTime?.hours}:{latestTime?.minutes}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="mt-5 text-center fz-16">
                        Hãy bắt đầu cuộc trò chuyện với {`${friend?.lastName} ${friend?.firstName}`}
                    </div>
                )}
                <div></div>
            </div>
            <div className={clsx(styles['chat-footer'])}>
                <div className={clsx(styles['send-message-wrapper'])}>
                    <input
                        value={sendMessage}
                        className={clsx(styles['send-message'])}
                        placeholder="Aa"
                        onChange={(e) => setSendMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSendMessage();
                            }
                        }}
                    />
                    {sendMessage ? (
                        <i className={clsx(styles['send-message-btn'])} onClick={handleSendMessage}></i>
                    ) : (
                        <FontAwesomeIcon className={clsx(styles['link-icon'])} icon={faThumbsUp} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPopup;
