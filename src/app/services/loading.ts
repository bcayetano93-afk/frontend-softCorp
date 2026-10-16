import { Injectable, computed, signal } from '@angular/core';

// Cuenta las peticiones HTTP en curso para mostrar el "Cargando..."
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private peticionesActivas = signal(0);

  // true mientras haya al menos una petición en curso
  loading = computed(() => this.peticionesActivas() > 0);

  show(): void {
    this.peticionesActivas.update((n) => n + 1);
  }

  hide(): void {
    this.peticionesActivas.update((n) => Math.max(0, n - 1));
  }
}
