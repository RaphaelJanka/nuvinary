import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalContent } from './legal-content';

describe('LegalContent', () => {
  let component: LegalContent;
  let fixture: ComponentFixture<LegalContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalContent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
