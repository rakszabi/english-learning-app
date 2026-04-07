import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputComponent } from '../../ui-components/input/input.component';
import { ButtonComponent } from '../../ui-components/button/button.component';
import { AuthService } from '../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  if (pw && confirm && pw !== confirm) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-registration-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, InputComponent, ButtonComponent],
  templateUrl: './registration-page.html',
  styleUrl: './registration-page.scss',
})
export class RegistrationPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  protected readonly form = this.fb.group(
    {
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  protected readonly loading = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly registeredEmail = signal<string | null>(null);

  private fieldError(name: string, messages: Record<string, string>): string | null {
    const ctrl = this.form.get(name);
    if (!ctrl?.touched || ctrl.valid) return null;
    for (const [key, msg] of Object.entries(messages)) {
      if (ctrl.errors?.[key]) return msg;
    }
    return null;
  }

  get firstnameError(): string | null {
    return this.fieldError('firstname', { required: 'A keresztnév megadása kötelező.' });
  }

  get lastnameError(): string | null {
    return this.fieldError('lastname', { required: 'A vezetéknév megadása kötelező.' });
  }

  get emailError(): string | null {
    return this.fieldError('email', {
      required: 'Az e-mail cím megadása kötelező.',
      email: 'Kérjük, érvényes e-mail címet adj meg.',
    });
  }

  get passwordError(): string | null {
    return this.fieldError('password', {
      required: 'A jelszó megadása kötelező.',
      minlength: 'A jelszónak legalább 8 karakter hosszúnak kell lennie.',
    });
  }

  get confirmPasswordError(): string | null {
    const ctrl = this.form.get('confirmPassword');
    if (!ctrl?.touched) return null;
    if (ctrl.errors?.['required']) return 'A jelszó megerősítése kötelező.';
    if (this.form.errors?.['passwordMismatch']) return 'A két jelszó nem egyezik meg.';
    return null;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.serverError.set(null);

    const { firstname, lastname, email, password } = this.form.value;

    this.auth.register({ firstname: firstname!, lastname: lastname!, email: email!, password: password! }).subscribe({
      next: () => {
        this.loading.set(false);
        this.registeredEmail.set(email!);
      },
      error: (err) => {
        this.loading.set(false);
        this.serverError.set(err?.error?.message ?? 'Valami hiba történt. Kérjük, próbáld újra.');
      },
    });
  }
}
