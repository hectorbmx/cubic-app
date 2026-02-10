import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordResetConfirmPage } from './password-reset-confirm.page';

describe('PasswordResetConfirmPage', () => {
  let component: PasswordResetConfirmPage;
  let fixture: ComponentFixture<PasswordResetConfirmPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordResetConfirmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
