import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { iconoModulo } from '../../../model/iconos';
import { UserSession } from '../../../model/user-session';
import { SessionService } from '../../../services/session';

// Inicio de la zona privada: saludo y accesos a los módulos del rol
@Component({
  selector: 'app-bienvenida',
  imports: [RouterLink],
  templateUrl: './bienvenida.html',
  styleUrl: './bienvenida.scss',
})
export class Bienvenida {
  user: UserSession | null = inject(SessionService).getInfoSession();
  icono = iconoModulo;
}
