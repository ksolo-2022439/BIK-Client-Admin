/**
 * Matriz de permisos por rol para el panel administrativo de BIK.
 * Define qué módulos y acciones están disponibles para cada rol.
 * 'Administrador' es super-admin y tiene acceso a TODO.
 */

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
  }
};

import { useAuthStore } from '../../features/auth/store/authStore';

/**
 * Hook de permisos basado en el rol del usuario autenticado.
 * Determina qué módulos y acciones están disponibles.
 */
export const usePermissions = () => {
  const roleFromStore = useAuthStore(state => state.role) || '';
  
  // Normalización: Buscamos la clave que coincida ignorando mayúsculas/minúsculas
  const rol = Object.keys(PERMISSIONS).find(
    key => key.toLowerCase() === roleFromStore.toLowerCase()
  ) || roleFromStore;

  const perms = PERMISSIONS[rol] || { modules: [], actions: [] };

  /**
   * Verifica si el usuario puede acceder a un módulo específico.
   * @param {string} module - Nombre del módulo (e.g. 'dashboard', 'teller', 'audit')
   */
  const canAccessModule = (module) => perms.modules.includes(module);

  /**
   * Verifica si el usuario puede realizar una acción específica.
   * @param {string} action - Nombre de la acción (e.g. 'deposit', 'approve_request')
   */
  const canPerformAction = (action) => perms.actions.includes(action);

  /**
   * Formatea el nombre del rol para visualización.
   */
  const getRolDisplayName = () => {
    const names = {
      Administrador: 'Super Administrador',
      Admin_Gestiones: 'Administrador de Gestiones',
      Soporte_Remoto: 'Soporte al Cliente (Remoto)',
      Soporte_Presencial: 'Soporte al Cliente (Presencial)',
      Cajero: 'Cajero / Ventanilla'
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
