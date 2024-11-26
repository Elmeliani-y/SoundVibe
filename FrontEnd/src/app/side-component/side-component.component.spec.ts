import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideComponentComponent } from './side-component.component';

describe('SideComponentComponent', () => {
  let component: SideComponentComponent;
  let fixture: ComponentFixture<SideComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
