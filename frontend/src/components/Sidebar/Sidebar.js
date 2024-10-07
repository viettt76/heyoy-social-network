import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faGear, faHouse, faPlus, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import styles from './Sidebar.module.scss';
import { useSelector } from 'react-redux';
import { userInfoSelector } from '~/redux/selectors';
import defaultAvatar from '~/assets/imgs/default-avatar.png';

const Sidebar = () => {
    const userInfo = useSelector(userInfoSelector);

    const location = useLocation();

    return (
        <>
            <label className={clsx(styles['btn-show__mobile-label'])} htmlFor="checkbox-show-sidebar">
                <FontAwesomeIcon className={clsx(styles['btn-show__mobile-icon'])} icon={faBars} />
            </label>
            <input className={clsx(styles['btn-show__mobile-checkbox'])} type="checkbox" id="checkbox-show-sidebar" />
            <div className={clsx(styles['min-h-100vh'])}>
                <div className={clsx(styles['sidebar-wrapper'])}>
                    <div className={clsx(styles['logo'])}>
                        <span>Heyoy</span>
                    </div>
                    <ul className={clsx(styles['sidebar-group'])}>
                        <li>
                            <Link to={`/profile/${userInfo?.id}`} className={clsx(styles['sidebar-feature'])}>
                                <img
                                    src={userInfo?.avatar || defaultAvatar}
                                    className={clsx(styles['sidebar-feature-avatar'])}
                                />
                                <div className={clsx(styles['sidebar-feature-label'])}>Trang cá nhân</div>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/"
                                className={clsx(styles['sidebar-feature'], {
                                    [[styles['active']]]: location.pathname === '/',
                                })}
                            >
                                <FontAwesomeIcon icon={faHouse} className={clsx(styles['sidebar-feature-icon'])} />
                                <div className={clsx(styles['sidebar-feature-label'])}>Feed</div>
                            </Link>
                        </li>
                        <li>
                            <Link to="/friends" className={clsx(styles['sidebar-feature'])}>
                                <FontAwesomeIcon icon={faUserGroup} className={clsx(styles['sidebar-feature-icon'])} />
                                <div className={clsx(styles['sidebar-feature-label'])}>Bạn bè</div>
                            </Link>
                        </li>
                    </ul>
                    <ul className={clsx(styles['sidebar-group'])}>
                        <li>
                            <Link to="/" className={clsx(styles['sidebar-feature'])}>
                                <FontAwesomeIcon icon={faPlus} className={clsx(styles['sidebar-feature-icon'])} />
                                <div className={clsx(styles['sidebar-feature-label'])}>Messages</div>
                            </Link>
                        </li>
                    </ul>
                    <ul className={clsx(styles['sidebar-group'], styles['account-dashboard'])}>
                        <li>
                            <Link to="/" className={clsx(styles['sidebar-feature'])}>
                                <FontAwesomeIcon icon={faGear} className={clsx(styles['sidebar-feature-icon'])} />
                                <div className={clsx(styles['sidebar-feature-label'])}>Settings</div>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
