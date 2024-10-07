import Header from '~/components/Header';
import SidebarFriends from '~/components/SidebarFriends';

const FriendsLayout = ({ children }) => {
    return (
        <div>
            <Header />
            <div className="d-flex">
                <SidebarFriends />
                {children}
            </div>
        </div>
    );
};

export default FriendsLayout;
