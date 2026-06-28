import { useState, useEffect } from 'react';
import { Shield, HeartPulse, Car, Activity, CheckCircle } from 'lucide-react';
import { useInsuranceStore } from './store/insuranceStore';
import { useAccountsStore } from '../accounts/store/accountsStore';
import { useAuthStore } from '../../auth/store/authStore';
import Swal from 'sweetalert2';
import { Modal } from '../../../shared/components/Modal';
import { formatGTQ } from '../../../shared/utils/currency';

/**
 * Vista premium para la visualización, contratación y cancelación de pólizas de seguro con débito automático.
 */
export const InsuranceView = () => {
    const [insurancePlans, setInsurancePlans] = useState([
        {
            id: 'fraude', title: 'Protección contra Fraude', tipo: 'Fraude',
            icon: <Shield size={32} />,
            description: 'Cubre transacciones no reconocidas, robo de identidad y clonación de tarjetas BIK.',
            price: '25.00', active: false, insuranceId: null
        },
        {
            id: 'vida', title: 'Seguro de Vida Integral', tipo: 'Vida',
            icon: <HeartPulse size={32} />,
            description: 'Respaldo económico para tu familia en caso de fallecimiento o invalidez total.',
            price: '150.00', active: false, insuranceId: null
        },
        {
            id: 'vehiculo', title: 'Seguro Vehicular Básico', tipo: 'Vehicular',
            icon: <Car size={32} />,
            description: 'Cobertura contra daños a terceros, grúa gratuita y asistencia vial 24/7.',
            price: '350.00', active: false, insuranceId: null
        },
        {
            id: 'salud', title: 'Seguro de Salud', tipo: 'Salud',
            icon: <Activity size={32} />,
            description: 'Consultas médicas, hospitalización y medicamentos cubiertos.',
            price: '200.00', active: false, insuranceId: null
        }
    ]);

    const { user } = useAuthStore();
    const { accounts: cuentas, fetchUserAccountsAndCards } = useAccountsStore();
    const { enrollInsurance, cancelInsurance, fetchUserInsurances, loading } = useInsuranceStore();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [cuentaId, setCuentaId] = useState('');

    /**
     * Sincroniza las cuentas del cliente y verifica el estado de pólizas contratadas activas en el servidor.
     */
    useEffect(() => {
        const fetchData = async () => {
            const userId = user?.publicId || user?.id || user?._id;
            if (userId) {
                await fetchUserAccountsAndCards(userId);
                const activeInsurances = await fetchUserInsurances();
                
                if (Array.isArray(activeInsurances)) {
                    setInsurancePlans(prev => prev.map(plan => {
                        const match = activeInsurances.find(i => i.tipo === plan.tipo && i.estado === 'Activo');
                        return match ? { ...plan, active: true, insuranceId: match._id } : plan;
                    }));
                }
            }
        };
        fetchData();
    }, [user, fetchUserAccountsAndCards, fetchUserInsurances]);

    /**
     * Inicializa la suscripción a una póliza seleccionando la cuenta de origen para débito automático.
     */
    const initiateEnrollment = (plan) => {
        if (plan.active) return;
        setSelectedPlan(plan);
        setCuentaId('');
        setIsModalOpen(true);
    };

    /**
     * Dispara una confirmación con SweetAlert antes de rescindir del contrato de seguro.
     */
    const handleCancelPolicy = async (plan) => {
        const result = await Swal.fire({
            title: '¿Cancelar póliza?',
            text: `Estás a punto de cancelar tu póliza de "${plan.title}". Esta acción dejará de aplicar el débito mensual.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonText: 'No, mantener',
            confirmButtonText: 'Sí, cancelar póliza'
        });
        if (result.isConfirmed) {
            try {
                if (plan.insuranceId) {
                    await cancelInsurance(plan.insuranceId);
                }
                setInsurancePlans(prev => prev.map(p =>
                    p.id === plan.id ? { ...p, active: false, insuranceId: null } : p
                ));
                Swal.fire('Póliza Cancelada', `Tu seguro "${plan.title}" ha sido cancelado exitosamente.`, 'success');
            } catch (err) {
                Swal.fire('Error', err.message || 'Error al cancelar la póliza', 'error');
            }
        }
    };

    /**
     * Registra la póliza y debita la primera cuota mensual de la cuenta seleccionada.
     */
    const handleEnrollInsurance = async (e) => {
        e.preventDefault();

        const selectedAcc = cuentas.find(c => c._id === cuentaId || c.id === cuentaId);
        if (selectedAcc && selectedAcc.saldo < Number(selectedPlan.price)) {
            Swal.fire({
                title: 'Saldo Insuficiente',
                text: `La cuenta seleccionada no posee fondos suficientes (Saldo: ${formatGTQ(selectedAcc.saldo)}) para cubrir la prima mensual de Q${Number(selectedPlan.price).toFixed(2)}.`,
                icon: 'warning',
                confirmButtonColor: '#1e3a8a'
            });
            return;
        }

        try {
            const userId = user?.publicId || user?.id || user?._id;
            const res = await enrollInsurance({
                usuarioId: userId,
                cuentaId,
                tipo: selectedPlan.tipo,
                primaMensual: Number(selectedPlan.price)
            });
            Swal.fire('Éxito', `Has contratado el seguro ${selectedPlan.title}`, 'success');
            setIsModalOpen(false);
            setInsurancePlans(prev => prev.map(p =>
                p.id === selectedPlan.id ? { ...p, active: true, insuranceId: res.data?._id } : p
            ));
            if (userId) fetchUserAccountsAndCards(userId);
        } catch (error) {
            Swal.fire('Error', error.message || 'Error al contratar el seguro', 'error');
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Mis Seguros</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300">Protege tu futuro y tu patrimonio con nuestras pólizas de débito automático.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-slide-up">
                {insurancePlans.map((plan) => (
                    <div key={plan.id}
                        className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 flex flex-col transition-all duration-300 ${plan.active
                                ? 'border-bik-blue dark:border-blue-500 shadow-md ring-1 ring-bik-blue/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}>
                        {plan.active && (
                            <div className="absolute top-4 right-4 text-bik-blue dark:text-blue-400 flex items-center text-sm font-bold">
                                <CheckCircle size={16} className="mr-1" /> Activo
                            </div>
                        )}
                        <div className={`p-4 rounded-full w-max mb-4 ${plan.active ? 'bg-blue-50 dark:bg-blue-900/30 text-bik-blue' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                            {plan.icon}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{plan.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1">{plan.description}</p>
                        <div className="mt-auto">
                            <div className="flex items-end mb-4">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">Q {plan.price}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1 mb-1">/ mes</span>
                            </div>
                            <button
                                onClick={() => plan.active ? handleCancelPolicy(plan) : initiateEnrollment(plan)}
                                className={`w-full py-3 rounded-lg font-bold transition-colors ${plan.active
                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400'
                                        : 'bg-bik-blue hover:bg-blue-800 text-white'
                                    }`}>
                                {plan.active ? 'Cancelar Póliza' : 'Contratar ahora'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Contratar ${selectedPlan?.title}`}>
                <form onSubmit={handleEnrollInsurance} className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Al contratar este seguro, se realizará un débito automático mensual por el valor de <strong>Q{selectedPlan?.price}</strong>.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cuenta a debitar</label>
                        <select value={cuentaId} onChange={(e) => setCuentaId(e.target.value)} required
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-bik-blue">
                            <option value="">Seleccione una cuenta</option>
                            {cuentas.filter(c => !c.isCard).map((c) => (
                                <option key={c._id} value={c._id}>{c.numeroCuenta} - [Saldo: {formatGTQ(c.saldo)}]</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full bg-bik-blue hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors mt-4 disabled:opacity-50">
                        {loading ? 'Contratando...' : 'Confirmar Contratación'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};