import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { Login } from './login/login';
import { Invitation } from './invitation/invitation';
import { ValentineCard } from './valentine-card/valentine-card';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'invitation', component: Invitation, canActivate: [authGuard] },
  { path: 'card', component: ValentineCard, canActivate: [authGuard] },
  { path: '**', redirectTo: '' } // Redirect unknown paths to login
];
