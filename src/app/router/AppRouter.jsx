import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layout/AdminLayout';
import { AuthLayout } from '../layout/AuthLayout';
import { ClientLayout } from '../layout/ClientLayout';

// Guards
import { AdminProtectedRoute } from './AdminProtectedRoute';
import { ClientProtectedRoute } from './ClientProtectedRoute';

// Vistas Públicas
import { LoginView } from '../../features/auth/LoginView';
import { RegisterView } from '../../features/auth/RegisterView';
import { ForgotPasswordView } from '../../features/auth/ForgotPasswordView';

// Vistas Administrativas (Admin)
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

// Vistas de Banca en Línea (Cliente)
import { AccountsView } from '../../features/user/accounts/AccountsView';
import { AccountSettingsView } from '../../features/user/accounts/AccountSettingsView';
import { LimitsView } from '../../features/user/accounts/LimitsView';
import { BlocksView } from '../../features/user/accounts/BlocksView';
import { MobileTransfersView } from '../../features/user/transfers/MobileTransfersView';
import { InternationalTransfersView } from '../../features/user/transfers/InternationalTransfersView';
import { InternalTransfersView } from '../../features/user/transfers/InternalTransfersView';
import { AchTransfersView } from '../../features/user/transfers/AchTransfersView';
import { QrPayView } from '../../features/user/qr-pay/QrPayView';
import { RemittanceView } from '../../features/user/currency/RemittanceView';
import { CurrencyExchangeView } from '../../features/user/currency/CurrencyExchangeView';
import { ExchangeRateView } from '../../features/user/currency/ExchangeRateView';
import { OnlineRequestsView } from '../../features/user/requests/OnlineRequestsView';
import { RequestsView } from '../../features/user/requests/RequestsView';
import { DocumentsView } from '../../features/user/documents/DocumentsView';
import { FinancesView } from '../../features/user/finances/FinancesView';
import { InsuranceView } from '../../features/user/insurance/InsuranceView';
import { CardSettingsView } from '../../features/user/cards/CardSettingsView';
import { GeneralSettingsView } from '../../features/user/settings/GeneralSettingsView';
import { NotificationsView } from '../../features/user/notifications/NotificationsView';
import { TutorialsView } from '../../features/user/info/TutorialsView';
import { PaymentsView } from '../../features/user/payments/PaymentsView';

/**
 * Enrutador principal de BIK (Banca Digital y Consola de Administración).
 * Orquesta y segrega el acceso a través de guards basados en roles de usuario.
 */
export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="/recuperar" element={<ForgotPasswordView />} />
        </Route>

        {/* Consola Administrativa (Rol: Empleados) */}
        <Route element={<AdminProtectedRoute />}>
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

        {/* Portal de Banca en Línea (Rol: Cliente) */}
        <Route element={<ClientProtectedRoute />}>
          <Route path="/mi-banca" element={<ClientLayout />}>
            <Route index element={<Navigate to="/mi-banca/cuentas" replace />} />
            
            <Route path="cuentas" element={<AccountsView />} />
            <Route path="cuentas/mantenimiento" element={<AccountSettingsView />} />
            <Route path="cuentas/limites" element={<LimitsView />} />
            <Route path="cuentas/bloqueos" element={<BlocksView />} />
            
            <Route path="transferencias/internas" element={<InternalTransfersView />} />
            <Route path="transferencias/ach" element={<AchTransfersView />} />
            <Route path="transferencias/moviles" element={<MobileTransfersView />} />
            <Route path="transferencias/internacionales" element={<InternationalTransfersView />} />
            
            <Route path="pagos" element={<PaymentsView />} />
            <Route path="pago-qr" element={<QrPayView />} />
            
            <Route path="remesas/cobro" element={<RemittanceView />} />
            <Route path="divisas/negociacion" element={<CurrencyExchangeView />} />
            <Route path="divisas/tipo-cambio" element={<ExchangeRateView />} />
            
            <Route path="gestiones/en-linea" element={<OnlineRequestsView />} />
            <Route path="gestiones/solicitud-productos" element={<RequestsView />} />
            <Route path="gestiones/documentos" element={<DocumentsView />} />
            
            <Route path="seguros" element={<InsuranceView />} />
            <Route path="finanzas" element={<FinancesView />} />
            <Route path="tarjetas/configuracion" element={<CardSettingsView />} />
            <Route path="configuracion/general" element={<GeneralSettingsView />} />
            <Route path="notificaciones" element={<NotificationsView />} />
            <Route path="tutoriales" element={<TutorialsView />} />
          </Route>
        </Route>

        {/* Fallback de Redireccionamiento */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
