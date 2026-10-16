import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { SessionService, TOKEN_KEY } from './session';
import { StorageService } from './storage';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private session = inject(SessionService);

  // Envía usuario y contraseña; si son correctos guarda el token en localStorage
  login(user: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, user)
      .pipe(tap((respuesta) => this.storage.setItem(TOKEN_KEY, respuesta.token)));
  }

  logout(): void {
    this.storage.removeItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return this.storage.getItem(TOKEN_KEY);
  }

  // Hay sesión si existe un token y todavía no venció
  isLoggedIn(): boolean {
    const user = this.session.getInfoSession();
    return user !== null && user.expira * 1000 > Date.now();
  }
}
