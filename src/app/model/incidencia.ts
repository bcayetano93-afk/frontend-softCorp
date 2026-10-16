// Datos que se envían al registrar una incidencia
export interface IncidenciaRequest {
  codigoEquipo: string;
  problema: string;
  usuarioResponsable: string;
  area: string;
  medioReporte: 'EMAIL' | 'TELEFONO';
}

// Incidencia que devuelve el backend
export interface Incidencia {
  idIncidencia: number;
  codigo: string; // ej. INC-0007
  codigoEquipo: string;
  problema: string;
  usuarioResponsable: string;
  area: string | null;
  medioReporte: 'EMAIL' | 'TELEFONO';
  fechaRegistro: string;
  registradoPor: string;
  idTecnico: number | null;
  tecnico: string | null;
  fechaAsignacion: string | null;
  estado: 'PENDIENTE' | 'SOLUCIONADO';
}

// Carga de un técnico frente a su límite de atención
export interface TecnicoDisponibilidad {
  idTecnico: number;
  nombre: string;
  carga: number;
  limite: number;
  disponible: boolean;
}
