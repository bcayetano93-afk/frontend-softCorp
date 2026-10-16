import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TOKEN_KEY } from '../services/session';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        // Ruta a la que el interceptor redirige cuando hay un 401
        provideRouter([{ path: 'iniciar-sesion', children: [] }]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
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

  it('should remove the token when the backend answers 401', () => {
    localStorage.setItem(TOKEN_KEY, 'vencido');
    http.get('/api/v1/incidencias').subscribe({ error: () => {} });
    httpTesting.expectOne('/api/v1/incidencias').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
