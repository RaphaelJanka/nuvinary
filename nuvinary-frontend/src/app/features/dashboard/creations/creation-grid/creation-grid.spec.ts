import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationGrid } from './creation-grid';

describe('CreationGrid', () => {
  let component: CreationGrid;
  let fixture: ComponentFixture<CreationGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreationGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreationGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
