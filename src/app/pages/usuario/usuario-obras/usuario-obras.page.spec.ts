import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioObrasPage } from './usuario-obras.page';

describe('UsuarioObrasPage', () => {
  let component: UsuarioObrasPage;
  let fixture: ComponentFixture<UsuarioObrasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioObrasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
