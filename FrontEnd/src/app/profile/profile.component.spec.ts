import { TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { RouterTestingModule } from '@angular/router/testing'; 
import { HttpClientModule } from '@angular/common/http';  
import { MatSnackBarModule } from '@angular/material/snack-bar';  

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        RouterTestingModule,  
        HttpClientModule,  
        MatSnackBarModule,  
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});