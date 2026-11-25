import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ModuloResponse, RolRequest, RolResponse } from '../../../model/rol';
import { ConfirmDialogService } from '../../../services/confirm-dialog';
import { ModuloService } from '../../../services/modulo';
import { RolService } from '../../../services/rol';
import { SessionService } from '../../../services/session';
import { ToastService } from '../../../services/toast';
import { RegexConstants, onEnterKey } from '../../../util/constant';
import { setListRow } from '../../../util/methods';
import { TablePagination } from '../../shared/table-pagination/table-pagination';

@Component({
  selector: 'app-registrar-rol',
  imports: [FormsModule, TablePagination],
  templateUrl: './registrar-rol.html',
  styleUrl: './registrar-rol.scss',
})
export class RegistrarRol implements OnInit {
  private rolService = inject(RolService);
  private moduloService = inject(ModuloService);
  private sessionService = inject(SessionService);
  private confirmDialog = inject(ConfirmDialogService);
  private toast = inject(ToastService);

  public RG = RegexConstants;

  esJefe = this.sessionService.getInfoSession()?.rol === 'JEFE';

  roles = signal<RolResponse[]>([]);
  modulos = signal<ModuloResponse[]>([]);
  filterDescripcion = signal('');
  selectedRowId = signal<number | null>(null);

  page = signal(1);
  pageSize = signal(5);

  rolesPaginados = computed(() => {
    const lista = this.roles();
    const totalPages = Math.max(1, Math.ceil(lista.length / this.pageSize()));
    const current = Math.min(Math.max(1, this.page()), totalPages);
    const start = (current - 1) * this.pageSize();
    return lista.slice(start, start + this.pageSize());
  });

  showModal = signal(false);
  record: RolRequest = { codigo: '', descripcion: '' };

  ngOnInit(): void {
    forkJoin({
      modulos: this.moduloService.list({}),
      roles: this.rolService.list({}),
    }).subscribe({
      next: ({ modulos, roles }) => {
        this.modulos.set(setListRow(modulos));
        this.roles.set(setListRow(roles));
      },
      error: (err: HttpErrorResponse) => {
        this.toast.show(err.error?.message ?? 'No se pudieron cargar roles y módulos.', 'danger');
      },
    });
  }

  onEnterKey(event: Event): void {
    onEnterKey(event);
  }

  onCheckboxChange(idRol: number, checked: boolean): void {
    this.selectedRowId.set(checked ? idRol : null);
  }

  search(): void {
    const descripcion = this.filterDescripcion().trim();
    this.rolService.list(descripcion ? { descripcion } : {}).subscribe({
      next: (lista) => {
        this.roles.set(setListRow(lista));
        this.selectedRowId.set(null);
        this.page.set(1);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.show(err.error?.message ?? 'Error al buscar roles.', 'danger');
      },
    });
  }

  cleanSearch(): void {
    this.filterDescripcion.set('');
    this.search();
  }

  openAdd(): void {
    if (!this.esJefe) {
      return;
    }
    this.record = { codigo: '', descripcion: '' };
    this.showModal.set(true);
  }

  openEdit(row: RolResponse): void {
    if (!this.esJefe) {
      return;
    }
    this.rolService.find(row.idRol).subscribe({
      next: (encontrado) => {
        this.record = {
          idRol: encontrado.idRol,
          codigo: encontrado.codigo,
          descripcion: encontrado.descripcion,
        };
        this.showModal.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.show(err.error?.message ?? 'No se pudo obtener el detalle del rol.', 'danger');
      },
    });
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  save(): void {
    const codigo = (this.record.codigo ?? '').trim().toUpperCase();
    const descripcion = (this.record.descripcion ?? '').trim();

    if (!codigo || !descripcion) {
      this.toast.show('Debe ingresar el código y el nombre del rol.', 'warning');
      return;
    }

    const esEdicion = Boolean(this.record.idRol);
    this.rolService.save({ idRol: this.record.idRol, codigo, descripcion }).subscribe({
      next: (guardado) => {
        this.toast.show(
          `Rol ${guardado.descripcion} ${esEdicion ? 'actualizado' : 'registrado'} correctamente.`,
          'success',
        );
        this.showModal.set(false);
        this.selectedRowId.set(null);
        this.search();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status !== 403) {
          this.toast.show(err.error?.message ?? 'No se pudo guardar el rol.', 'danger');
        }
      },
    });
  }

  async delete(row: RolResponse): Promise<void> {
    if (!this.esJefe) {
      return;
    }
    const confirmado = await this.confirmDialog.confirm({
      title: 'Eliminar rol',
      message: `¿Está seguro de eliminar el rol "${row.descripcion}" (${row.codigo})?`,
      confirmText: 'Sí, eliminar',
      cancelText: 'No',
      variant: 'danger',
    });

    if (!confirmado) {
      return;
    }

    this.rolService.delete(row.idRol).subscribe({
      next: (eliminado) => {
        this.toast.show(`El rol ${eliminado.descripcion} fue eliminado.`, 'info');
        this.selectedRowId.set(null);
        this.search();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status !== 403) {
          this.toast.show(err.error?.message ?? 'No se pudo eliminar el rol.', 'danger');
        }
      },
    });
  }
}
