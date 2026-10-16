import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast';

// Muestra los mensajes (toasts) en la esquina superior derecha
@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
})
export class ToastContainer {
  toastService = inject(ToastService);
}
