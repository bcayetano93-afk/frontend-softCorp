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
  ubicacionEquipo?: 'OFICINA_USUARIO' | 'AREA_SOPORTE' | string;
  fechaTraslado?: string | null;
  fechaSolucion?: string | null;
}

export interface TecnicoDisponibilidad {
  idTecnico: number;
  nombre: string;
  carga: number;
  limite: number;
  disponible: boolean;
}

// --- Sprint 3 (conectado a endpoints reales del backend) ---
export type EstadoRepuesto = 'SOLICITADO' | 'RECIBIDO' | 'RECHAZADO';
export type LugarAtencion = 'OFICINA_USUARIO' | 'AREA_SOPORTE';
export type CategoriaFalla =
  | 'HARDWARE'
  | 'SOFTWARE'
  | 'RED'
  | 'IMPRESORA'
  | 'SISTEMA_OPERATIVO'
  | 'OTRO';

export interface SolicitudRepuestoRequest {
  idIncidencia: number;
  codigoRepuesto: string;
  nombreRepuesto: string;
  cantidad: number;
  justificacion: string;
  trasladarEquipo: boolean;
}

export interface SolicitudRepuesto {
  idSolicitud: number;
  codigoSolicitud: string;
  idIncidencia: number;
  codigoIncidencia: string;
  codigoEquipo: string;
  ubicacionEquipo: string;
  tecnico: string;
  codigoRepuesto: string;
  nombreRepuesto: string;
  cantidad: number;
  justificacion: string;
  trasladarEquipo: boolean;
  fechaTraslado: string | null;
  estado: EstadoRepuesto;
  fechaSolicitud: string;
  fechaRespuesta: string | null;
}

export interface InformeTecnicoRequest {
  idIncidencia: number;
  diagnostico: string;
  solucionAplicada: string;
  piezasCambiadas: string;
  lugarSolucion: LugarAtencion;
}

export interface InformeTecnico {
  idInforme: number;
  idIncidencia: number;
  codigoIncidencia: string;
  codigoEquipo: string;
  tecnico: string;
  diagnostico: string;
  solucionAplicada: string;
  piezasCambiadas: string | null;
  lugarSolucion: LugarAtencion;
  fechaInforme: string;
  estadoIncidencia: string;
}

export interface DiccionarioFallaRequest {
  codigoFalla: string;
  titulo: string;
  categoria: CategoriaFalla;
  sintomas: string;
  causaProbable: string;
  solucion: string;
}

export interface FallaDiccionario {
  idFalla: number;
  codigoFalla: string;
  titulo: string;
  categoria: CategoriaFalla;
  sintomas: string;
  causaProbable: string;
  solucion: string;
  autor: string;
  createdAt: string;
  updatedAt: string | null;
}
