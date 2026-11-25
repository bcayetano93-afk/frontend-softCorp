// HU10: una fila del reporte de equipos con problemas complicados (EquipoComplicadoResponse.java)
export interface EquipoComplicado {
  idIncidencia: number;
  codigo: string;
  codigoEquipo: string;
  problema: string;
  usuarioResponsable: string;
  area: string | null;
  tecnico: string | null;
  fechaRegistro: string;
  fechaTraslado: string | null;
  diasTranscurridos: number;
  trasladado: boolean;
  esperaRepuesto: boolean;
}


// HU11: equipos que solucionó un técnico en un día (SolucionadasPorDiaResponse.java)
export interface SolucionadasPorDia {
  fecha: string;      // yyyy-MM-dd
  tecnico: string;
  cantidad: number;
}