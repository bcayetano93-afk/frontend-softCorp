import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { iconoModulo } from '../../../model/iconos';
import { UserSession } from '../../../model/user-session';
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
}
