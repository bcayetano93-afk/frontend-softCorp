import { Injectable, signal } from '@angular/core';

export type DialogVariant = 'warning' | 'danger' | 'info' | 'success';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
  allowOutsideClick?: boolean;
}

export interface AlertOptions {
  title: string;
  message: string;
  confirmText?: string;
  variant?: DialogVariant;
  allowOutsideClick?: boolean;
}

export interface DialogState {
  mode: 'confirm' | 'alert';
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: DialogVariant;
  allowOutsideClick: boolean;
  resolve: (result: boolean) => void;
}

// Diálogo global basado en signals; devuelve Promises para poder usar await en los componentes
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  activeDialog = signal<DialogState | null>(null);

  // Abre modal de confirmación (Sí/No) y resuelve true o false según la respuesta del usuario
  confirm(options: ConfirmOptions): Promise<boolean> {
    this.dismissPending();
    return new Promise<boolean>((resolve) => {
      this.activeDialog.set({
        mode: 'confirm',
        title: options.title,
        message: options.message,
        confirmText: options.confirmText ?? 'Sí, continuar',
        cancelText: options.cancelText ?? 'Cancelar',
        variant: options.variant ?? 'info',
        allowOutsideClick: options.allowOutsideClick ?? true,
        resolve,
      });
    });
  }

  // Diálogo informativo de un solo botón (ej. aviso de sesión expirada en authInterceptor)
  alert(options: AlertOptions): Promise<void> {
    this.dismissPending();
    return new Promise<void>((resolve) => {
      this.activeDialog.set({
        mode: 'alert',
        title: options.title,
        message: options.message,
        confirmText: options.confirmText ?? 'Aceptar',
        cancelText: '',
        variant: options.variant ?? 'info',
        allowOutsideClick: options.allowOutsideClick ?? false,
        resolve: () => resolve(),
      });
    });
  }

  // Resuelve la promesa pendiente cuando el usuario confirma o cancela
  accept(): void {
    const current = this.activeDialog();
    if (!current) {
      return;
    }
    this.activeDialog.set(null);
    current.resolve(true);
  }

  cancel(): void {
    const current = this.activeDialog();
    if (!current) {
      return;
    }
    this.activeDialog.set(null);
    current.resolve(false);
  }

  close(): void {
    const current = this.activeDialog();
    if (!current || !current.allowOutsideClick) {
      return;
    }
    this.cancel();
  }

  // Cierra cualquier diálogo previo pendiente en false para no dejar promesas colgadas
  private dismissPending(): void {
    const current = this.activeDialog();
    if (current) {
      this.activeDialog.set(null);
      current.resolve(false);
    }
  }
}
