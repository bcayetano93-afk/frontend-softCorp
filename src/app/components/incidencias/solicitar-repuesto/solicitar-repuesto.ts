import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EstadoRepuesto, Incidencia, SolicitudRepuesto } from '../../../model/incidencia';
import { IncidenciaService } from '../../../services/incidencia';
import { SessionService } from '../../../services/session';
import { SoporteTecnicoService } from '../../../services/soporte-tecnico';
import { ToastService } from '../../../services/toast';
import { PATTERNS, RegexConstants, onEnterKey } from '../../../util/constant';

// HU07 - Solicitar repuesto a Logística y registrar traslado del equipo
@Component({
  selector: 'app-solicitar-repuesto',
  imports: [FormsModule, DatePipe],
  templateUrl: './solicitar-repuesto.html',
  styleUrl: './solicitar-repuesto.scss',
})
export class SolicitarRepuestoComponent implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private sessionService = inject(SessionService);
  private toast = inject(ToastService);
  public soporteService = inject(SoporteTecnicoService);
  public RG = RegexConstants;

  private user = this.sessionService.getInfoSession();
  incidenciasPendientes = signal<Incidencia[]>([]);
  selectedRowId: number | null = null;
  textoFiltro = '';

  solicitudesFiltradas = computed(() => {
    const q = this.textoFiltro.trim().toLowerCase();
    const lista = this.soporteService.solicitudesRepuesto();
    if (!q) return lista;
    return lista.filter(
      (s) =>
        s.codigoIncidencia.toLowerCase().includes(q) ||
        s.codigoEquipo.toLowerCase().includes(q) ||
        s.repuesto.toLowerCase().includes(q),
    );
  });

  form = {
    idIncidencia: null as number | null,
    repuesto: '',
    cantidad: 1,
    motivo: '',
    equipoTrasladado: true,
  };

  ngOnInit(): void {
    this.incidenciaService.listar().subscribe((lista) => {
      const combinadas = this.soporteService.combinarConEstadoLocal(lista);
      this.incidenciasPendientes.set(
        combinadas.filter((i) => i.estado === 'PENDIENTE' && i.idTecnico !== null),
      );
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
    const repuesto = this.form.repuesto.trim();
    const motivo = this.form.motivo.trim();
    const cantidad = Number(this.form.cantidad);

    if (!inc || !repuesto || !motivo || cantidad < 1) {
      this.toast.show('Completa la incidencia, el repuesto, la cantidad y el motivo.', 'warning');
      return;
    }
    if (!PATTERNS.textoGeneral.test(repuesto) || !PATTERNS.textoGeneral.test(motivo)) {
      this.toast.show('El nombre del repuesto y motivo deben tener al menos 3 caracteres válidos.', 'warning');
      return;
    }

    const tecnico = this.user ? `${this.user.nombres} ${this.user.apellidos}` : 'Técnico';
    this.soporteService.registrarSolicitudRepuesto({
      incidencia: inc,
      repuesto,
      cantidad,
      motivo,
      equipoTrasladado: this.form.equipoTrasladado,
      tecnicoSolicitante: tecnico,
    });

    this.toast.show(
      `Repuesto solicitado para ${inc.codigo}. La incidencia permanece Pendiente.`,
      'success',
    );
    this.form = { idIncidencia: null, repuesto: '', cantidad: 1, motivo: '', equipoTrasladado: true };
  }

  avanzarEstado(solicitud: SolicitudRepuesto, nuevoEstado: EstadoRepuesto): void {
    this.soporteService.cambiarEstadoRepuesto(solicitud.idSolicitud, nuevoEstado);
    this.toast.show(`Solicitud de ${solicitud.repuesto} actualizada a ${nuevoEstado}.`, 'info');
    this.selectedRowId = null;
  }

  limpiarFiltro(): void {
    this.textoFiltro = '';
  }
}
