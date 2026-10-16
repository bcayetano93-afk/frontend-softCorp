import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Incidencia, IncidenciaRequest } from '../../../model/incidencia';
import { IncidenciaService } from '../../../services/incidencia';
import { SessionService } from '../../../services/session';
import { ToastService } from '../../../services/toast';

// HU04 - Registrar incidencia
@Component({
  selector: 'app-registrar-incidencia',
  imports: [FormsModule, DatePipe],
  templateUrl: './registrar-incidencia.html',
  styleUrl: './registrar-incidencia.scss',
})
export class RegistrarIncidencia implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private toast = inject(ToastService);
  private session = inject(SessionService).getInfoSession();

  // Quién registra (el usuario que inició sesión)
  registradoPor = `${this.session?.nombres} ${this.session?.apellidos}`;

  // Datos del formulario (conectados con [(ngModel)])
  form: IncidenciaRequest = this.formVacio();

  // Lista de incidencias registradas
  incidencias = signal<Incidencia[]>([]);

  ngOnInit(): void {
    this.cargarIncidencias();
  }

  cargarIncidencias(): void {
    this.incidenciaService.listar().subscribe((lista) => this.incidencias.set(lista));
  }

  registrar(): void {
    if (!this.form.codigoEquipo.trim() || !this.form.problema.trim() || !this.form.usuarioResponsable.trim()) {
      this.toast.show('Completa el código del equipo, el problema y el usuario responsable.', 'warning');
      return;
    }

    this.incidenciaService.registrar(this.form).subscribe({
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
