import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';
import { ToastService } from '../services/toast';

// Agrega "Authorization: Bearer <token>" a cada petición al backend.
// Si el backend responde 401 (token vencido o inválido), cierra la sesión.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const router = inject(Router);

  // El login no necesita token
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  const token = authService.getToken();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        toastService.show('Tu sesión ha caducado. Vuelve a iniciar sesión.', 'warning');
        router.navigate(['/iniciar-sesion']);
      }
      if (error.status === 403) {
        toastService.show('No tienes permiso para realizar esta acción.', 'danger');
      }
      return throwError(() => error);
    }),
  );
};
