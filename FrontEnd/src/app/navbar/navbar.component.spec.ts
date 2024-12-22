import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing'; // Importer RouterTestingModule
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { of } from 'rxjs'; // Pour simuler les observables

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [], // Déclarez le composant
      imports: [RouterTestingModule,NavbarComponent], // Importez RouterTestingModule pour fournir les dépendances du routeur
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }), // Simulez les paramètres de route
            queryParams: of({ search: 'test' }), // Simulez les queryParams si nécessaire
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
