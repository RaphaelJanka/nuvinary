import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalLayout } from './legal';

describe('LegalLayout', () => {
  let component: LegalLayout;
  let fixture: ComponentFixture<LegalLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(LegalLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
