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

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  activeDialog = signal<DialogState | null>(null);

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

  private dismissPending(): void {
    const current = this.activeDialog();
    if (current) {
      this.activeDialog.set(null);
      current.resolve(false);
    }
  }
}
