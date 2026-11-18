import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Incidencia } from '../../../model/incidencia';
import { IncidenciaService } from '../../../services/incidencia';
import { SessionService } from '../../../services/session';
import { SoporteTecnicoService } from '../../../services/soporte-tecnico';
import { RegexConstants } from '../../../util/constant';

// HU06 - Consultar tareas asignadas (técnico)
@Component({
  selector: 'app-mis-tareas',
  imports: [FormsModule, DatePipe],
  templateUrl: './mis-tareas.html',
  styleUrl: './mis-tareas.scss',
})
export class MisTareas implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private sessionService = inject(SessionService);
  public soporteService = inject(SoporteTecnicoService);
  public RG = RegexConstants;

  private user = this.sessionService.getInfoSession();
  private todas = signal<Incidencia[]>([]);

  tareasFiltradas = signal<Incidencia[]>([]);
  detalleSeleccionado = signal<Incidencia | null>(null);
  soloMias = true;

  filtro = {
    estado: 'TODOS',
    texto: '',
  };

  pendientesMiasCount = computed(
    () =>
      this.todas().filter(
        (i) => i.estado === 'PENDIENTE' && this.esMiIncidencia(i),
      ).length,
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.incidenciaService.listar().subscribe((lista) => {
      this.todas.set(this.soporteService.combinarConEstadoLocal(lista));
      this.applyFilter();
    });
  }

  esMiIncidencia(incidencia: Incidencia): boolean {
    if (!incidencia.tecnico || !this.user) {
      return false;
    }
    const nombreSesion = `${this.user.nombres} ${this.user.apellidos}`.toLowerCase();
    const partes = incidencia.tecnico.toLowerCase().split(' ');
    return partes.every((p) => nombreSesion.includes(p));
  }

  applyFilter(): void {
    const q = this.filtro.texto.trim().toLowerCase();
    const est = this.filtro.estado;

    const resultado = this.todas().filter((inc) => {
      if (inc.idTecnico === null) return false;
      if (this.soloMias && !this.esMiIncidencia(inc)) return false;
      if (est !== 'TODOS' && inc.estado !== est) return false;
      if (!q) return true;
      return (
        inc.codigo.toLowerCase().includes(q) ||
        inc.codigoEquipo.toLowerCase().includes(q) ||
        inc.problema.toLowerCase().includes(q) ||
        inc.usuarioResponsable.toLowerCase().includes(q) ||
        (inc.area ?? '').toLowerCase().includes(q)
      );
    });

    this.tareasFiltradas.set(resultado);
  }

  clearFilter(): void {
    this.filtro = { estado: 'TODOS', texto: '' };
    this.applyFilter();
  }

  verDetalle(incidencia: Incidencia): void {
    this.detalleSeleccionado.set(incidencia);
  }
}
