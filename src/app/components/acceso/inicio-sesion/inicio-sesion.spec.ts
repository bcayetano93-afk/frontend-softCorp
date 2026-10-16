import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ToastService } from '../../../services/toast';
import { InicioSesion } from './inicio-sesion';

describe('InicioSesion', () => {
  let component: InicioSesion;
  let fixture: ComponentFixture<InicioSesion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioSesion],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(InicioSesion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a toast when the fields are empty', () => {
    component.ingresar();
    const toasts = TestBed.inject(ToastService).toasts();
    expect(toasts[0].message).toBe('Ingresa tu usuario y contraseña.');
    expect(toasts[0].type).toBe('warning');
  });
});
