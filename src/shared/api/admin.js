import { bikApi } from './axiosInstance';

// ================= USERS & CLIENTS =================
export const getDashboardStats = async () => {
    return await bikApi.get('/admin/dashboard/stats');
};

export const listUsers = async (params) => {
    return await bikApi.get('/admin/users', { params });
};

export const getFullClientProfile = async (id) => {
    return await bikApi.get(`/admin/users/${id}/full-profile`);
};

export const createClient = async (data) => {
    return await bikApi.post('/users/register', data);
};

export const updateClient = async (id, data) => {
    return await bikApi.put(`/users/${id}/update`, data);
};

export const updateClientStatus = async (id, statusData) => {
    return await bikApi.patch(`/users/${id}/status`, statusData);
};

// ================= ACCOUNTS =================
export const listAccounts = async (params) => {
    return await bikApi.get('/admin/accounts', { params });
};

export const getAccountDetail = async (id) => {
    return await bikApi.get(`/admin/accounts/${id}/detail`);
};

export const createAccount = async (data) => {
    return await bikApi.post('/accounts', data);
};

// ================= REQUESTS =================
export const listRequests = async (params) => {
    return await bikApi.get('/admin/requests', { params });
};

export const getRequestById = async (id) => {
    return await bikApi.get(`/admin/requests/${id}`);
};

export const updateRequestStatus = async (id, data) => {
    return await bikApi.patch(`/requests/${id}/status`, data);
};

export const escalateRequest = async (id, data) => {
    return await bikApi.patch(`/admin/requests/${id}/escalate`, data);
};

// ================= CARDS =================
export const searchUserByDpi = async (dpi) => {
    return await bikApi.get(`/users/${dpi}`);
};

export const getCardsByUser = async (userId) => {
    return await bikApi.get(`/cards/user/${userId}`);
};

export const freezeCard = async (id) => {
    return await bikApi.patch(`/cards/${id}/freeze`);
};

// ================= TELLER (VENTANILLA) =================
export const findAccountByNumber = async (number) => {
    return await bikApi.get(`/admin/accounts/by-number/${number}`);
};

export const executeDeposit = async (data) => {
    return await bikApi.post('/transactions/deposit', data);
};

export const executeWithdrawal = async (data) => {
    return await bikApi.post('/admin/ventanilla/retiro', data);
};

export const getAccountStatement = async (id, params) => {
    return await bikApi.get(`/admin/accounts/${id}/statement`, { params });
};

// ================= TRANSACTIONS & AUDIT =================
export const listTransactions = async (params) => {
    return await bikApi.get('/admin/transactions', { params });
};

export const getAuditLogs = async () => {
    return await bikApi.get('/audit/logs');
};

// ================= EXCHANGE RATES =================
export const getExchangeRates = async () => {
    return await bikApi.get('/currency/rates');
};

// ================= TELLER (EXTENDED) =================
export const getAccountByNumber = async (number) => {
    return await bikApi.get(`/admin/accounts/by-number/${number}`);
};

export const depositCash = async (data) => {
    return await bikApi.post('/transactions/deposit', data);
};

export const withdrawCash = async (data) => {
    return await bikApi.post('/admin/ventanilla/retiro', data);
};

export const processCheck = async (data) => {
    return await bikApi.post('/transactions/check', data);
};
