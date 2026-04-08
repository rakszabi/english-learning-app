import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { DialogueListPage } from './pages/dialogue-list-page/dialogue-list-page';
import { DialoguePage } from './pages/dialogue-page/dialogue-page';
import { NewDialoguePage } from './pages/new-dialogue-page/new-dialogue-page';
import { PracticePage } from './pages/practice-page/practice-page';
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
  { path: 'login',           title: 'Sign in',        component: LoginPage,         canActivate: [guestGuard] },
  { path: 'registration',    title: 'Create account', component: RegistrationPage,  canActivate: [guestGuard] },
  { path: 'forgot-password', title: 'Reset password', component: ForgotPasswordPage, canActivate: [guestGuard] },

  // Protected routes
  { path: 'dashboard',    title: 'Dashboard', component: DashboardPage,    canActivate: [authGuard] },
  { path: 'profile',      title: 'Profile',   component: ProfilePage,      canActivate: [authGuard] },
  { path: 'practice',     title: 'Practice',  component: PracticePage,     canActivate: [authGuard] },
  { path: 'dialogues',    title: 'Dialogues', component: DialogueListPage, canActivate: [authGuard] },
  // 'new' must come before ':id' so the router doesn't treat "new" as an ID
  { path: 'dialogues/new', title: 'New Dialogue', component: NewDialoguePage, canActivate: [authGuard] },
  // Title is set dynamically in DialoguePage using the dialogue topic
  { path: 'dialogues/:id', component: DialoguePage, canActivate: [authGuard] },

  { path: '404', title: 'Page not found', component: NotFoundPage },
  { path: '**', redirectTo: '404' },
];
