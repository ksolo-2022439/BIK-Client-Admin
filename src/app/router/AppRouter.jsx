import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layout/AdminLayout';
import { AuthLayout } from '../layout/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginView } from '../../features/auth/LoginView';
import { DashboardView } from '../../features/dashboard/DashboardView';
import { ClientSearchView } from '../../features/clients/ClientSearchView';
import { ClientProfileView } from '../../features/clients/ClientProfileView';
import { CreateClientView } from '../../features/clients/CreateClientView';
import { AccountsListView } from '../../features/accounts/AccountsListView';
import { AccountDetailView } from '../../features/accounts/AccountDetailView';
import { CreateAccountView } from '../../features/accounts/CreateAccountView';
import { RequestsListView } from '../../features/requests/RequestsListView';
import { RequestDetailView } from '../../features/requests/RequestDetailView';
import { DepositView } from '../../features/teller/DepositView';
import { WithdrawalView } from '../../features/teller/WithdrawalView';
import { StatementView } from '../../features/teller/StatementView';
import { ChecksView } from '../../features/teller/ChecksView';
import { CardsManageView } from '../../features/cards/CardsManageView';
import { TransactionsView } from '../../features/transactions/TransactionsView';
import { AuditLogView } from '../../features/audit/AuditLogView';

/**
 * Enrutador principal del panel administrativo BIK.
 */
export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas (login) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginView />} />
        </Route>

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route path="dashboard" element={<DashboardView />} />
            
            <Route path="clientes" element={<ClientSearchView />} />
            <Route path="clientes/:id" element={<ClientProfileView />} />
            <Route path="clientes/nuevo" element={<CreateClientView />} />
            
            <Route path="cuentas" element={<AccountsListView />} />
            <Route path="cuentas/nueva" element={<CreateAccountView />} />
            <Route path="cuentas/:id" element={<AccountDetailView />} />
            
            <Route path="gestiones" element={<RequestsListView />} />
            <Route path="gestiones/:id" element={<RequestDetailView />} />
            
            <Route path="ventanilla" element={<DepositView />} />
            <Route path="ventanilla/retiro" element={<WithdrawalView />} />
            <Route path="ventanilla/estado-cuenta" element={<StatementView />} />
            <Route path="ventanilla/cheques" element={<ChecksView />} />
            
            <Route path="tarjetas" element={<CardsManageView />} />
            <Route path="transacciones" element={<TransactionsView />} />
            <Route path="auditoria" element={<AuditLogView />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
