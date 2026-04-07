import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputComponent } from '../../ui-components/input/input.component';
import { ButtonComponent } from '../../ui-components/button/button.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, InputComponent, ButtonComponent],
  templateUrl: './forgot-password-page.html',
  styleUrl: './forgot-password-page.scss',
})
export class ForgotPasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly loading = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly submitted = signal(false);

  get emailError(): string | null {
    const ctrl = this.form.get('email');
    if (!ctrl?.touched || ctrl.valid) return null;
    if (ctrl.errors?.['required']) return 'Az e-mail cím megadása kötelező.';
    if (ctrl.errors?.['email']) return 'Kérjük, érvényes e-mail címet adj meg.';
    return null;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.serverError.set(null);

    const { email } = this.form.value;

    this.auth.requestPasswordReset(email!).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.loading.set(false);
        // Szándékosan nem árulunk el, hogy az email létezik-e
        this.submitted.set(true);
      },
    });
  }
}
