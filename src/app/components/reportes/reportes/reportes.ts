import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TecnicoDisponibilidad } from '../../../model/incidencia';
import { EquipoComplicado } from '../../../model/reporte';
import { IncidenciaService } from '../../../services/incidencia';
import { ReporteService } from '../../../services/reporte';
import { ToastService } from '../../../services/toast';

// HU10 - Reporte de equipos con problemas complicados (solo JEFE)
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

  // A partir de cuántos días un equipo se considera "atrasado"
  readonly DIAS_ALERTA = 7;

  ngOnInit(): void {
    // Lista de técnicos para el filtro (endpoint que ya existía)
    this.incidenciaService.disponibilidadTecnicos().subscribe((lista) => this.tecnicos.set(lista));
    this.cargar();
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
}