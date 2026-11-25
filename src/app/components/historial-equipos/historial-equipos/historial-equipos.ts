import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HistorialEquipo } from '../../../model/historial';
import { HistorialService } from '../../../services/historial';
import { ToastService } from '../../../services/toast';
import { RegexConstants, onEnterKey } from '../../../util/constant';

// HU12 - Consultar historial de equipo (jefe, técnico y sistemas)
@Component({
  selector: 'app-historial-equipos',
  imports: [FormsModule, DatePipe],
  templateUrl: './historial-equipos.html',
  styleUrl: './historial-equipos.scss',
})
export class HistorialEquipos {
  private historialService = inject(HistorialService);
  private toast = inject(ToastService);

  public RG = RegexConstants;   // filtro del código al escribir
  codigoEquipo = '';
  historial = signal<HistorialEquipo | null>(null);   // null = todavía no se buscó

  onEnterKey(event: Event): void {
    onEnterKey(event);
  }

  buscar(): void {
    const codigo = this.codigoEquipo.trim().toUpperCase();
    if (!codigo) return;

    this.historialService.historial(codigo).subscribe({
      next: (data) => this.historial.set(data),
      error: (err: HttpErrorResponse) => {
        this.historial.set(null);
        // 404 = el equipo no tiene incidencias registradas
        this.toast.show(err.error?.message ?? 'No se pudo consultar el historial.', 'warning');
      },
    });
  }
}