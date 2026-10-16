import { Injectable, inject } from '@angular/core';
import { UserSession } from '../model/user-session';
import { StorageService } from './storage';

export const TOKEN_KEY = 'user_token';

// Lee los datos del usuario que vienen dentro del token JWT
@Injectable({ providedIn: 'root' })
export class SessionService {
  private storage = inject(StorageService);

  getInfoSession(): UserSession | null {
    const datos = this.getDecodedToken();
    if (!datos) {
      return null;
    }
    return {
      username: datos.sub,
      nombres: datos.names,
      apellidos: datos.lastNames,
      rol: datos.role,
      rolDescripcion: datos.roleDescription,
      modulos: datos.modules ?? [],
      expira: datos.exp,
    };
  }

  // El token tiene 3 partes separadas por "."; la segunda (payload) tiene los datos en Base64
  private getDecodedToken(): any | null {
    const token = this.storage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      // TextDecoder respeta las tildes y la ñ (atob solo no lo hace)
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return null;
    }
  }
}
