import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Visionboard } from './visionboard';

describe('Visionboard', () => {
  let component: Visionboard;
  let fixture: ComponentFixture<Visionboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Visionboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Visionboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
