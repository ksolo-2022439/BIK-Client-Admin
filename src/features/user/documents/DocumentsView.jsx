import { useState, useEffect } from 'react';
import { FileText, FileSignature, Download, CheckCircle, Clock } from 'lucide-react';
import { useDocumentsStore } from './store/documentsStore';
import Swal from 'sweetalert2';

export const DocumentsView = () => {
    const { 
        documents, 
        loading, 
        fetchDocuments, 
        signDocument: handleSignDocument 
    } = useDocumentsStore();

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleSignAction = async (id) => {
        try {
            await handleSignDocument(id);
            Swal.fire('Éxito', 'Documento firmado digitalmente con éxito', 'success');
        } catch (error) {
            Swal.fire('Error', error.message || 'Error al firmar documento', 'error');
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Firma de Documentos</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300">Gestiona tus contratos y políticas de manera 100% digital y segura.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-up">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300">
                                <th className="p-4">Documento</th>
                                <th className="p-4">Fecha de Emisión</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-4 text-center text-gray-500">Cargando documentos...</td>
                                </tr>
                            ) : documents.length === 0 ? null : documents.map((doc) => (
                                <tr key={doc._id || doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                    <td className="p-4 flex items-center">
                                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 mr-3">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{doc.titulo || doc.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{doc.tipo || doc.type}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{doc.fechaEmision ? new Date(doc.fechaEmision).toLocaleDateString() : doc.date}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${doc.estado === 'Firmado' || doc.status === 'Firmado'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                            }`}>
                                            {(doc.estado === 'Firmado' || doc.status === 'Firmado') ? <CheckCircle size={14} className="mr-1" /> : <Clock size={14} className="mr-1" />}
                                            {doc.estado || doc.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        {(doc.estado === 'Pendiente' || doc.status === 'Pendiente') ? (
                                            <button 
                                                onClick={() => handleSignAction(doc._id || doc.id)}
                                                className="inline-flex items-center text-sm bg-bik-blue hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                            >
                                                <FileSignature size={16} className="mr-2" /> Firmar
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => Swal.fire('Información', 'La descarga de documentos estará disponible pronto', 'info')}
                                                className="inline-flex items-center text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium py-2 px-4 rounded-lg transition-colors"
                                            >
                                                <Download size={16} className="mr-2" /> Descargar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {!loading && documents.length === 0 && (
                <div className="p-12 text-center">
                    <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-full w-max mx-auto mb-6"><FileText size={40} className="text-gray-400" /></div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sin documentos pendientes</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">No tienes contratos ni documentos disponibles para firma en este momento.</p>
                </div>
            )}
        </div>
    );
};