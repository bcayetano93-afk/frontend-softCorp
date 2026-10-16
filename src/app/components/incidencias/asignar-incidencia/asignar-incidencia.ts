import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Incidencia, TecnicoDisponibilidad } from '../../../model/incidencia';
import { IncidenciaService } from '../../../services/incidencia';
import { ToastService } from '../../../services/toast';

// HU05 - Asignar incidencia a técnico (solo el jefe del área)
@Component({
  selector: 'app-asignar-incidencia',
  imports: [FormsModule, DatePipe],
  templateUrl: './asignar-incidencia.html',
  styleUrl: './asignar-incidencia.scss',
})
export class AsignarIncidencia implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private toast = inject(ToastService);

  incidencias = signal<Incidencia[]>([]);
  tecnicos = signal<TecnicoDisponibilidad[]>([]);

  // Técnico elegido en cada fila: { idIncidencia: idTecnico }
  seleccion: Record<number, number | null> = {};

  // Pendientes que todavía no tienen técnico
  sinAsignar = computed(() =>
    this.incidencias().filter((i) => i.estado === 'PENDIENTE' && i.idTecnico === null),
  );

  // Pendientes que ya tienen técnico
  asignadas = computed(() =>
    this.incidencias().filter((i) => i.estado === 'PENDIENTE' && i.idTecnico !== null),
  );

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.incidenciaService.listar().subscribe((lista) => {
      // Cada fila empieza en "Elegir técnico..."
      this.seleccion = {};
      lista.forEach((i) => (this.seleccion[i.idIncidencia] = null));
      this.incidencias.set(lista);
    });
    this.incidenciaService.disponibilidadTecnicos().subscribe((lista) => this.tecnicos.set(lista));
  }

  asignar(incidencia: Incidencia): void {
    const idTecnico = this.seleccion[incidencia.idIncidencia];
    if (!idTecnico) {
      this.toast.show('Elige un técnico para la incidencia.', 'warning');
      return;
    }

    this.incidenciaService.asignar(incidencia.idIncidencia, idTecnico).subscribe({
      next: (resultado) => {
        this.toast.show(`${resultado.codigo} asignada a ${resultado.tecnico}.`, 'success');
        this.cargarDatos();
      },
      error: (err: HttpErrorResponse) => {
        // El 403 ya lo avisa el authInterceptor
        if (err.status !== 403) {
          this.toast.show(err.error?.message ?? 'No se pudo asignar la incidencia.', 'danger');
        }
      },
    });
  }

  // Porcentaje de la barra de carga
  porcentaje(tecnico: TecnicoDisponibilidad): number {
    return tecnico.limite > 0 ? Math.min(100, (tecnico.carga / tecnico.limite) * 100) : 100;
  }
}
