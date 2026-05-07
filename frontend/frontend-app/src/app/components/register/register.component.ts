import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, public authService: AuthService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user'],
      adminSecret: [''],
    });

    // Dynamically require adminSecret only when role = admin
    this.form.get('role')!.valueChanges.subscribe((role) => {
      const secretCtrl = this.form.get('adminSecret')!;
      if (role === 'admin') {
        secretCtrl.setValidators([Validators.required]);
      } else {
        secretCtrl.clearValidators();
        secretCtrl.setValue('');
      }
      secretCtrl.updateValueAndValidity();
    });
  }

  get selectedRole(): string {
    return this.form.get('role')!.value;
  }

  setRole(role: 'user' | 'admin'): void {
    this.form.get('role')!.setValue(role);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password, role, adminSecret } = this.form.value;
    const payload: any = { name, email, password, role };
    if (role === 'admin') payload.adminSecret = adminSecret;

    this.authService.register(payload).subscribe({
      next: () => this.authService.navigateByRole(),
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Registration failed.';
        this.isLoading = false;
      },
    });
  }
}