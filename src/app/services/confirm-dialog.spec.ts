import { TestBed } from '@angular/core/testing';
import { ConfirmDialogService } from './confirm-dialog';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;

  beforeEach(() => {
    service = TestBed.inject(ConfirmDialogService);
  });

  it('should resolve true on accept() and false on cancel() for confirm()', async () => {
    const acceptPromise = service.confirm({ title: 'Confirmar', message: '¿Continuar?' });
    expect(service.activeDialog()?.mode).toBe('confirm');
    service.accept();
    expect(await acceptPromise).toBe(true);
    expect(service.activeDialog()).toBeNull();

    const cancelPromise = service.confirm({ title: 'Eliminar', message: '¿Eliminar?' });
    service.cancel();
    expect(await cancelPromise).toBe(false);
    expect(service.activeDialog()).toBeNull();
  });

  it('should block close() when allowOutsideClick is false in alert()', async () => {
    const alertPromise = service.alert({
      title: 'Sesión expirada',
      message: 'Debe iniciar sesión',
      allowOutsideClick: false,
    });

    expect(service.activeDialog()?.mode).toBe('alert');
    service.close();
    expect(service.activeDialog()).not.toBeNull();

    service.accept();
    await alertPromise;
    expect(service.activeDialog()).toBeNull();
  });
});
