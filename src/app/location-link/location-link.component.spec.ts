import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationLinkComponent } from './location-link.component';

describe('LocationLinkComponent', () => {
  let component: LocationLinkComponent;
  let fixture: ComponentFixture<LocationLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocationLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
