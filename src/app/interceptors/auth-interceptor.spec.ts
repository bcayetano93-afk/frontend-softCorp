import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ConfirmDialogService } from '../services/confirm-dialog';
import { TOKEN_KEY } from '../services/session';
import { ToastService } from '../services/toast';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let confirmDialog: ConfirmDialogService;
  let toastService: ToastService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'iniciar-sesion', children: [] }]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    confirmDialog = TestBed.inject(ConfirmDialogService);
    toastService = TestBed.inject(ToastService);
    router = TestBed.inject(Router);
  });

  it('should add the Bearer token to the requests', () => {
    localStorage.setItem(TOKEN_KEY, 'abc123');
    http.get('/api/v1/incidencias').subscribe();
    const req = httpTesting.expectOne('/api/v1/incidencias');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc123');
    req.flush([]);
  });

  it('should not add the token to the login request', () => {
    localStorage.setItem(TOKEN_KEY, 'abc123');
    http.post('/api/auth/login', {}).subscribe();
    const req = httpTesting.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ token: 'x' });
  });

  it('should remove token, open blocking 401 modal, absorb error, and navigate on accept', async () => {
    localStorage.setItem(TOKEN_KEY, 'vencido');
    let errored = false;
    let completed = false;

    http.get('/api/v1/incidencias').subscribe({
      error: () => (errored = true),
      complete: () => (completed = true),
    });

    httpTesting
      .expectOne('/api/v1/incidencias')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(errored).toBe(false);
    expect(completed).toBe(true);

    const dlg = confirmDialog.activeDialog();
    expect(dlg?.title).toBe('¡Sesión expirada!');
    expect(dlg?.mode).toBe('alert');
    expect(dlg?.allowOutsideClick).toBe(false);

    const navigateSpy = vi.spyOn(router, 'navigate');
    confirmDialog.accept();
    await vi.waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith(['/iniciar-sesion']);
      expect(router.url).toBe('/iniciar-sesion');
    });
  });

  it('should keep token and show danger toast on 403', () => {
    localStorage.setItem(TOKEN_KEY, 'valido');
    let errored = false;

    http.post('/api/v1/rol/save', {}).subscribe({
      error: () => (errored = true),
    });

    httpTesting
      .expectOne('/api/v1/rol/save')
      .flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });

    expect(errored).toBe(true);
    expect(localStorage.getItem(TOKEN_KEY)).toBe('valido');
    expect(toastService.toasts().some((t) => t.type === 'danger')).toBe(true);
  });
});
