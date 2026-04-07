import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

const AUTH_ROUTES = ['/login', '/registration', '/forgot-password'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  get isAuthPage(): boolean {
    return AUTH_ROUTES.some((r) => this.router.url.startsWith(r));
  }

  logout(): void {
    this.auth.logout();
  }
}
