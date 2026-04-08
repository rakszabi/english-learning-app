import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { DialogueListPage } from './pages/dialogue-list-page/dialogue-list-page';
import { DialoguePage } from './pages/dialogue-page/dialogue-page';
import { NewDialoguePage } from './pages/new-dialogue-page/new-dialogue-page';
import { ForgotPasswordPage } from './pages/forgot-password-page/forgot-password-page';
import { LoginPage } from './pages/login-page/login-page';
import { NotFoundPage } from './pages/not-found-page/not-found-page';
import { ProfilePage } from './pages/profile-page/profile-page';
import { RegistrationPage } from './pages/registration-page/registration-page';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  // Guest-only routes
  { path: 'login', component: LoginPage, canActivate: [guestGuard] },
  { path: 'registration', component: RegistrationPage, canActivate: [guestGuard] },
  { path: 'forgot-password', component: ForgotPasswordPage, canActivate: [guestGuard] },

  // Protected routes
  { path: 'dashboard', component: DashboardPage, canActivate: [authGuard] },
  { path: 'profile', component: ProfilePage, canActivate: [authGuard] },
  { path: 'dialogues', component: DialogueListPage, canActivate: [authGuard] },
  // 'new' must come before ':id' so the router doesn't treat "new" as an ID
  { path: 'dialogues/new', component: NewDialoguePage, canActivate: [authGuard] },
  { path: 'dialogues/:id', component: DialoguePage, canActivate: [authGuard] },

  { path: '404', component: NotFoundPage },
  { path: '**', redirectTo: '404' },
];
