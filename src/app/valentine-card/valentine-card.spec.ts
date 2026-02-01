import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValentineCard } from './valentine-card';

describe('ValentineCard', () => {
  let component: ValentineCard;
  let fixture: ComponentFixture<ValentineCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValentineCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValentineCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
