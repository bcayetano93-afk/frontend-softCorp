import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Incidencia } from '../../../model/incidencia';
import { IncidenciaService } from '../../../services/incidencia';
import { SessionService } from '../../../services/session';
import { SoporteTecnicoService } from '../../../services/soporte-tecnico';
import { ClassGeneric } from '../../../util/class-generic';
import { RegexConstants } from '../../../util/constant';
import { setListRow } from '../../../util/methods';
import { TablePagination } from '../../shared/table-pagination/table-pagination';

type IncidenciaRow = Incidencia & ClassGeneric;

// HU06 - Consultar tareas asignadas (técnico)
@Component({
  selector: 'app-mis-tareas',
  imports: [FormsModule, DatePipe, TablePagination],
  templateUrl: './mis-tareas.html',
  styleUrl: './mis-tareas.scss',
})
export class MisTareas implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private sessionService = inject(SessionService);
  private soporteService = inject(SoporteTecnicoService);
  public RG = RegexConstants;

  private user = this.sessionService.getInfoSession();
  private todas = signal<IncidenciaRow[]>([]);
  private incidenciasConRepuestoPendiente = signal<Set<number>>(new Set());

  tareasFiltradas = signal<IncidenciaRow[]>([]);
  detalleSeleccionado = signal<Incidencia | null>(null);
  soloMias = true;

  page = signal(1);
  pageSize = signal(10);

  tareasPaginadas = computed(() => {
    const lista = this.tareasFiltradas();
    const totalPages = Math.max(1, Math.ceil(lista.length / this.pageSize()));
    const current = Math.min(Math.max(1, this.page()), totalPages);
    const start = (current - 1) * this.pageSize();
    return lista.slice(start, start + this.pageSize());
  });

  filtro = {
    estado: 'TODOS',
    texto: '',
  };

  totalAsignadas = computed(() => this.todas().filter((i) => i.idTecnico !== null).length);

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
      this.todas.set(setListRow(lista));
      this.applyFilter();
    });

    this.soporteService.listarRepuestos('SOLICITADO').subscribe({
      next: (solicitudes) => {
        this.incidenciasConRepuestoPendiente.set(new Set(solicitudes.map((s) => s.idIncidencia)));
      },
      error: () => this.incidenciasConRepuestoPendiente.set(new Set()),
    });
  }

  tieneRepuestoPendiente(idIncidencia: number): boolean {
    return this.incidenciasConRepuestoPendiente().has(idIncidencia);
  }

  estaEnSoporte(incidencia: Incidencia): boolean {
    return incidencia.ubicacionEquipo === 'AREA_SOPORTE';
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

    this.tareasFiltradas.set(setListRow(resultado));
    this.page.set(1);
  }

  clearFilter(): void {
    this.filtro = { estado: 'TODOS', texto: '' };
    this.applyFilter();
  }

  verDetalle(incidencia: Incidencia): void {
    this.detalleSeleccionado.set(incidencia);
  }
}
