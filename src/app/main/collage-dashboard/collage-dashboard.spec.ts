import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollageDashboard } from './collage-dashboard';

describe('CollageDashboard', () => {
  let component: CollageDashboard;
  let fixture: ComponentFixture<CollageDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollageDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(CollageDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
