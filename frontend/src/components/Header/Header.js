import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faUser } from '@fortawesome/free-solid-svg-icons';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import styles from './Header.module.scss';
import logo from '~/assets/imgs/logo.png';
import useClickOutside from '~/hook/useClickOutside';
import Messenger from '~/components/Messenger';
import UserDashboard from '~/components/UserDashboard';
import { BellIcon, MessengerIcon } from '~/components/Icons';

const Header = () => {
    const userDashboardIconRef = useRef(null);
    const {
        ref: userDashboardRef,
        isComponentVisible: showUserDashboard,
        setIsComponentVisible: setShowUserDashboard,
    } = useClickOutside(false, userDashboardIconRef);

    const messengerIconRef = useRef(null);
    const {
        ref: messengerRef,
        isComponentVisible: showMessenger,
        setIsComponentVisible: setShowMessenger,
    } = useClickOutside(false, messengerIconRef);

    return (
        <div className={clsx('d-flex justify-content-between', styles['header'])}>
            <div className="d-flex">
                <Link to="/">
                    <img className={clsx(styles['logo'])} src={logo} />
                </Link>
                <div className={clsx('d-flex align-items-center', styles['search-wrapper'])}>
                    <FontAwesomeIcon className={clsx(styles['search-icon'])} icon={faMagnifyingGlass} />
                    <input className={clsx('fz-16 ms-3', styles['search-input'])} placeholder="Tìm kiếm trên Heyoy" />
                </div>
            </div>
            <div className="d-flex">
                <div>
                    <div
                        ref={messengerIconRef}
                        className={clsx(
                            'd-flex justify-content-center align-items-center fz-16',
                            styles['action-user'],
                        )}
                        data-tooltip-id="tool-tip-message"
                        onClick={() => setShowMessenger(!showMessenger)}
                    >
                        <MessengerIcon className={clsx(styles['action-user-icon'])} />
                        <ReactTooltip id="tool-tip-message" place="bottom" content="Tin nhắn" />
                    </div>
                    <Messenger
                        messengerRef={messengerRef}
                        showMessenger={showMessenger}
                        setShowMessenger={setShowMessenger}
                    />
                </div>

                <div
                    className={clsx('d-flex justify-content-center align-items-center fz-16', styles['action-user'])}
                    data-tooltip-id="tool-tip-notification"
                >
                    <BellIcon className={clsx(styles['action-user-icon'])} />
                    <ReactTooltip className="fz-16" id="tool-tip-notification" place="bottom" content="Thông báo" />
                </div>
                <div>
                    <div
                        ref={userDashboardIconRef}
                        onClick={() => setShowUserDashboard(!showUserDashboard)}
                        className={clsx(
                            'position-relative d-flex justify-content-center align-items-center fz-16',
                            styles['action-user'],
                        )}
                        data-tooltip-id="tool-tip-account"
                    >
                        <FontAwesomeIcon className={clsx(styles['action-user-icon'])} icon={faUser} />
                        <ReactTooltip
                            className="fz-16"
                            id="tool-tip-account"
                            place="bottom-start"
                            content="Tài khoản"
                        />
                    </div>
                    <UserDashboard userDashboardRef={userDashboardRef} showUserDashboard={showUserDashboard} />
                </div>
            </div>
        </div>
    );
};

export default Header;
