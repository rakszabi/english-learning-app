import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './ui-components/navbar/navbar.component';
import { FooterComponent } from './ui-components/footer/footer.component';

const AUTH_ROUTES = ['/login', '/registration', '/forgot-password'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);

  get isAuthPage(): boolean {
    return AUTH_ROUTES.some((r) => this.router.url.startsWith(r));
  }
}
