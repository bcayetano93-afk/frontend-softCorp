import { Injectable, inject, signal } from '@angular/core';
import {
  EstadoRepuesto,
  FallaDiccionario,
  Incidencia,
  InformeTecnico,
  LugarAtencion,
  SolicitudRepuesto,
} from '../model/incidencia';
import { StorageService } from './storage';

const KEY_REPUESTOS = 'softcorp_repuestos_v1';
const KEY_INFORMES = 'softcorp_informes_v1';
const KEY_CERRADAS = 'softcorp_incidencias_cerradas_v1';
const KEY_DICCIONARIO = 'softcorp_diccionario_fallas_v1';

const FALLAS_INICIALES: FallaDiccionario[] = [
  {
    idFalla: 1,
    titulo: 'Windows no inicia (pantalla azul / boot loop)',
    palabraClave: 'windows, arranque, boot, disco',
    sintoma: 'El equipo se reinicia antes de llegar al escritorio o muestra código de error de arranque.',
    solucion: 'Ejecutar reparación de inicio desde USB bootable, correr chkdsk /f y verificar salud SMART del disco.',
    actualizadoPor: 'Luis Mendoza',
    fechaActualizacion: '2026-10-16T10:00:00',
  },
  {
    idFalla: 2,
    titulo: 'Impresora compartida no reconocida en red',
    palabraClave: 'impresora, red, spooler, driver',
    sintoma: 'El usuario envía a imprimir pero la impresora aparece sin conexión o en cola infinita.',
    solucion: 'Reiniciar servicio Cola de impresión (spooler), verificar IP estática y reinstalar driver PCL6.',
    actualizadoPor: 'Ana Torres',
    fechaActualizacion: '2026-10-16T11:30:00',
  },
];

@Injectable({ providedIn: 'root' })
export class SoporteTecnicoService {
  private storage = inject(StorageService);

  solicitudesRepuesto = signal<SolicitudRepuesto[]>(this.leerJson(KEY_REPUESTOS, []));
  informesTecnicos = signal<InformeTecnico[]>(this.leerJson(KEY_INFORMES, []));
  incidenciasCerradas = signal<number[]>(this.leerJson(KEY_CERRADAS, []));
  diccionarioFallas = signal<FallaDiccionario[]>(this.leerJson(KEY_DICCIONARIO, FALLAS_INICIALES));

  combinarConEstadoLocal(incidencias: Incidencia[]): Incidencia[] {
    const cerradas = new Set(this.incidenciasCerradas());
    return incidencias.map((inc) =>
      cerradas.has(inc.idIncidencia) ? { ...inc, estado: 'SOLUCIONADO' } : inc,
    );
  }

  tieneRepuestoPendiente(idIncidencia: number): boolean {
    return this.solicitudesRepuesto().some(
      (s) => s.idIncidencia === idIncidencia && s.estado !== 'RECIBIDO',
    );
  }

  estaTrasladado(idIncidencia: number): boolean {
    return this.solicitudesRepuesto().some(
      (s) => s.idIncidencia === idIncidencia && s.equipoTrasladado,
    );
  }

  registrarSolicitudRepuesto(data: {
    incidencia: Incidencia;
    repuesto: string;
    cantidad: number;
    motivo: string;
    equipoTrasladado: boolean;
    tecnicoSolicitante: string;
  }): SolicitudRepuesto {
    const nueva: SolicitudRepuesto = {
      idSolicitud: Date.now(),
      idIncidencia: data.incidencia.idIncidencia,
      codigoIncidencia: data.incidencia.codigo,
      codigoEquipo: data.incidencia.codigoEquipo,
      repuesto: data.repuesto,
      cantidad: data.cantidad,
      motivo: data.motivo,
      equipoTrasladado: data.equipoTrasladado,
      fechaSolicitud: new Date().toISOString(),
      tecnicoSolicitante: data.tecnicoSolicitante,
      estado: 'SOLICITADO',
    };
    this.solicitudesRepuesto.update((lista) => [nueva, ...lista]);
    this.guardarJson(KEY_REPUESTOS, this.solicitudesRepuesto());
    return nueva;
  }

  cambiarEstadoRepuesto(idSolicitud: number, estado: EstadoRepuesto): void {
    this.solicitudesRepuesto.update((lista) =>
      lista.map((s) => (s.idSolicitud === idSolicitud ? { ...s, estado } : s)),
    );
    this.guardarJson(KEY_REPUESTOS, this.solicitudesRepuesto());
  }

  registrarInformeTecnico(data: {
    incidencia: Incidencia;
    diagnostico: string;
    solucion: string;
    piezasCambiadas: string;
    lugarAtencion: LugarAtencion;
    tecnico: string;
  }): InformeTecnico {
    const informe: InformeTecnico = {
      idInforme: Date.now(),
      idIncidencia: data.incidencia.idIncidencia,
      codigoIncidencia: data.incidencia.codigo,
      codigoEquipo: data.incidencia.codigoEquipo,
      diagnostico: data.diagnostico,
      solucion: data.solucion,
      piezasCambiadas: data.piezasCambiadas,
      lugarAtencion: data.lugarAtencion,
      fechaSolucion: new Date().toISOString(),
      tecnico: data.tecnico,
    };

    this.informesTecnicos.update((lista) => [informe, ...lista]);
    this.guardarJson(KEY_INFORMES, this.informesTecnicos());

    if (!this.incidenciasCerradas().includes(data.incidencia.idIncidencia)) {
      this.incidenciasCerradas.update((ids) => [...ids, data.incidencia.idIncidencia]);
      this.guardarJson(KEY_CERRADAS, this.incidenciasCerradas());
    }
    return informe;
  }

  guardarFalla(data: {
    idFalla?: number | null;
    titulo: string;
    palabraClave: string;
    sintoma: string;
    solucion: string;
    actualizadoPor: string;
  }): void {
    const ahora = new Date().toISOString();
    if (data.idFalla) {
      this.diccionarioFallas.update((lista) =>
        lista.map((f) =>
          f.idFalla === data.idFalla
            ? {
                ...f,
                titulo: data.titulo,
                palabraClave: data.palabraClave,
                sintoma: data.sintoma,
                solucion: data.solucion,
                actualizadoPor: data.actualizadoPor,
                fechaActualizacion: ahora,
              }
            : f,
        ),
      );
    } else {
      const nueva: FallaDiccionario = {
        idFalla: Date.now(),
        titulo: data.titulo,
        palabraClave: data.palabraClave,
        sintoma: data.sintoma,
        solucion: data.solucion,
        actualizadoPor: data.actualizadoPor,
        fechaActualizacion: ahora,
      };
      this.diccionarioFallas.update((lista) => [nueva, ...lista]);
    }
    this.guardarJson(KEY_DICCIONARIO, this.diccionarioFallas());
  }

  eliminarFalla(idFalla: number): void {
    this.diccionarioFallas.update((lista) => lista.filter((f) => f.idFalla !== idFalla));
    this.guardarJson(KEY_DICCIONARIO, this.diccionarioFallas());
  }

  private leerJson<T>(key: string, fallback: T): T {
    const raw = this.storage.getItem(key);
    if (!raw) {
      return fallback;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private guardarJson<T>(key: string, value: T): void {
    this.storage.setItem(key, JSON.stringify(value));
  }
}
