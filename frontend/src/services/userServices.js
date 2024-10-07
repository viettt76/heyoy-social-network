import axios from '~/utils/axios';

export const getMyInfoService = () => {
    return axios.get('/user/my-info');
};

export const updateMyInfoService = ({ homeTown, school, workplace, avatar, birthday }) => {
    return axios.put('/user/my-info', { homeTown, school, workplace, avatar, birthday });
};

export const getUserInfoService = (userId) => {
    return axios.get(`/user/user-info/${userId}`);
};

export const getPicturesOfUserService = (userId) => {
    return axios.get(`/user/pictures/${userId}`);
};
