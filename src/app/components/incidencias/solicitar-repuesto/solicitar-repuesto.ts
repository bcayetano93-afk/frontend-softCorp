import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Incidencia, SolicitudRepuesto } from '../../../model/incidencia';
import { IncidenciaService } from '../../../services/incidencia';
import { SoporteTecnicoService } from '../../../services/soporte-tecnico';
import { ToastService } from '../../../services/toast';
import { RegexConstants, onEnterKey } from '../../../util/constant';

// HU07 - Solicitar repuesto a Logística y registrar traslado del equipo
@Component({
  selector: 'app-solicitar-repuesto',
  imports: [FormsModule, DatePipe],
  templateUrl: './solicitar-repuesto.html',
  styleUrl: './solicitar-repuesto.scss',
})
export class SolicitarRepuestoComponent implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private soporteService = inject(SoporteTecnicoService);
  private toast = inject(ToastService);
  public RG = RegexConstants;

  incidenciasPendientes = signal<Incidencia[]>([]);
  solicitudes = signal<SolicitudRepuesto[]>([]);
  selectedRowId: number | null = null;
  textoFiltro = '';

  solicitudesFiltradas = computed(() => {
    const q = this.textoFiltro.trim().toLowerCase();
    const lista = this.solicitudes();
    if (!q) return lista;
    return lista.filter(
      (s) =>
        s.codigoSolicitud.toLowerCase().includes(q) ||
        s.codigoIncidencia.toLowerCase().includes(q) ||
        s.codigoEquipo.toLowerCase().includes(q) ||
        s.codigoRepuesto.toLowerCase().includes(q) ||
        s.nombreRepuesto.toLowerCase().includes(q),
    );
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
      next: (lista) => this.solicitudes.set(lista),
      error: (err: HttpErrorResponse) => {
        this.solicitudes.set([]);
        this.toast.show(err.error?.message ?? 'No se pudieron cargar las solicitudes.', 'danger');
      },
    });
  }

  onEnterKey(event: Event): void {
    onEnterKey(event);
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
          this.cargarDatos();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status !== 403) {
            this.toast.show(err.error?.message ?? 'No se pudo registrar la solicitud.', 'danger');
          }
        },
      });
  }

  avanzarEstado(solicitud: SolicitudRepuesto, nuevoEstado: 'RECIBIDO' | 'RECHAZADO'): void {
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
    this.textoFiltro = '';
  }
}
