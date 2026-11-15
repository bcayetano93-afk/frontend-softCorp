import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';
import { ToastService } from '../services/toast';

let isHandling401 = false;

// Agrega "Authorization: Bearer <token>" a cada petición al backend.
// Si el backend responde 401, cierra la sesión una sola vez y absorbe peticiones concurrentes.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const router = inject(Router);

  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  const token = authService.getToken();
  if (token) {
    isHandling401 = false;
  }

  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (!isHandling401) {
          isHandling401 = true;
          authService.logout();
          toastService.show('Tu sesión ha caducado. Vuelve a iniciar sesión.', 'warning');
          router.navigate(['/iniciar-sesion']);
        }
        return EMPTY;
      }
      if (error.status === 403) {
        toastService.show('No tienes permiso para realizar esta acción.', 'danger');
      }
      return throwError(() => error);
    }),
  );
};
