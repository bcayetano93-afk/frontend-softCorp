import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Incidencia, IncidenciaRequest } from '../../../model/incidencia';
import { ConfirmDialogService } from '../../../services/confirm-dialog';
import { IncidenciaService } from '../../../services/incidencia';
import { SessionService } from '../../../services/session';
import { ToastService } from '../../../services/toast';
import { ClassGeneric } from '../../../util/class-generic';
import { RegexConstants, onEnterKey } from '../../../util/constant';
import { setListRow } from '../../../util/methods';
import { TablePagination } from '../../shared/table-pagination/table-pagination';

type IncidenciaRow = Incidencia & ClassGeneric;

// HU04 - Registrar incidencia (con regex, validaciones, filtros por columna, columnas extendidas y paginación)
@Component({
  selector: 'app-registrar-incidencia',
  imports: [FormsModule, DatePipe, TablePagination],
  templateUrl: './registrar-incidencia.html',
  styleUrl: './registrar-incidencia.scss',
})
export class RegistrarIncidencia implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private confirmDialog = inject(ConfirmDialogService);
  private toast = inject(ToastService);
  private session = inject(SessionService).getInfoSession();

  public RG = RegexConstants;
  registradoPor = `${this.session?.nombres} ${this.session?.apellidos}`;
  form: IncidenciaRequest = this.formVacio();

  private incidenciasAll = signal<IncidenciaRow[]>([]);

  filtroCodigo = signal('');
  filtroEquipo = signal('');
  filtroProblema = signal('');
  filtroResponsable = signal('');
  filtroArea = signal('');
  filtroEstado = signal('TODOS');

  showExtendedCols = signal(false);
  page = signal(1);
  pageSize = signal(10);

  incidencias = computed(() => {
    const cod = this.filtroCodigo().trim().toLowerCase();
    const eq = this.filtroEquipo().trim().toLowerCase();
    const prob = this.filtroProblema().trim().toLowerCase();
    const resp = this.filtroResponsable().trim().toLowerCase();
    const area = this.filtroArea().trim().toLowerCase();
    const est = this.filtroEstado();

    return this.incidenciasAll().filter(
      (i) =>
        (est === 'TODOS' || i.estado === est) &&
        (!cod || i.codigo.toLowerCase().includes(cod)) &&
        (!eq || i.codigoEquipo.toLowerCase().includes(eq)) &&
        (!prob || i.problema.toLowerCase().includes(prob)) &&
        (!resp || i.usuarioResponsable.toLowerCase().includes(resp)) &&
        (!area || (i.area ?? '').toLowerCase().includes(area)),
    );
  });

  totalIncidencias = computed(() => this.incidenciasAll().length);

  incidenciasPaginadas = computed(() => {
    const lista = this.incidencias();
    const totalPages = Math.max(1, Math.ceil(lista.length / this.pageSize()));
    const current = Math.min(Math.max(1, this.page()), totalPages);
    const start = (current - 1) * this.pageSize();
    return lista.slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.cargarIncidencias();
  }

  onEnterKey(event: Event): void {
    onEnterKey(event);
  }

  cargarIncidencias(): void {
    this.incidenciaService.listar().subscribe((lista) => {
      this.incidenciasAll.set(setListRow(lista));
    });
  }

  toggleExtendedCols(): void {
    this.showExtendedCols.update((v) => !v);
  }

  onFilterChange(): void {
    this.page.set(1);
  }

  clearFilter(): void {
    this.filtroCodigo.set('');
    this.filtroEquipo.set('');
    this.filtroProblema.set('');
    this.filtroResponsable.set('');
    this.filtroArea.set('');
    this.filtroEstado.set('TODOS');
    this.page.set(1);
  }

  async registrar(): Promise<void> {
    const codigoEquipo = this.form.codigoEquipo.trim().toUpperCase();
    const problema = this.form.problema.trim();
    const usuarioResponsable = this.form.usuarioResponsable.trim();
    const area = this.form.area.trim();

    if (!codigoEquipo || !problema || !usuarioResponsable) {
      return;
    }

    const confirmado = await this.confirmDialog.confirm({
      title: 'Registrar incidencia',
      message: `¿Está seguro de registrar la incidencia para el equipo ${codigoEquipo}?`,
      confirmText: 'Sí, registrar',
      cancelText: 'No',
      variant: 'info',
    });

    if (!confirmado) {
      return;
    }

    this.incidenciaService
      .registrar({ ...this.form, codigoEquipo, problema, usuarioResponsable, area })
      .subscribe({
        next: (incidencia) => {
          this.toast.show(`Incidencia ${incidencia.codigo} registrada correctamente.`, 'success');
          this.form = this.formVacio();
          this.page.set(1);
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
