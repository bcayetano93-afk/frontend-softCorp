import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Incidencia, IncidenciaRequest } from '../../../model/incidencia';
import { IncidenciaService } from '../../../services/incidencia';
import { SessionService } from '../../../services/session';
import { SoporteTecnicoService } from '../../../services/soporte-tecnico';
import { ToastService } from '../../../services/toast';
import { PATTERNS, RegexConstants, onEnterKey } from '../../../util/constant';

// HU04 - Registrar incidencia (con regex, validaciones y filtros de tabla)
@Component({
  selector: 'app-registrar-incidencia',
  imports: [FormsModule, DatePipe],
  templateUrl: './registrar-incidencia.html',
  styleUrl: './registrar-incidencia.scss',
})
export class RegistrarIncidencia implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private soporteService = inject(SoporteTecnicoService);
  private toast = inject(ToastService);
  private session = inject(SessionService).getInfoSession();

  public RG = RegexConstants;
  registradoPor = `${this.session?.nombres} ${this.session?.apellidos}`;
  form: IncidenciaRequest = this.formVacio();

  private incidenciasAll = signal<Incidencia[]>([]);
  incidencias = signal<Incidencia[]>([]);

  filtro = {
    texto: '',
    estado: 'TODOS',
  };

  ngOnInit(): void {
    this.cargarIncidencias();
  }

  onEnterKey(event: Event): void {
    onEnterKey(event);
  }

  cargarIncidencias(): void {
    this.incidenciaService.listar().subscribe((lista) => {
      this.incidenciasAll.set(this.soporteService.combinarConEstadoLocal(lista));
      this.applyFilter();
    });
  }

  applyFilter(): void {
    const q = this.filtro.texto.trim().toLowerCase();
    const est = this.filtro.estado;

    const filtradas = this.incidenciasAll().filter((i) => {
      const coincideEstado = est === 'TODOS' || i.estado === est;
      const coincideTexto =
        !q ||
        i.codigo.toLowerCase().includes(q) ||
        i.codigoEquipo.toLowerCase().includes(q) ||
        i.problema.toLowerCase().includes(q) ||
        i.usuarioResponsable.toLowerCase().includes(q) ||
        (i.area ?? '').toLowerCase().includes(q);
      return coincideEstado && coincideTexto;
    });

    this.incidencias.set(filtradas);
  }

  clearFilter(): void {
    this.filtro = { texto: '', estado: 'TODOS' };
    this.applyFilter();
  }

  registrar(): void {
    const codigoEquipo = this.form.codigoEquipo.trim().toUpperCase();
    const problema = this.form.problema.trim();
    const usuarioResponsable = this.form.usuarioResponsable.trim();
    const area = this.form.area.trim();

    if (!codigoEquipo || !problema || !usuarioResponsable) {
      this.toast.show('Completa el código del equipo, el problema y el usuario responsable.', 'warning');
      return;
    }
    if (!PATTERNS.codigoEquipo.test(codigoEquipo)) {
      this.toast.show('Código de equipo inválido. Usa formato ej. PC-ADM-014.', 'warning');
      return;
    }
    if (!PATTERNS.soloLetras.test(usuarioResponsable)) {
      this.toast.show('El usuario responsable solo debe contener letras.', 'warning');
      return;
    }
    if (!PATTERNS.textoGeneral.test(problema)) {
      this.toast.show('Describe el problema con al menos 3 caracteres válidos.', 'warning');
      return;
    }

    this.incidenciaService
      .registrar({ ...this.form, codigoEquipo, problema, usuarioResponsable, area })
      .subscribe({
        next: (incidencia) => {
          this.toast.show(`Incidencia ${incidencia.codigo} registrada correctamente.`, 'success');
          this.form = this.formVacio();
          this.cargarIncidencias();
        },
        error: (err: HttpErrorResponse) => {
          this.toast.show(err.error?.message ?? 'No se pudo registrar la incidencia.', 'danger');
        },
      });
  }

  private formVacio(): IncidenciaRequest {
    return { codigoEquipo: '', problema: '', usuarioResponsable: '', area: '', medioReporte: 'TELEFONO' };
  }
}
