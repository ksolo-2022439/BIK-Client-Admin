import { bikApi } from './axiosInstance';

/**
 * @fileoverview Clientes API de integración con los módulos de administración y auditoría de BIK.
 */

/**
 * Obtiene métricas generales y estadísticas consolidadas para el panel de administración.
 * @returns {Promise<Object>} Promesa con la respuesta de estadísticas.
 */
export const getDashboardStats = async () => {
    return await bikApi.get('/admin/dashboard/stats');
};

/**
 * Obtiene una lista paginada y filtrada de usuarios.
 * @param {Object} params - Parámetros de paginación y búsqueda.
 * @returns {Promise<Object>} Promesa con la respuesta del listado de usuarios.
 */
export const listUsers = async (params) => {
    return await bikApi.get('/admin/users', { params });
};

/**
 * Recupera el perfil unificado e historial del cliente (cuentas, tarjetas y gestiones).
 * @param {string} id - ID único del usuario.
 * @returns {Promise<Object>} Promesa con el perfil extendido.
 */
export const getFullClientProfile = async (id) => {
    return await bikApi.get(`/admin/users/${id}/full-profile`);
};

/**
 * Registra un nuevo cliente del banco a través del portal administrativo.
 * @param {Object} data - Datos de registro del cliente.
 * @returns {Promise<Object>} Promesa con el resultado de la creación.
 */
export const createClient = async (data) => {
    return await bikApi.post('/users/register', data);
};

/**
 * Actualiza la información demográfica o de contacto de un cliente.
 * @param {string} id - ID del cliente.
 * @param {Object} data - Campos a modificar.
 * @returns {Promise<Object>} Promesa con el resultado de la actualización.
 */
export const updateClient = async (id, data) => {
    return await bikApi.put(`/users/${id}/update`, data);
};

/**
 * Cambia el estado del usuario (ej. Activo, Suspendido).
 * @param {string} id - ID del cliente.
 * @param {Object} statusData - Nuevo estado a asignar.
 * @returns {Promise<Object>} Promesa con el resultado del cambio de estado.
 */
export const updateClientStatus = async (id, statusData) => {
    return await bikApi.patch(`/users/${id}/status`, statusData);
};

/**
 * Obtiene una lista paginada de todas las cuentas registradas en el banco.
 * @param {Object} params - Parámetros de búsqueda y paginación.
 * @returns {Promise<Object>} Lista de cuentas.
 */
export const listAccounts = async (params) => {
    return await bikApi.get('/admin/accounts', { params });
};

/**
 * Recupera la información específica y detallada de una cuenta bancaria.
 * @param {string} id - ID de la cuenta.
 * @returns {Promise<Object>} Información detallada de la cuenta.
 */
export const getAccountDetail = async (id) => {
    return await bikApi.get(`/admin/accounts/${id}/detail`);
};

/**
 * Crea una nueva cuenta bancaria para un cliente existente.
 * @param {Object} data - Tipo de cuenta, moneda e inicialización de saldos.
 * @returns {Promise<Object>} Resultado de la creación.
 */
export const createAccount = async (data) => {
    return await bikApi.post('/accounts', data);
};

/**
 * Lista las solicitudes de productos financieros de los usuarios.
 * @param {Object} params - Parámetros de filtrado por estado y tipo.
 * @returns {Promise<Object>} Lista de solicitudes.
 */
export const listRequests = async (params) => {
    return await bikApi.get('/admin/requests', { params });
};

/**
 * Obtiene el detalle de una solicitud administrativa específica por ID.
 * @param {string} id - ID de la solicitud.
 * @returns {Promise<Object>} Detalle de la solicitud.
 */
export const getRequestById = async (id) => {
    return await bikApi.get(`/admin/requests/${id}`);
};

/**
 * Aprueba o rechaza una solicitud administrativa de producto.
 * @param {string} id - ID de la solicitud.
 * @param {Object} data - Estado destino ("Aprobado" o "Rechazado") y motivos.
 * @returns {Promise<Object>} Respuesta del servidor.
 */
export const updateRequestStatus = async (id, data) => {
    return await bikApi.patch(`/requests/${id}/status`, data);
};

/**
 * Escala una solicitud a revisión de prioridad alta por un super-administrador.
 * @param {string} id - ID de la solicitud.
 * @param {Object} data - Motivo de escalación.
 * @returns {Promise<Object>} Respuesta del servidor.
 */
