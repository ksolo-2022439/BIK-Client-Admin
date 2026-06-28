import { useAuthStore } from '../../features/auth/store/authStore';

const PERMISSIONS = {
  Administrador: {
    modules: ['dashboard', 'clients', 'accounts', 'requests', 'teller', 'cards', 'transactions', 'audit'],
    actions: ['create_user', 'create_account', 'modify_client', 'activate_user', 'approve_request', 'reject_request', 'escalate_request', 'deposit', 'withdrawal', 'cancel_account', 'generate_statement', 'manage_cards', 'view_transactions', 'view_audit']
  },
  Admin_Gestiones: {
    modules: ['dashboard', 'clients', 'accounts', 'requests', 'cards', 'transactions'],
    actions: ['create_user', 'create_account', 'modify_client', 'activate_user', 'approve_request', 'reject_request', 'manage_cards', 'view_transactions', 'generate_statement']
  },
  Soporte_Remoto: {
    modules: ['dashboard', 'clients', 'requests', 'transactions'],
    actions: ['escalate_request', 'view_transactions']
  },
  Soporte_Presencial: {
    modules: ['dashboard', 'clients', 'accounts', 'requests', 'cards', 'transactions'],
    actions: ['create_user', 'create_account', 'modify_client', 'activate_user', 'approve_request', 'reject_request', 'manage_cards', 'view_transactions']
  },
  Cajero: {
    modules: ['dashboard', 'clients', 'accounts', 'teller', 'cards', 'transactions'],
    actions: ['deposit', 'withdrawal', 'cancel_account', 'generate_statement', 'manage_cards', 'view_transactions']
  },
  Cliente: {
    modules: ['cuentas', 'transferencias', 'pagos', 'pago-qr', 'remesas', 'divisas', 'gestiones', 'seguros', 'finanzas', 'tarjetas', 'configuracion', 'notificaciones', 'tutoriales'],
    actions: ['view_accounts', 'make_transfer', 'pay_services', 'use_qr', 'request_products', 'sign_documents', 'view_finances', 'manage_settings']
  }
};

/**
 * Hook de permisos basado en el rol del usuario autenticado.
 * Determina qué módulos y acciones del panel administrativo están disponibles para la sesión.
 * 
 * @returns {Object} Funciones y estados de validación de permisos.
 */
export const usePermissions = () => {
  const roleFromStore = useAuthStore(state => state.role) || '';
  
  const rol = Object.keys(PERMISSIONS).find(
    key => key.toLowerCase() === roleFromStore.toLowerCase()
  ) || roleFromStore;

  const perms = PERMISSIONS[rol] || { modules: [], actions: [] };

  /**
   * Verifica si el usuario puede acceder a un módulo específico.
   * @param {string} module - Nombre del módulo (e.g. 'dashboard', 'teller', 'audit')
   * @returns {boolean} Acceso concedido o denegado.
   */
  const canAccessModule = (module) => perms.modules.includes(module);

  /**
   * Verifica si el usuario puede realizar una acción específica.
   * @param {string} action - Nombre de la acción (e.g. 'deposit', 'approve_request')
   * @returns {boolean} Permiso concedido o denegado.
   */
  const canPerformAction = (action) => perms.actions.includes(action);

  /**
   * Formatea el nombre técnico del rol para su visualización amigable en la interfaz.
   * @returns {string} Nombre amigable del rol.
   */
  const getRolDisplayName = () => {
    const names = {
      Administrador: 'Super Administrador',
      Admin_Gestiones: 'Administrador de Gestiones',
      Soporte_Remoto: 'Soporte al Cliente (Remoto)',
      Soporte_Presencial: 'Soporte al Cliente (Presencial)',
      Cajero: 'Cajero / Ventanilla',
      Cliente: 'Cliente Distinguido'
    };
    return names[rol] || rol;
  };

  return {
    rol,
    canAccessModule,
    canPerformAction,
    getRolDisplayName,
    availableModules: perms.modules,
    availableActions: perms.actions
  };
};
