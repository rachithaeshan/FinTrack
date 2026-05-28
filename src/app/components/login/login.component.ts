import { AfterViewInit, Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../dashboard/dashboard.component.scss']
})
export class LoginComponent implements AfterViewInit {
  form = { email: '', password: '' };
  error = '';
  loading = false;
  showPassword = false;
  activeSection = 'home';
  private sectionIds = ['home', 'about', 'services', 'contact'];

  constructor(
    private auth: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {}

  submit() {
    if (!this.form.email || !this.form.password) {
      this.notification.warning('Incomplete Form', 'Please fill in all fields');
      return;
    }

    this.loading = true;
    this.error = '';
    
    this.auth.login(this.form).subscribe({
      next: () => {
        this.notification.success('Welcome Back', 'You have been logged in successfully');
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.loading = false;
        console.log('=== LOGIN ERROR ===');
        console.log('Full error:', err);
        console.log('Error status:', err.status);
        console.log('Error message:', err.error?.message);
        console.log('Error error:', err.error);
        
        // Extract message from various possible locations
        let errorMessage = '';
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        } else if (typeof err.error === 'string') {
          errorMessage = err.error;
        }
        
        console.log('Extracted error message:', errorMessage);
        console.log('Status code is 403?', err.status === 403);
        console.log('Message includes blocked?', errorMessage.toLowerCase().includes('blocked'));
        
        // Check if user is blocked (403 status or message contains "blocked")
        if (err.status === 403 || errorMessage.toLowerCase().includes('blocked') || errorMessage.toLowerCase().includes('account has been blocked')) {
          console.log('✓ Showing BLOCKED notification');
          this.notification.blocked('Your account has been blocked by the system administrator. You cannot access the application.');
          this.error = 'Your account is blocked';
        } else {
          console.log('✗ Showing generic error notification');
          this.notification.error('Authentication Failed', 'Invalid credentials. Please try again.');
          this.error = 'Invalid credentials';
        }
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.updateActiveSection(), 0);
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.updateActiveSection();
  }

  private updateActiveSection() {
    if (typeof document === 'undefined') {
      return;
    }

    const scrollPosition = window.scrollY + window.innerHeight * 0.25;
    let currentSection = this.sectionIds[0];

    for (const section of this.sectionIds) {
      const el = document.getElementById(section);
      if (!el) {
        continue;
      }

      const rect = el.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      if (scrollPosition >= sectionTop) {
        currentSection = section;
      }
    }

    this.activeSection = currentSection;
  }

  scrollTo(section: string) {
    try {
      const el = document.getElementById(section);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (e) {
      // ignore DOM errors in environments without a document
    }
    this.activeSection = section;
  }
}