import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { SessionService } from '../../../services/session';
import { ToastService } from '../../../services/toast';

@Component({
  imports: [RouterLink, FormsModule],
  selector: 'app-inicio-sesion',
  styleUrl: './inicio-sesion.scss',
  templateUrl: './inicio-sesion.html',
})
export class InicioSesion {
  private auth = inject(AuthService);
  private session = inject(SessionService);
  private toast = inject(ToastService);
  private router = inject(Router);

  // Valores del formulario (conectados con [(ngModel)] en el HTML)
  username = '';
  password = '';

  ingresar(): void {
    if (!this.username.trim() || !this.password) {
      this.toast.show('Ingresa tu usuario y contraseña.', 'warning');
      return;
    }

    // El "Cargando..." lo muestra el interceptor de carga
    this.auth.login({ username: this.username.trim(), password: this.password }).subscribe({
      // Login correcto: el token ya se guardó en localStorage
      next: () => {
        const usuario = this.session.getInfoSession();
        this.toast.show(`¡Bienvenido, ${usuario?.nombres}!`, 'success');
        this.router.navigate(['/principal']);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.show(this.mensajeDeError(err), 'danger');
      },
    });
  }

  private mensajeDeError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté encendido.';
    }
    if (err.status === 401) {
      return 'Usuario o contraseña incorrectos.';
    }
    // Mensaje que envía el backend (ej. "El usuario es obligatorio")
    return err.error?.message ?? 'Ocurrió un error. Inténtalo de nuevo.';
  }
}
