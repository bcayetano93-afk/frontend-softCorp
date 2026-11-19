import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Incidencia, LugarAtencion } from '../../../model/incidencia';
import { IncidenciaService } from '../../../services/incidencia';
import { SessionService } from '../../../services/session';
import { SoporteTecnicoService } from '../../../services/soporte-tecnico';
import { ToastService } from '../../../services/toast';
import { PATTERNS, RegexConstants, onEnterKey } from '../../../util/constant';

// HU08 - Registrar informe técnico y cerrar incidencia como SOLUCIONADO
@Component({
  selector: 'app-informe-tecnico',
  imports: [FormsModule, DatePipe],
  templateUrl: './informe-tecnico.html',
  styleUrl: './informe-tecnico.scss',
})
export class InformeTecnicoComponent implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private sessionService = inject(SessionService);
  private toast = inject(ToastService);
  public soporteService = inject(SoporteTecnicoService);
  public RG = RegexConstants;

  private user = this.sessionService.getInfoSession();
  incidenciasPendientes = signal<Incidencia[]>([]);

  form = {
    idIncidencia: null as number | null,
    diagnostico: '',
    solucion: '',
    piezasCambiadas: '',
    lugarAtencion: 'OFICINA_USUARIO' as LugarAtencion,
  };

  ngOnInit(): void {
    this.cargarPendientes();
  }

  onEnterKey(event: Event): void {
    onEnterKey(event);
  }

  cargarPendientes(): void {
    this.incidenciaService.listar().subscribe((lista) => {
      const combinadas = this.soporteService.combinarConEstadoLocal(lista);
      this.incidenciasPendientes.set(
        combinadas.filter((i) => i.estado === 'PENDIENTE' && i.idTecnico !== null),
      );
    });
  }

  registrarInforme(): void {
    const inc = this.incidenciasPendientes().find((i) => i.idIncidencia === this.form.idIncidencia);
    const diagnostico = this.form.diagnostico.trim();
    const solucion = this.form.solucion.trim();
    const piezasCambiadas = this.form.piezasCambiadas.trim() || 'Ninguna';

    if (!inc || !diagnostico || !solucion) {
      this.toast.show('Selecciona una incidencia e ingresa el diagnóstico y la solución.', 'warning');
      return;
    }
    if (this.soporteService.tieneRepuestoPendiente(inc.idIncidencia)) {
      this.toast.show('Esta incidencia tiene un repuesto pendiente por recibir en Logística.', 'warning');
      return;
    }
    if (!PATTERNS.textoGeneral.test(diagnostico) || !PATTERNS.textoGeneral.test(solucion)) {
      this.toast.show('Diagnóstico y solución requieren al menos 3 caracteres válidos.', 'warning');
      return;
    }

    const tecnico = this.user ? `${this.user.nombres} ${this.user.apellidos}` : 'Técnico';
    this.soporteService.registrarInformeTecnico({
      incidencia: inc,
      diagnostico,
      solucion,
      piezasCambiadas,
      lugarAtencion: this.form.lugarAtencion,
      tecnico,
    });

    this.toast.show(`Informe registrado. ${inc.codigo} pasó a estado Solucionado.`, 'success');
    this.form = {
      idIncidencia: null,
      diagnostico: '',
      solucion: '',
      piezasCambiadas: '',
      lugarAtencion: 'OFICINA_USUARIO',
    };
    this.cargarPendientes();
  }
}
