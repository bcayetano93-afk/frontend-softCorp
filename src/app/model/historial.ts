// HU12: historial de un equipo (HistorialEquipoResponse.java y sus DTOs)
export interface HistorialIncidencia {
  codigo: string;
  fechaRegistro: string;
  problema: string;
  usuarioResponsable: string;
  area: string | null;
  tecnico: string | null;
  estado: 'PENDIENTE' | 'SOLUCIONADO';
  fechaSolucion: string | null;
  diagnostico: string | null;
  solucionAplicada: string | null;
  piezasCambiadas: string | null;
}

export interface HistorialRepuesto {
  codigoIncidencia: string;
  codigoRepuesto: string;
  nombreRepuesto: string;
  cantidad: number;
  fechaSolicitud: string;
  fechaRespuesta: string | null;
}

export interface HistorialEquipo {
  codigoEquipo: string;
  totalFallas: number;
  pendientes: number;
  solucionadas: number;
  reemplazoSugerido: boolean;
  incidencias: HistorialIncidencia[];
  repuestos: HistorialRepuesto[];
}