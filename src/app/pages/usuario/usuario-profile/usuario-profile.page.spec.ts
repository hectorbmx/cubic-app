import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioProfilePage } from './usuario-profile.page';

describe('UsuarioProfilePage', () => {
  let component: UsuarioProfilePage;
  let fixture: ComponentFixture<UsuarioProfilePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
