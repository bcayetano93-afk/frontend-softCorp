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

  it('should not show a toast when submitting empty fields', () => {
    component.ingresar();
    const toasts = TestBed.inject(ToastService).toasts();
    expect(component.form.invalid).toBe(true);
    expect(toasts.length).toBe(0);
  });

  it('should disable submit when email is invalid', () => {
    component.form.setValue({ email: 'correo-invalido', password: '1234' });
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(component.form.invalid).toBe(true);
    expect(button.disabled).toBe(true);
  });

  it('should enable submit when email and password satisfy SIGCON constraints', () => {
    component.form.setValue({ email: 'jefe@softcorp.com', password: '1234' });
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(component.form.valid).toBe(true);
    expect(button.disabled).toBe(false);
  });
});
