import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatDialog } from '@angular/material/dialog';
import LoginComponent from '../login/login.component';

export let authGuard: CanActivateFn = () => {
  if (typeof localStorage === 'undefined') return false;

  if (localStorage?.getItem('user')) {
    return true;
  } else {
    let dialog = inject(MatDialog);
    dialog.open(LoginComponent);

    return false;
  }
};
