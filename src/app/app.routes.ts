import { Routes } from '@angular/router';
import { InicioSesion } from './components/acceso/inicio-sesion/inicio-sesion';
import { Home } from './components/home/home';
import { AsignarIncidencia } from './components/incidencias/asignar-incidencia/asignar-incidencia';
import { RegistrarIncidencia } from './components/incidencias/registrar-incidencia/registrar-incidencia';
import { Bienvenida } from './components/principal/bienvenida/bienvenida';
import { Principal } from './components/principal/principal';
import { Proximamente } from './components/principal/proximamente/proximamente';
import { authGuard } from './guards/auth-guard';
import { moduloGuard } from './guards/modulo-guard';

// Páginas de la aplicación: cada ruta (URL) muestra un componente
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'iniciar-sesion', component: InicioSesion },
  // Zona privada: necesita sesión (authGuard). Cada módulo, además, que el rol lo tenga (moduloGuard).
  {
    path: 'principal',
    component: Principal,
    canActivate: [authGuard],
    children: [
      { path: '', component: Bienvenida },
      // Sprint 2
      { path: 'registrar-incidencia', component: RegistrarIncidencia, canActivate: [moduloGuard] },
      { path: 'asignar-incidencia', component: AsignarIncidencia, canActivate: [moduloGuard] },
      // Módulos de los siguientes sprints
      { path: ':modulo', component: Proximamente, canActivate: [moduloGuard] },
    ],
  },
  // Si la URL no existe, vuelve a la homepage
  { path: '**', redirectTo: '' },
];
