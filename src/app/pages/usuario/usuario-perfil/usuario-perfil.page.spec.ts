import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioPerfilPage } from './usuario-perfil.page';

describe('UsuarioPerfilPage', () => {
  let component: UsuarioPerfilPage;
  let fixture: ComponentFixture<UsuarioPerfilPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioPerfilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
