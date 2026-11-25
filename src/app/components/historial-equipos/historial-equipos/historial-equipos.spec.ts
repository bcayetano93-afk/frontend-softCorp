import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialEquipos } from './historial-equipos';

describe('HistorialEquipos', () => {
  let component: HistorialEquipos;
  let fixture: ComponentFixture<HistorialEquipos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialEquipos],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialEquipos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
