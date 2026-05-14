import { bikAuthApi } from './axiosInstance';

export const loginAdmin = async (credentials) => {
    return await bikAuthApi.post('/auth/login', credentials);
};