export const escalateRequest = async (id, data) => {
    return await bikApi.patch(`/admin/requests/${id}/escalate`, data);
};

/**
 * Consulta un cliente por su número de DPI.
 * @param {string} dpi - DPI del cliente.
 * @returns {Promise<Object>} Datos del cliente asociado.
 */
export const searchUserByDpi = async (dpi) => {
    return await bikApi.get(`/users/${dpi}`);
};

/**
 * Obtiene las tarjetas de débito o crédito que pertenecen a un cliente.
 * @param {string} userId - ID del cliente.
 * @returns {Promise<Object>} Lista de tarjetas.
 */
export const getCardsByUser = async (userId) => {
    return await bikApi.get(`/cards/user/${userId}`);
};

/**
 * Bloquea temporalmente o desbloquea una tarjeta activa del cliente.
 * @param {string} id - ID de la tarjeta.
 * @returns {Promise<Object>} Respuesta de actualización.
 */
export const freezeCard = async (id) => {
    return await bikApi.patch(`/cards/${id}/freeze`);
};

/**
 * Busca una cuenta por su número estructurado desde la ventanilla.
 * @param {string} number - Número de cuenta de origen o destino.
 * @returns {Promise<Object>} Datos de la cuenta asociada.
 */
export const findAccountByNumber = async (number) => {
    return await bikApi.get(`/admin/accounts/by-number/${number}`);
};

/**
 * Ejecuta un depósito en efectivo a una cuenta monetaria o de ahorros.
 * @param {Object} data - ID de la cuenta, monto y descripción del depósito.
 * @returns {Promise<Object>} Transacción resultante.
 */
export const executeDeposit = async (data) => {
    return await bikApi.post('/transactions/deposit', data);
};

/**
 * Ejecuta un retiro en ventanilla debitando saldo de la cuenta indicada.
 * @param {Object} data - ID de la cuenta, monto y token de autorización.
 * @returns {Promise<Object>} Transacción resultante.
 */
export const executeWithdrawal = async (data) => {
    return await bikApi.post('/admin/ventanilla/retiro', data);
};

/**
 * Obtiene el estado de cuenta y movimientos de un rango de fechas.
 * @param {string} id - ID de la cuenta bancaria.
 * @param {Object} params - Fechas de inicio y fin.
 * @returns {Promise<Object>} Estado de cuenta y transacciones asociadas.
 */
export const getAccountStatement = async (id, params) => {
    return await bikApi.get(`/admin/accounts/${id}/statement`, { params });
};

/**
 * Lista el historial global de transacciones en el portal administrativo.
 * @param {Object} params - Parámetros de filtros de búsqueda.
 * @returns {Promise<Object>} Historial transaccional.
 */
export const listTransactions = async (params) => {
    return await bikApi.get('/admin/transactions', { params });
};

/**
 * Recupera las bitácoras y registros de auditoría del sistema BIK.
 * @returns {Promise<Object>} Lista de logs de auditoría.
 */
export const getAuditLogs = async () => {
    return await bikApi.get('/audit/logs');
};

/**
 * Obtiene las tasas cambiarias registradas.
 * @returns {Promise<Object>} Tasas activas.
 */
export const getExchangeRates = async () => {
    return await bikApi.get('/currency/rates');
};

/**
 * Busca cuentas en ventanilla por número de cuenta.
 * @param {string} number - Número de cuenta.
 * @returns {Promise<Object>} Cuenta bancaria.
 */
export const getAccountByNumber = async (number) => {
    return await bikApi.get(`/admin/accounts/by-number/${number}`);
};

/**
 * Deposita efectivo en ventanilla.
 * @param {Object} data - Payload del depósito.
 * @returns {Promise<Object>} Transacción resultante.
 */
export const depositCash = async (data) => {
    return await bikApi.post('/transactions/deposit', data);
};

/**
 * Retira efectivo en ventanilla.
 * @param {Object} data - Payload del retiro.
 * @returns {Promise<Object>} Transacción resultante.
 */
export const withdrawCash = async (data) => {
    return await bikApi.post('/admin/ventanilla/retiro', data);
};

/**
 * Procesa el pago de un cheque de BIK o caja compensadora.
 * @param {Object} data - Datos del cheque, número y monto.
 * @returns {Promise<Object>} Transacción resultante.
 */
export const processCheck = async (data) => {
    return await bikApi.post('/transactions/check', data);
};
