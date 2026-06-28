/**
 * Mapa centralizado que transforma códigos de error o mensajes técnicos del backend
 * en descripciones comprensibles para el usuario final en el frontend.
 */
const ERROR_MAP = {
  // Autenticación
  'Credenciales inválidas': 'El usuario, correo, teléfono o contraseña ingresados son incorrectos. Por favor, verifica tus datos.',
  'Cuenta suspendida o en verificación.': 'Tu cuenta no está activa en este momento (suspendida o en proceso de verificación). Por favor, contacta a soporte.',
  'No hay token en la petición. Acceso denegado.': 'Sesión no válida o expirada. Por favor, inicia sesión nuevamente.',
  'Token no válido o ha expirado.': 'Tu sesión ha expirado por inactividad. Inicia sesión de nuevo para continuar.',
  
  // Registro de usuarios
  'El DPI, Correo Electrónico o Teléfono ya están registrados.': 'Ya existe un usuario registrado con este número de DPI, correo electrónico o teléfono celular.',
  'DPI debe tener 13 dígitos.': 'El número de DPI ingresado es incorrecto. Debe contener exactamente 13 caracteres numéricos.',
  'Ingresos mensuales mínimos de 100 GTQ.': 'Los ingresos mensuales reportados deben ser mayores o iguales a 100 GTQ.',
  
  // Transferencias y Ventanilla
  'El monto debe ser un número positivo válido.': 'El monto a transferir debe ser un número mayor a cero y no exceder los límites.',
  'Cuenta de origen o destino no encontrada.': 'La cuenta especificada no existe en el sistema. Verifica el número de cuenta.',
  'No tienes permiso para operar con esta cuenta.': 'No cuentas con los permisos necesarios para realizar transacciones desde esta cuenta bancaria.',
  'No puedes transferir a la misma cuenta.': 'La cuenta de destino no puede ser idéntica a la cuenta de origen.',
  'Ambas cuentas deben estar activas para realizar la transferencia.': 'La cuenta de origen o de destino no está activa. Ambas deben estar activas.',
  'Fondos insuficientes.': 'No tienes fondos disponibles suficientes en la cuenta de origen para cubrir esta transacción.',
  'Fondos insuficientes para la transferencia móvil.': 'Tu saldo es insuficiente para completar la transferencia móvil desde tu cuenta monetaria.',
  
  // Límites diarios
  'El monto supera el límite de transferencia diario.': 'La transacción excede el límite diario permitido para transferencias desde esta cuenta.',
  
  // General y Fallbacks
  'User validation failed': 'Los datos ingresados en el formulario no son válidos. Por favor, revisa todos los campos.',
  'Failed to fetch': 'Error de conexión con el servidor. Por favor, comprueba tu conexión a internet e intenta de nuevo.'
};

/**
 * Traduce un mensaje o código de error del servidor a una descripción amigable.
 * 
 * @param {string} backendMessage - El mensaje original devuelto por la API.
 * @returns {string} Mensaje traducido y legible.
 */
export const getReadableError = (backendMessage) => {
  if (!backendMessage) {
    return 'Ha ocurrido un error inesperado en el sistema. Intenta de nuevo más tarde.';
  }

  // Buscar coincidencia exacta
  if (ERROR_MAP[backendMessage]) {
    return ERROR_MAP[backendMessage];
  }

  // Buscar coincidencia parcial
  for (const [key, value] of Object.entries(ERROR_MAP)) {
    if (backendMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Parsear errores de validación estructurados (e.g. Mongoose Validation)
  if (backendMessage.includes('validation failed') || backendMessage.includes('ValidationError')) {
    return 'Error de validación: Algunos campos del formulario contienen datos con formato no válido.';
  }

  // Mensaje por defecto si no hay coincidencia
  return backendMessage;
};
