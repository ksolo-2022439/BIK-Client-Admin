# BIK - Client Admin

Interfaz de administración interna para el personal de Banco Informático Kinal (BIK). Proporciona a los empleados, ejecutivos, y personal de servicio al cliente las herramientas necesarias para operar el banco digitalmente con control de accesos basado en roles.

## Módulos de Operación
- **Dashboard Central**: Métricas en tiempo real y volumen de transacciones de la plataforma.
- **Gestión de Clientes y Cuentas**: Crear nuevos usuarios, aprobar cuentas bancarias, verificar documentos de identidad y cambiar límites operativos.
- **Ventanilla (Cajeros)**: Módulo especializado para depósitos y retiros en efectivo físico, abono de cheques e impresión de estados de cuenta.
- **Auditoría**: Monitoreo seguro de la huella digital (quién ejecutó qué petición en el servidor y a qué hora).
- **Gestiones**: Interfaz de "ticket" para que el personal atienda las solicitudes en línea enviadas por los clientes desde su app.

## Tecnologías
- Vite + React + TailwindCSS
- Consumo de API REST (`BIK-Server-Admin`)
- Protegido por JWT (1 hora de expiración)
