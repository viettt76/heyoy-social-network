import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import UserProfileOwner from '~/components/UserProfileOwner';
import UserProfileViewer from '~/components/UserProfileViewer';
import { userInfoSelector } from '~/redux/selectors';

const Profile = () => {
    const { userId } = useParams();
    const userInfo = useSelector(userInfoSelector);

    return <>{userInfo?.id === userId ? <UserProfileOwner /> : <UserProfileViewer />}</>;
};

export default Profile;
