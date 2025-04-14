/**
 * Módulo para gestionar secretos y claves API en la aplicación
 */

/**
 * Procesa un secreto, recuperándolo de las variables de entorno
 * o del sistema de gestión de secretos si está disponible
 * 
 * @param key Nombre del secreto
 * @param defaultValue Valor por defecto si no se encuentra el secreto
 * @returns El valor del secreto o el valor por defecto
 */
export function processSecret(key: string, defaultValue: string = ''): string {
  // Si tenemos el valor directamente en las variables de entorno, lo usamos
  if (process.env[key]) {
    return process.env[key] || defaultValue;
  }
  
  // En una implementación real, aquí buscaríamos en un sistema de secretos como
  // Google Secret Manager o AWS Secrets Manager, pero para simplificar usamos
  // directamente las variables de entorno en esta versión
  
  // Si no encontramos el secreto, devolvemos el valor por defecto
  console.warn(`Secret ${key} not found, using default value`);
  return defaultValue;
}

/**
 * Asegura que una clave API esté disponible y sea válida
 * 
 * @param key Nombre de la clave API
 * @returns Booleano indicando si la clave es válida
 */
export function validateApiKey(key: string): boolean {
  const value = processSecret(key);
  
  // Una clave API válida debe tener cierta longitud (esto es muy básico)
  return value.length > 10;
}

/**
 * Enmascara un secreto para registros y depuración segura
 * 
 * @param secret El secreto a enmascarar
 * @returns Versión enmascarada del secreto
 */
export function maskSecret(secret: string): string {
  if (!secret || secret.length < 8) {
    return '****';
  }
  
  // Mostrar primeros 4 y últimos 4 caracteres, enmascarar el resto
  const firstPart = secret.slice(0, 4);
  const lastPart = secret.slice(-4);
  const middlePart = '*'.repeat(Math.min(secret.length - 8, 10));
  
  return `${firstPart}${middlePart}${lastPart}`;
}