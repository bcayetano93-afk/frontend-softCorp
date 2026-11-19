import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FallaDiccionario } from '../../../model/incidencia';
import { SessionService } from '../../../services/session';
import { SoporteTecnicoService } from '../../../services/soporte-tecnico';
import { ToastService } from '../../../services/toast';
import { PATTERNS, RegexConstants, onEnterKey } from '../../../util/constant';

// HU09 - Diccionario de fallas (alta, búsqueda por palabra clave y edición con checkbox de fila)
@Component({
  selector: 'app-diccionario-fallas',
  imports: [FormsModule, DatePipe],
  templateUrl: './diccionario-fallas.html',
  styleUrl: './diccionario-fallas.scss',
})
export class DiccionarioFallas {
  private sessionService = inject(SessionService);
  private toast = inject(ToastService);
  public soporteService = inject(SoporteTecnicoService);
  public RG = RegexConstants;

  private user = this.sessionService.getInfoSession();

  palabraBusqueda = '';
  selectedRowId: number | null = null;
  editandoId: number | null = null;

  form = {
    titulo: '',
    palabraClave: '',
    sintoma: '',
    solucion: '',
  };

  fallasFiltradas = computed(() => {
    const q = this.palabraBusqueda.trim().toLowerCase();
    const lista = this.soporteService.diccionarioFallas();
    if (!q) return lista;
    return lista.filter(
      (f) =>
        f.titulo.toLowerCase().includes(q) ||
        f.palabraClave.toLowerCase().includes(q) ||
        f.sintoma.toLowerCase().includes(q) ||
        f.solucion.toLowerCase().includes(q),
    );
  });

  onEnterKey(event: Event): void {
    onEnterKey(event);
  }

  onCheckboxChange(idFalla: number, checked: boolean): void {
    this.selectedRowId = checked ? idFalla : null;
  }

  guardar(): void {
    const titulo = this.form.titulo.trim();
    const palabraClave = this.form.palabraClave.trim();
    const sintoma = this.form.sintoma.trim();
    const solucion = this.form.solucion.trim();

    if (!titulo || !palabraClave || !sintoma || !solucion) {
      this.toast.show('Completa todos los campos del diccionario.', 'warning');
      return;
    }
    if (
      !PATTERNS.textoGeneral.test(titulo) ||
      !PATTERNS.textoGeneral.test(sintoma) ||
      !PATTERNS.textoGeneral.test(solucion)
    ) {
      this.toast.show('Verifica que los campos tengan al menos 3 caracteres válidos.', 'warning');
      return;
    }

    const actualizadoPor = this.user ? `${this.user.nombres} ${this.user.apellidos}` : 'Técnico';
    this.soporteService.guardarFalla({
      idFalla: this.editandoId,
      titulo,
      palabraClave,
      sintoma,
      solucion,
      actualizadoPor,
    });

    this.toast.show(
      this.editandoId ? 'Solución actualizada en el diccionario.' : 'Falla registrada en el diccionario.',
      'success',
    );
    this.cancelarEdicion();
  }

  editarFalla(falla: FallaDiccionario): void {
    this.editandoId = falla.idFalla;
    this.form = {
      titulo: falla.titulo,
      palabraClave: falla.palabraClave,
      sintoma: falla.sintoma,
      solucion: falla.solucion,
    };
  }

  eliminarFalla(falla: FallaDiccionario): void {
    this.soporteService.eliminarFalla(falla.idFalla);
    if (this.editandoId === falla.idFalla) {
      this.cancelarEdicion();
    }
    this.selectedRowId = null;
    this.toast.show('Registro eliminado del diccionario.', 'info');
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.selectedRowId = null;
    this.form = { titulo: '', palabraClave: '', sintoma: '', solucion: '' };
  }

  limpiarBusqueda(): void {
    this.palabraBusqueda = '';
  }
}
