import { Routes } from '@angular/router';
import { InicioSesion } from './components/acceso/inicio-sesion/inicio-sesion';
import { Home } from './components/home/home';
import { AsignarIncidencia } from './components/incidencias/asignar-incidencia/asignar-incidencia';
import { DiccionarioFallas } from './components/incidencias/diccionario-fallas/diccionario-fallas';
import { InformeTecnicoComponent } from './components/incidencias/informe-tecnico/informe-tecnico';
import { MisTareas } from './components/incidencias/mis-tareas/mis-tareas';
import { RegistrarIncidencia } from './components/incidencias/registrar-incidencia/registrar-incidencia';
import { SolicitarRepuestoComponent } from './components/incidencias/solicitar-repuesto/solicitar-repuesto';
import { RegistrarRol } from './components/gestion/registrar-rol/registrar-rol';
import { Bienvenida } from './components/principal/bienvenida/bienvenida';
import { Principal } from './components/principal/principal';
import { Proximamente } from './components/principal/proximamente/proximamente';
import { authGuard } from './guards/auth-guard';
import { moduloGuard } from './guards/modulo-guard';
import { Reportes } from './components/reportes/reportes/reportes';
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'iniciar-sesion', component: InicioSesion },
  {
    path: 'principal',
    component: Principal,
    canActivate: [authGuard],
    children: [
      { path: '', component: Bienvenida },
      // Sprint 2
      { path: 'registrar-incidencia', component: RegistrarIncidencia, canActivate: [moduloGuard] },
      { path: 'asignar-incidencia', component: AsignarIncidencia, canActivate: [moduloGuard] },
      // Sprint 3
      { path: 'mis-tareas', component: MisTareas, canActivate: [moduloGuard] },
      { path: 'solicitar-repuesto', component: SolicitarRepuestoComponent, canActivate: [moduloGuard] },
      { path: 'informe-tecnico', component: InformeTecnicoComponent, canActivate: [moduloGuard] },
      { path: 'diccionario-fallas', component: DiccionarioFallas, canActivate: [moduloGuard] },
      // Gestión administrativa (SIGCON)
      { path: 'gestion-roles', component: RegistrarRol, canActivate: [moduloGuard] },
      // Sprint 4
      { path: 'reportes', component: Reportes, canActivate: [moduloGuard] },
      { path: ':modulo', component: Proximamente, canActivate: [moduloGuard] },
    ],
  },
  { path: '**', redirectTo: '' },
];
