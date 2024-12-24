import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreBodyComponent } from './explore-body.component';

describe('ExploreBodyComponent', () => {
  let component: ExploreBodyComponent;
  let fixture: ComponentFixture<ExploreBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreBodyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExploreBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
