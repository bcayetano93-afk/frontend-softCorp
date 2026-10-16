import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// Mensajes cortos que aparecen en una esquina y se ocultan solos
@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private siguienteId = 1;

  show(message: string, type: ToastType = 'info'): void {
    const toast: Toast = { id: this.siguienteId++, message, type };
    this.toasts.update((lista) => [...lista, toast]);
    // Se quita solo después de 3 segundos
    setTimeout(() => this.remove(toast), 3000);
  }

  remove(toast: Toast): void {
    this.toasts.update((lista) => lista.filter((t) => t.id !== toast.id));
  }
}
