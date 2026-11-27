import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { iconoModulo } from '../../../model/iconos';
import { Modulo, UserSession } from '../../../model/user-session';
import { SessionService } from '../../../services/session';
import { ChartIncidencias } from '../../dashboards/chart-incidencias/chart-incidencias';

@Component({
  selector: 'app-bienvenida',
  imports: [RouterLink, ChartIncidencias],
  templateUrl: './bienvenida.html',
  styleUrl: './bienvenida.scss',
})
export class Bienvenida {
  user: UserSession | null = inject(SessionService).getInfoSession();
  icono = iconoModulo;

  // Incluye Gestión de roles para el JEFE aunque no venga como fila fija en la tabla modulo
  get modulosVisibles(): Modulo[] {
    if (!this.user) {
      return [];
    }
    const base = [...this.user.modulos];
    if (this.user.rol === 'JEFE' && !base.some((m) => m.url === 'gestion-roles')) {
      base.push({ descripcion: 'Gestión de roles', url: 'gestion-roles', ordenOpcion: 99 });
    }
    return base;
  }
}
