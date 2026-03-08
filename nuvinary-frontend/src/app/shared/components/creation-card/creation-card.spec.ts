import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationCard } from './creation-card';

describe('CreationCard', () => {
  let component: CreationCard;
  let fixture: ComponentFixture<CreationCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreationCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreationCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
