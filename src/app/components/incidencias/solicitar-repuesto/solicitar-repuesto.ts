import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EstadoRepuesto, Incidencia, SolicitudRepuesto } from '../../../model/incidencia';
import { ConfirmDialogService } from '../../../services/confirm-dialog';
import { IncidenciaService } from '../../../services/incidencia';
import { SoporteTecnicoService } from '../../../services/soporte-tecnico';
import { ToastService } from '../../../services/toast';
import { ClassGeneric } from '../../../util/class-generic';
import { RegexConstants, onEnterKey } from '../../../util/constant';
import { setListRow } from '../../../util/methods';
import { TablePagination } from '../../shared/table-pagination/table-pagination';

type SolicitudRow = SolicitudRepuesto & ClassGeneric;

// HU07 - Solicitar repuesto a Logística y registrar traslado del equipo
@Component({
  selector: 'app-solicitar-repuesto',
  imports: [FormsModule, DatePipe, TablePagination],
  templateUrl: './solicitar-repuesto.html',
  styleUrl: './solicitar-repuesto.scss',
})
export class SolicitarRepuestoComponent implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private soporteService = inject(SoporteTecnicoService);
  private confirmDialog = inject(ConfirmDialogService);
  private toast = inject(ToastService);
  public RG = RegexConstants;

  incidenciasPendientes = signal<Incidencia[]>([]);
  solicitudes = signal<SolicitudRow[]>([]);
  selectedRowId: number | null = null;
  textoFiltro = signal('');
  estadoFiltro = signal<'TODOS' | EstadoRepuesto>('TODOS');
  showExtendedCols = signal(false);
  page = signal(1);
  pageSize = signal(10);

  solicitudesFiltradas = computed(() => {
    const q = this.textoFiltro().trim().toLowerCase();
    const est = this.estadoFiltro();
    const lista = this.solicitudes();
    return lista.filter((s) => {
      if (est !== 'TODOS' && s.estado !== est) return false;
      if (!q) return true;
      return (
        s.codigoSolicitud.toLowerCase().includes(q) ||
        s.codigoIncidencia.toLowerCase().includes(q) ||
        s.codigoEquipo.toLowerCase().includes(q) ||
        s.codigoRepuesto.toLowerCase().includes(q) ||
        s.nombreRepuesto.toLowerCase().includes(q)
      );
    });
  });

  solicitudesPaginadas = computed(() => {
    const lista = this.solicitudesFiltradas();
    const totalPages = Math.max(1, Math.ceil(lista.length / this.pageSize()));
    const current = Math.min(Math.max(1, this.page()), totalPages);
    const start = (current - 1) * this.pageSize();
    return lista.slice(start, start + this.pageSize());
  });

  form = {
    idIncidencia: null as number | null,
    codigoRepuesto: '',
    nombreRepuesto: '',
    cantidad: 1,
    justificacion: '',
    trasladarEquipo: true,
  };

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.incidenciaService.listar().subscribe((lista) => {
      this.incidenciasPendientes.set(
        lista.filter((i) => i.estado === 'PENDIENTE' && i.idTecnico !== null),
      );
    });

    this.soporteService.listarRepuestos().subscribe({
      next: (lista) => this.solicitudes.set(setListRow(lista)),
      error: (err: HttpErrorResponse) => {
        this.solicitudes.set([]);
        this.toast.show(err.error?.message ?? 'No se pudieron cargar las solicitudes.', 'danger');
      },
    });
  }

  onEnterKey(event: Event): void {
    onEnterKey(event);
  }

  toggleExtendedCols(): void {
    this.showExtendedCols.update((v) => !v);
  }

  onCheckboxChange(idSolicitud: number, checked: boolean): void {
    this.selectedRowId = checked ? idSolicitud : null;
  }

  solicitar(): void {
    const inc = this.incidenciasPendientes().find((i) => i.idIncidencia === this.form.idIncidencia);
    const codigoRepuesto = this.form.codigoRepuesto.trim().toUpperCase();
    const nombreRepuesto = this.form.nombreRepuesto.trim();
    const justificacion = this.form.justificacion.trim();
    const cantidad = Number(this.form.cantidad);

    if (!inc || !codigoRepuesto || !nombreRepuesto || !justificacion || cantidad < 1) {
      return;
    }

    this.soporteService
      .solicitarRepuesto({
        idIncidencia: inc.idIncidencia,
        codigoRepuesto,
        nombreRepuesto,
        cantidad,
        justificacion,
        trasladarEquipo: this.form.trasladarEquipo,
      })
      .subscribe({
        next: (creada) => {
          this.toast.show(
            `Solicitud ${creada.codigoSolicitud} registrada para ${inc.codigo}.`,
            'success',
          );
          this.form = {
            idIncidencia: null,
            codigoRepuesto: '',
            nombreRepuesto: '',
            cantidad: 1,
            justificacion: '',
            trasladarEquipo: true,
          };
          this.page.set(1);
          this.cargarDatos();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status !== 403) {
            this.toast.show(err.error?.message ?? 'No se pudo registrar la solicitud.', 'danger');
          }
        },
      });
  }

  async avanzarEstado(
    solicitud: SolicitudRepuesto,
    nuevoEstado: 'RECIBIDO' | 'RECHAZADO',
  ): Promise<void> {
    const confirmado = await this.confirmDialog.confirm({
      title: 'Actualizar estado de repuesto',
      message: `¿Confirmas marcar la solicitud ${solicitud.codigoSolicitud} como ${nuevoEstado}?`,
      confirmText: `Sí, marcar ${nuevoEstado.toLowerCase()}`,
      cancelText: 'No',
      variant: nuevoEstado === 'RECHAZADO' ? 'danger' : 'info',
    });

    if (!confirmado) {
      return;
    }

    this.soporteService.cambiarEstadoRepuesto(solicitud.idSolicitud, nuevoEstado).subscribe({
      next: () => {
        this.toast.show(
          `Solicitud ${solicitud.codigoSolicitud} actualizada a ${nuevoEstado}.`,
          'info',
        );
        this.selectedRowId = null;
        this.cargarDatos();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status !== 403) {
          this.toast.show(err.error?.message ?? 'No se pudo actualizar el estado.', 'danger');
        }
      },
    });
  }

  limpiarFiltro(): void {
    this.textoFiltro.set('');
    this.estadoFiltro.set('TODOS');
    this.page.set(1);
  }
}
