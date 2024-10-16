import { Routes } from '@angular/router';
import { authGuard } from './users/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./phonebook/list/list.component'),
  },

  {
    path: 'add',
    loadComponent: () => import('./phonebook/editor/editor.component'),
    canActivate: [authGuard],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./phonebook/editor/editor.component'),
    canActivate: [authGuard],
  },
  {
    path: ':id',
    loadComponent: () => import('./phonebook/details/details.component'),
  },
];
