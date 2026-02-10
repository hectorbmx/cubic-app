import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioHomePage } from './usuario-home.page';

describe('UsuarioHomePage', () => {
  let component: UsuarioHomePage;
  let fixture: ComponentFixture<UsuarioHomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
