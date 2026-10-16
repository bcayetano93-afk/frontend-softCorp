import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session';
import { ToastService } from '../services/toast';

// Autorización en el frontend: solo deja entrar a los módulos que tiene el rol del usuario.
// Ej. un técnico que escribe /principal/asignar-incidencia en la barra es devuelto al inicio.
export const moduloGuard: CanActivateFn = (route) => {
  const session = inject(SessionService);
  const toast = inject(ToastService);
  const router = inject(Router);

  // URL del módulo: la ruta fija (ej. "asignar-incidencia") o el parámetro :modulo
  const url = route.paramMap.get('modulo') ?? route.routeConfig?.path;
  const tienePermiso = session.getInfoSession()?.modulos.some((m) => m.url === url) ?? false;

  if (tienePermiso) {
    return true;
  }
  toast.show('No tienes acceso a ese módulo.', 'danger');
  return router.createUrlTree(['/principal']);
};
