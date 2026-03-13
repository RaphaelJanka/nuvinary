import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationDetails } from './creation-details';

describe('CreationDetails', () => {
  let component: CreationDetails;
  let fixture: ComponentFixture<CreationDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreationDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreationDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
