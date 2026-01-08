import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioTabsPage } from './usuario-tabs.page';

describe('UsuarioTabsPage', () => {
  let component: UsuarioTabsPage;
  let fixture: ComponentFixture<UsuarioTabsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
