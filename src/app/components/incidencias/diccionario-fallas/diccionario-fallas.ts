import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriaFalla, FallaDiccionario } from '../../../model/incidencia';
import { ConfirmDialogService } from '../../../services/confirm-dialog';
import { SoporteTecnicoService } from '../../../services/soporte-tecnico';
import { ToastService } from '../../../services/toast';
import { ClassGeneric } from '../../../util/class-generic';
import { RegexConstants, onEnterKey } from '../../../util/constant';
import { setListRow } from '../../../util/methods';
import { TablePagination } from '../../shared/table-pagination/table-pagination';

type FallaRow = FallaDiccionario & ClassGeneric;

// HU09 - Diccionario de fallas (CRUD conectado al backend, filtros reactivos, selección por fila y paginación)
@Component({
  selector: 'app-diccionario-fallas',
  imports: [FormsModule, DatePipe, TablePagination],
  templateUrl: './diccionario-fallas.html',
  styleUrl: './diccionario-fallas.scss',
})
export class DiccionarioFallas implements OnInit {
  private soporteService = inject(SoporteTecnicoService);
  private confirmDialog = inject(ConfirmDialogService);
  private toast = inject(ToastService);
  public RG = RegexConstants;

  categorias: CategoriaFalla[] = [
    'HARDWARE',
    'SOFTWARE',
    'RED',
    'IMPRESORA',
    'SISTEMA_OPERATIVO',
    'OTRO',
  ];

  fallas = signal<FallaRow[]>([]);
  palabraBusqueda = signal('');
  categoriaBusqueda = signal('');
  showExtendedCols = signal(false);
  page = signal(1);
  pageSize = signal(10);

  selectedRowId: number | null = null;
  editandoId: number | null = null;

  form = this.formVacio();

  // Filtro reactivo en memoria por categoría y texto libre sobre los 6 campos del registro
  fallasFiltradas = computed(() => {
    const q = this.palabraBusqueda().trim().toLowerCase();
    const cat = this.categoriaBusqueda();
    return this.fallas().filter((f) => {
      if (cat && f.categoria !== cat) return false;
      if (!q) return true;
      return (
        f.codigoFalla.toLowerCase().includes(q) ||
        f.titulo.toLowerCase().includes(q) ||
        f.categoria.toLowerCase().includes(q) ||
        f.sintomas.toLowerCase().includes(q) ||
        f.causaProbable.toLowerCase().includes(q) ||
        f.solucion.toLowerCase().includes(q)
      );
    });
  });

  fallasPaginadas = computed(() => {
    const lista = this.fallasFiltradas();
    const totalPages = Math.max(1, Math.ceil(lista.length / this.pageSize()));
    const current = Math.min(Math.max(1, this.page()), totalPages);
    const start = (current - 1) * this.pageSize();
    return lista.slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.cargarFallas();
  }

  cargarFallas(): void {
    this.soporteService.buscarFallas().subscribe({
      next: (lista) => this.fallas.set(setListRow(lista)),
      error: (err: HttpErrorResponse) => {
        this.fallas.set([]);
        this.toast.show(
          err.error?.message ?? 'No se pudo cargar el diccionario de fallas.',
          'danger',
        );
      },
    });
  }

  onEnterKey(event: Event): void {
    onEnterKey(event);
  }

  toggleExtendedCols(): void {
    this.showExtendedCols.update((v) => !v);
  }

  onCheckboxChange(idFalla: number, checked: boolean): void {
    this.selectedRowId = checked ? idFalla : null;
  }

  // Reutiliza el formulario para crear o actualizar según exista editandoId
  guardar(): void {
    const codigoFalla = this.form.codigoFalla.trim().toUpperCase();
    const titulo = this.form.titulo.trim();
    const categoria = this.form.categoria;
    const sintomas = this.form.sintomas.trim();
    const causaProbable = this.form.causaProbable.trim();
    const solucion = this.form.solucion.trim();

    if (!codigoFalla || !titulo || !sintomas || !causaProbable || !solucion) {
      return;
    }

    const payload = { codigoFalla, titulo, categoria, sintomas, causaProbable, solucion };
    const peticion = this.editandoId
      ? this.soporteService.actualizarFalla(this.editandoId, payload)
      : this.soporteService.crearFalla(payload);

    peticion.subscribe({
      next: () => {
        this.toast.show(
          this.editandoId
            ? 'Solución actualizada en el diccionario.'
            : 'Falla registrada en el diccionario.',
          'success',
        );
        this.cancelarEdicion();
        this.page.set(1);
        this.cargarFallas();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status !== 403) {
          this.toast.show(err.error?.message ?? 'No se pudo guardar la falla.', 'danger');
        }
      },
    });
  }

  // Carga la fila seleccionada en el formulario para editarla
  editarFalla(falla: FallaDiccionario): void {
    this.editandoId = falla.idFalla;
    this.form = {
      codigoFalla: falla.codigoFalla,
      titulo: falla.titulo,
      categoria: falla.categoria,
      sintomas: falla.sintomas,
      causaProbable: falla.causaProbable,
      solucion: falla.solucion,
    };
  }

  // Confirma con el diálogo global antes de borrar el registro del diccionario
  async eliminarFalla(falla: FallaDiccionario): Promise<void> {
    const confirmado = await this.confirmDialog.confirm({
      title: 'Eliminar falla del diccionario',
      message: `¿Está seguro de eliminar el registro ${falla.codigoFalla} ("${falla.titulo}")?`,
      confirmText: 'Sí, eliminar',
      cancelText: 'No',
      variant: 'danger',
    });

    if (!confirmado) {
      return;
    }

    this.soporteService.eliminarFalla(falla.idFalla).subscribe({
      next: () => {
        if (this.editandoId === falla.idFalla) {
          this.cancelarEdicion();
        }
        this.selectedRowId = null;
        this.toast.show('Registro eliminado del diccionario.', 'info');
        this.cargarFallas();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status !== 403) {
          this.toast.show(err.error?.message ?? 'No se pudo eliminar el registro.', 'danger');
        }
      },
    });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.selectedRowId = null;
    this.form = this.formVacio();
  }

  limpiarBusqueda(): void {
    this.palabraBusqueda.set('');
    this.categoriaBusqueda.set('');
    this.page.set(1);
  }

  private formVacio() {
    return {
      codigoFalla: '',
      titulo: '',
      categoria: 'HARDWARE' as CategoriaFalla,
      sintomas: '',
      causaProbable: '',
      solucion: '',
    };
  }
}
