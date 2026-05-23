import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  form = { email: '', password: '' };
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.form).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error = 'Invalid email or password';
        this.loading = false;
      }
    });
  }
}