// Ícono de cada módulo del menú según su URL
const ICONOS: Record<string, string> = {
  'registrar-incidencia': '📝',
  'asignar-incidencia': '👥',
  'mis-tareas': '🛠️',
  'solicitar-repuesto': '📦',
  'informe-tecnico': '📄',
  'diccionario-fallas': '📚',
  'gestion-roles': '🔐',
  reportes: '📊',
  'historial-equipos': '🖥️',
};

export function iconoModulo(url: string): string {
  return ICONOS[url] ?? '📁';
}
