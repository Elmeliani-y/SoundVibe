import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing'; // Importer RouterTestingModule
import { ActivatedRoute } from '@angular/router';
import { HomeAppComponent } from './home-app.component';
import { of } from 'rxjs'; // Pour simuler les observables

describe('HomeAppComponent', () => {
  let component: HomeAppComponent;
  let fixture: ComponentFixture<HomeAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeAppComponent], // Déclarez le composant
      imports: [RouterTestingModule], // Importez RouterTestingModule pour les dépendances du routeur
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '456' }), // Simulez les paramètres de route si nécessaire
            queryParams: of({ search: 'example' }), // Simulez les queryParams si nécessaire
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
