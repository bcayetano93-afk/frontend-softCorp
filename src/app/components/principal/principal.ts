import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { iconoModulo } from '../../model/iconos';
import { UserSession } from '../../model/user-session';
import { AuthService } from '../../services/auth';
import { SessionService } from '../../services/session';
import { ToastService } from '../../services/toast';

// Página privada: menú lateral según el rol + contenido del módulo elegido
@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-principal',
  styleUrl: './principal.scss',
  templateUrl: './principal.html',
})
export class Principal {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  // Datos del usuario y sus módulos, leídos del token (carga dinámica del menú)
  user: UserSession | null = inject(SessionService).getInfoSession();

  icono = iconoModulo;

  cerrarSesion(): void {
    this.auth.logout();
    this.toast.show('Sesión cerrada correctamente.', 'info');
    this.router.navigate(['/iniciar-sesion']);
  }

  // Ej. "Jorge" + "García López" -> "JG"
  iniciales(): string {
    if (!this.user) {
      return '';
    }
    return (this.user.nombres.charAt(0) + this.user.apellidos.charAt(0)).toUpperCase();
  }
}
