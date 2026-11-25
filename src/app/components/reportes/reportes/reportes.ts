import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TecnicoDisponibilidad } from '../../../model/incidencia';
import { EquipoComplicado, SolucionadasPorDia } from '../../../model/reporte';
import { IncidenciaService } from '../../../services/incidencia';
import { ReporteService } from '../../../services/reporte';
import { ToastService } from '../../../services/toast';

// Reportes del jefe: HU10 (equipos complicados) y HU11 (solucionados por día)
@Component({
  selector: 'app-reportes',
  imports: [FormsModule, DatePipe],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class Reportes implements OnInit {
  private reporteService = inject(ReporteService);
  private incidenciaService = inject(IncidenciaService);
  private toast = inject(ToastService);

  equipos = signal<EquipoComplicado[]>([]);
  tecnicos = signal<TecnicoDisponibilidad[]>([]);

  // Filtros (se envían al backend como parámetros)
  filtro = {
    situacion: 'TODOS',
    idTecnico: null as number | null,
  };

  // ---- HU11: equipos solucionados por día y técnico ----
  solucionadas = signal<SolucionadasPorDia[]>([]);
  // Rango por defecto: los últimos 7 días (formato yyyy-MM-dd, el que usa <input type="date">)
  rango = {
    desde: this.fechaISO(-6),
    hasta: this.fechaISO(0),
  };
  // Total de equipos solucionados en el rango (se recalcula solo)
  totalSolucionadas = computed(() => this.solucionadas().reduce((suma, s) => suma + s.cantidad, 0));

  // A partir de cuántos días un equipo se considera "atrasado"
  readonly DIAS_ALERTA = 7;

  ngOnInit(): void {
    // Lista de técnicos para el filtro (endpoint que ya existía)
    this.incidenciaService.disponibilidadTecnicos().subscribe((lista) => this.tecnicos.set(lista));
    this.cargar();
    this.cargarSolucionadas();
  }

  // Pide el reporte al backend con los filtros actuales
  cargar(): void {
    this.reporteService.equiposComplicados(this.filtro.situacion, this.filtro.idTecnico).subscribe({
      next: (lista) => this.equipos.set(lista),
      error: (err: HttpErrorResponse) =>
        this.toast.show(err.error?.message ?? 'No se pudo cargar el reporte.', 'danger'),
    });
  }

  limpiar(): void {
    this.filtro = { situacion: 'TODOS', idTecnico: null };
    this.cargar();
  }

  // HU11: pide al backend los equipos solucionados en el rango elegido
  cargarSolucionadas(): void {
    if (!this.rango.desde || !this.rango.hasta) {
      this.toast.show('Elige las dos fechas del rango.', 'warning');
      return;
    }
    if (this.rango.desde > this.rango.hasta) {
      this.toast.show("La fecha 'desde' no puede ser posterior a 'hasta'.", 'warning');
      return;
    }
    this.reporteService.solucionadasPorDia(this.rango.desde, this.rango.hasta).subscribe({
      next: (lista) => this.solucionadas.set(lista),
      error: (err: HttpErrorResponse) =>
        this.toast.show(err.error?.message ?? 'No se pudo cargar el reporte.', 'danger'),
    });
  }

  // Fecha de hoy + "dias" en formato yyyy-MM-dd (fecha local, no UTC)
  private fechaISO(dias: number): string {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }
}