import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ObrasClientePage } from './obras-cliente.page';

describe('ObrasClientePage', () => {
  let component: ObrasClientePage;
  let fixture: ComponentFixture<ObrasClientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ObrasClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
