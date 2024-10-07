import clsx from 'clsx';
import styles from './UserDashboard.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import { logoutService } from '~/services/authServices';
import { useDispatch } from 'react-redux';
import * as actions from '~/redux/actions';
import socket from '~/socket';
import defaultAvatar from '~/assets/imgs/default-avatar.png';
import { useSelector } from 'react-redux';
import { userInfoSelector } from '~/redux/selectors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

const UserDashboard = ({ userDashboardRef, showUserDashboard }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const userInfo = useSelector(userInfoSelector);

    const handleLogout = async () => {
        try {
            localStorage.removeItem('isAuthenticated');
            await logoutService();
            dispatch(actions.clearUserInfo());
            dispatch(actions.closeAllChat());
            socket.disconnect();
        } catch (error) {
            console.log(error);
        } finally {
            navigate('/login');
        }
    };

    return (
        <ul
            ref={userDashboardRef}
            className={clsx(styles['dashboard-wrapper'], {
                [[styles['show']]]: showUserDashboard,
            })}
        >
            <li className={clsx(styles['dashboard-item'])}>
                <Link className={clsx(styles['dashboard-link'])} to={`/profile/${userInfo?.id}`}>
                    <img className={clsx(styles['dashboard-avatar'])} src={userInfo?.avatar || defaultAvatar} />
                    {`${userInfo?.lastName} ${userInfo?.firstName}`}
                </Link>
            </li>
            {/* <li className={clsx(styles['dashboard-item'])}>
                <Link className={clsx(styles['dashboard-link'])}>
                    <FontAwesomeIcon icon={faGear} className={clsx(styles['dashboard-link-icon'])} />
                    Tài khoản
                </Link>
            </li> */}
            <li className={clsx(styles['dashboard-item'])}>
                <Link className={clsx(styles['dashboard-link'])}>
                    <FontAwesomeIcon icon={faGear} className={clsx(styles['dashboard-link-icon'])} />
                    Cài đặt
                </Link>
            </li>
            <li className={clsx(styles['dashboard-item'])}>
                <div className={clsx(styles['dashboard-link'])} onClick={handleLogout}>
                    <FontAwesomeIcon icon={faRightFromBracket} className={clsx(styles['dashboard-link-icon'])} />
                    Đăng xuất
                </div>
            </li>
        </ul>
    );
};

export default UserDashboard;
