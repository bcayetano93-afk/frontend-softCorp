import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Reportes } from './reportes';

describe('Reportes', () => {
  let component: Reportes;
  let fixture: ComponentFixture<Reportes>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reportes],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Reportes);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpTesting.expectOne(`${environment.apiUrl}/v1/tecnicos/disponibilidad`).flush([]);
    httpTesting.expectOne(`${environment.apiUrl}/v1/reportes/equipos-complicados`).flush([]);
    httpTesting
      .expectOne(
        `${environment.apiUrl}/v1/reportes/solucionadas-por-dia?desde=${component.rango.desde}&hasta=${component.rango.hasta}`,
      )
      .flush([]);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
