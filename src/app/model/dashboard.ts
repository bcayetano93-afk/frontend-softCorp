export interface DashboardResumen {
  totalIncidencias: number;
  incidenciasPendientes: number;
  incidenciasSolucionadas: number;
  equiposEnSoporte: number;
  repuestosPendientes: number;
  fallasDocumentadas: number;
}

export interface ChartItem {
  etiqueta: string;
  cantidad: number;
}

export interface ChartSerieEstado {
  categoria: string;
  pendientes: number;
  solucionadas: number;
}
