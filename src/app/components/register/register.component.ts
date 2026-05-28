import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  form = { name: '', email: '', password: '', confirmPassword: '' };
  error = '';
  loading = false;
  showPassword = false;
  showConfirm = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    if (!this.form.name || !this.form.email || !this.form.password) {
      this.error = 'Please fill in all fields';
      return;
    }
    if (this.form.password !== this.form.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }
    if (this.form.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.register(this.form).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error = 'Registration failed. Email may already be in use.';
        this.loading = false;
      }
    });
  }
}