import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { TOKEN_KEY } from '../../../services/session';
import { RegistrarRol } from './registrar-rol';

function tokenJefe(): string {
  const payload = {
    sub: 'jefe@sc.pe',
    names: 'Jorge',
    lastNames: 'García',
    role: 'JEFE',
    roleDescription: 'Jefe del área',
    modules: [],
    exp: 9999999999,
  };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const base64 = btoa(String.fromCharCode(...bytes));
  return `h.${base64}.s`;
}

describe('RegistrarRol', () => {
  let fixture: ComponentFixture<RegistrarRol>;
  let component: RegistrarRol;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    localStorage.setItem(TOKEN_KEY, tokenJefe());

    await TestBed.configureTestingModule({
      imports: [RegistrarRol],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarRol);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  function flushInitialLoad(): void {
    httpTesting.expectOne(`${environment.apiUrl}/v1/modulo/list`).flush([
      { idMod: 1, descripcion: 'Registro de incidencias', url: 'registrar-incidencia', activo: 'S', ordenOpcion: 1 },
    ]);
    httpTesting.expectOne(`${environment.apiUrl}/v1/rol/list`).flush([
      { idRol: 1, codigo: 'JEFE', descripcion: 'Jefe del área' },
      { idRol: 2, codigo: 'TECNICO', descripcion: 'Técnico' },
    ]);
    fixture.detectChanges();
  }

  it('should create and load roles and modules via forkJoin', () => {
    flushInitialLoad();
    expect(component).toBeTruthy();
    expect(component.roles().length).toBe(2);
    expect(component.roles()[0].row).toBe(1);
    expect(component.modulos().length).toBe(1);
  });

  it('should enable Editar and Eliminar only when row checkbox is selected', () => {
    flushInitialLoad();
    const el = fixture.nativeElement as HTMLElement;
    const actionButtons = Array.from(el.querySelectorAll('tbody td button')) as HTMLButtonElement[];
    expect(actionButtons[0].disabled).toBe(true);
    expect(actionButtons[1].disabled).toBe(true);

    const checkbox = el.querySelector('tbody input[type="checkbox"]') as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const updatedButtons = Array.from(el.querySelectorAll('tbody td button')) as HTMLButtonElement[];
    expect(updatedButtons[0].disabled).toBe(false);
    expect(updatedButtons[1].disabled).toBe(false);
    expect(updatedButtons[2].disabled).toBe(true);
  });

  it('should query backend when searching by description', () => {
    flushInitialLoad();
    component.filterDescripcion.set('Técnico');
    component.search();

    const req = httpTesting.expectOne(`${environment.apiUrl}/v1/rol/list`);
    expect(req.request.body).toEqual({ descripcion: 'Técnico' });
    req.flush([{ idRol: 2, codigo: 'TECNICO', descripcion: 'Técnico' }]);
    fixture.detectChanges();

    expect(component.roles().length).toBe(1);
    expect(component.roles()[0].codigo).toBe('TECNICO');
  });
});
