import { TestBed } from '@angular/core/testing';
import { SessionService, TOKEN_KEY } from './session';

// Arma un token falso con los datos indicados (solo importa la parte del medio)
function tokenFalso(datos: object): string {
  const bytes = new TextEncoder().encode(JSON.stringify(datos));
  const base64 = btoa(String.fromCharCode(...bytes));
  return `cabecera.${base64}.firma`;
}

describe('SessionService', () => {
  beforeEach(() => localStorage.clear());

  it('should return null when there is no token', () => {
    expect(TestBed.inject(SessionService).getInfoSession()).toBeNull();
  });

  it('should read the user data and modules from the token, keeping accents', () => {
    localStorage.setItem(
      TOKEN_KEY,
      tokenFalso({
        sub: 'jefe',
        names: 'Jorge',
        lastNames: 'García López',
        role: 'JEFE',
        roleDescription: 'Jefe del área',
        modules: [{ descripcion: 'Asignación de técnicos', url: 'asignar-incidencia' }],
        exp: 9999999999,
      }),
    );

    const user = TestBed.inject(SessionService).getInfoSession();
    expect(user?.apellidos).toBe('García López');
    expect(user?.rolDescripcion).toBe('Jefe del área');
    expect(user?.modulos[0].url).toBe('asignar-incidencia');
  });

  it('should sort modules by ordenOpcion and filter out inactive modules', () => {
    localStorage.setItem(
      TOKEN_KEY,
      tokenFalso({
        sub: 'jefe',
        names: 'Jorge',
        lastNames: 'García',
        role: 'JEFE',
        roleDescription: 'Jefe del área',
        modules: [
          { descripcion: 'Reportes', url: 'reportes', ordenOpcion: 7, activo: 'S' },
          { descripcion: 'Inactivo N', url: 'oculto-1', ordenOpcion: 2, activo: 'N' },
          { descripcion: 'Inactivo false', url: 'oculto-2', ordenOpcion: 3, activo: false },
          { descripcion: 'Registro', url: 'registrar-incidencia', ordenOpcion: 1 },
        ],
        exp: 9999999999,
      }),
    );

    const user = TestBed.inject(SessionService).getInfoSession();
    expect(user?.modulos.map((m) => m.url)).toEqual(['registrar-incidencia', 'reportes']);
  });
});
