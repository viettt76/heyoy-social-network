import { lazy } from 'react';

import OnlyHeaderLayout from '~/layouts/OnlyHeaderLayout';
import FriendsLayout from '~/layouts/FriendsLayout';

const Home = lazy(() => import('~/pages/Home'));
const Login = lazy(() => import('~/pages/Login'));
const Profile = lazy(() => import('~/pages/Profile'));
const MyFriends = lazy(() => import('~/pages/MyFriends'));
const FriendRequests = lazy(() => import('~/pages/FriendRequests'));
const FriendSuggestions = lazy(() => import('~/pages/FriendSuggestions'));
const SentFriendRequests = lazy(() => import('~/pages/SentFriendRequests'));
const CallingWindow = lazy(() => import('~/pages/CallingWindow'));

const routes = [
    { path: '/', element: Home },
    { path: '/login', element: Login, layout: null },
    { path: '/profile/:userId/*', element: Profile, layout: OnlyHeaderLayout },
    { path: '/friends', element: MyFriends, layout: FriendsLayout },
    { path: '/friends/requests', element: FriendRequests, layout: FriendsLayout },
    { path: '/friends/sent-requests', element: SentFriendRequests, layout: FriendsLayout },
    { path: '/friends/suggestions', element: FriendSuggestions, layout: FriendsLayout },
    { path: '/calling', element: CallingWindow, layout: null },
];

export default routes;
