import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { DialogueListPage } from './pages/dialogue-list-page/dialogue-list-page';
import { DialoguePage } from './pages/dialogue-page/dialogue-page';
import { ForgotPasswordPage } from './pages/forgot-password-page/forgot-password-page';
import { LoginPage } from './pages/login-page/login-page';
import { NotFoundPage } from './pages/not-found-page/not-found-page';
import { ProfilePage } from './pages/profile-page/profile-page';
import { RegistrationPage } from './pages/registration-page/registration-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: LoginPage },
  { path: 'registration', component: RegistrationPage },
  { path: 'forgot-password', component: ForgotPasswordPage },
  { path: 'profile', component: ProfilePage },
  { path: 'dashboard', component: DashboardPage },
  { path: 'dialogues', component: DialogueListPage },
  { path: 'dialogues/:id', component: DialoguePage },
  { path: '404', component: NotFoundPage },
  { path: '**', redirectTo: '404' },
];
