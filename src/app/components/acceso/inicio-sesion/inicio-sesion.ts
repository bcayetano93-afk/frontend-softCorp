import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { SessionService } from '../../../services/session';
import { ToastService } from '../../../services/toast';
import { RegexConstants, onEnterKey } from '../../../util/constant';

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-inicio-sesion',
  styleUrl: './inicio-sesion.scss',
  templateUrl: './inicio-sesion.html',
})
export class InicioSesion {
  private auth = inject(AuthService);
  private session = inject(SessionService);
  private toast = inject(ToastService);
  private router = inject(Router);

  public RG = RegexConstants;
  isPasswordVisible = false;

  form = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.minLength(6),
      Validators.maxLength(20),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(12),
    ]),
  });

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onEmailInput(event: Event): void {
    this.RG.email(event);
    const value = (event.target as HTMLInputElement).value;
    this.form.controls.email.setValue(value, { emitEvent: false });
  }

  onEnterKey(event: Event): void {
    onEnterKey(event);
  }

  ingresar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = (this.form.value.email ?? '').trim();
    const password = this.form.value.password ?? '';
    if (!email || !password) {
      return;
    }

    this.auth.login({ email, password }).subscribe({
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
      return 'Correo o contraseña incorrectos.';
    }
    return err.error?.message ?? 'Ocurrió un error. Inténtalo de nuevo.';
  }
}
