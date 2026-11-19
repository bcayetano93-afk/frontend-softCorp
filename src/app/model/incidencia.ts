export interface IncidenciaRequest {
  codigoEquipo: string;
  problema: string;
  usuarioResponsable: string;
  area: string;
  medioReporte: 'EMAIL' | 'TELEFONO';
}

export interface Incidencia {
  idIncidencia: number;
  codigo: string;
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

export interface TecnicoDisponibilidad {
  idTecnico: number;
  nombre: string;
  carga: number;
  limite: number;
  disponible: boolean;
}

// --- Sprint 3 (persistido en frontend con StorageService) ---
export type EstadoRepuesto = 'SOLICITADO' | 'EN_ESPERA' | 'RECIBIDO';
export type LugarAtencion = 'OFICINA_USUARIO' | 'AREA_SOPORTE';

export interface SolicitudRepuesto {
  idSolicitud: number;
  idIncidencia: number;
  codigoIncidencia: string;
  codigoEquipo: string;
  repuesto: string;
  cantidad: number;
  motivo: string;
  equipoTrasladado: boolean;
  fechaSolicitud: string;
  tecnicoSolicitante: string;
  estado: EstadoRepuesto;
}

export interface InformeTecnico {
  idInforme: number;
  idIncidencia: number;
  codigoIncidencia: string;
  codigoEquipo: string;
  diagnostico: string;
  solucion: string;
  piezasCambiadas: string;
  lugarAtencion: LugarAtencion;
  fechaSolucion: string;
  tecnico: string;
}

export interface FallaDiccionario {
  idFalla: number;
  titulo: string;
  palabraClave: string;
  sintoma: string;
  solucion: string;
  actualizadoPor: string;
  fechaActualizacion: string;
}
