import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from '../../services/confirm-dialog';

// Componente global montado en app.html; lee el signal activeDialog del servicio
@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  dialogService = inject(ConfirmDialogService);

  onBackdropClick(): void {
    this.dialogService.close();
  }
}
