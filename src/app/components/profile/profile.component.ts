import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  // MODALS
  showModal = false;
  showDeleteModal = false;

  // LOADING
  saving = false;
  deleting = false;

  // MESSAGES
  success = '';
  error = '';
  deleteError = '';

  // DELETE CONFIRMATION
  deleteConfirmText = '';

  // PROFILE DATA
  profile: any = {};

  // FORM
  form = {
    name: ''
  };

  constructor(
    public auth: AuthService,
    private notification: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  // LOAD USER PROFILE
  loadProfile() {
    this.auth.getProfile().subscribe({
      next: (p) => {
        this.profile = p;
        this.form.name = p.name || '';
      },

      error: () => {
        this.notification.error(
          'Error',
          'Failed to load profile'
        );
      }
    });
  }

  // OPEN EDIT MODAL
  openModal() {
    this.showModal = true;

    this.success = '';
    this.error = '';

    this.form.name = this.profile.name || '';
  }

  // CLOSE EDIT MODAL
  closeModal() {
    this.showModal = false;

    this.success = '';
    this.error = '';

    this.saving = false;

    // RESET FORM
    this.form.name = this.profile.name || '';
  }

  // SAVE PROFILE
  save() {

    // VALIDATION
    if (!this.form.name.trim()) {

      this.error = 'Name cannot be empty';

      this.notification.warning(
        'Validation',
        'Name cannot be empty'
      );

      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';

    this.auth.updateProfile({
      name: this.form.name
    }).subscribe({

      next: (updatedProfile) => {

        // UPDATE UI
        this.profile = updatedProfile;

        // UPDATE FORM
        this.form.name = updatedProfile.name || '';

        // STOP LOADING
        this.saving = false;

        // SUCCESS MESSAGE
        this.success = 'Profile updated successfully';

        // SUCCESS NOTIFICATION
        this.notification.success(
          'Success',
          'Profile updated successfully'
        );

        // CLOSE MODAL AFTER SHORT DELAY
        setTimeout(() => {
          this.closeModal();
        }, 800);
      },

      error: () => {

        this.saving = false;

        this.error = 'Failed to update profile';

        this.notification.error(
          'Error',
          'Failed to update profile'
        );
      }
    });
  }

  // OPEN DELETE MODAL
  openDeleteModal() {
    this.showDeleteModal = true;
    this.deleteError = '';
    this.deleteConfirmText = '';
  }

  // CLOSE DELETE MODAL
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteError = '';
    this.deleteConfirmText = '';
    this.deleting = false;
  }

  // DELETE ACCOUNT
  deleteAccount() {

    if (this.deleteConfirmText !== 'DELETE') {

      this.deleteError = 'Please type DELETE to confirm';

      return;
    }

    this.deleting = true;
    this.deleteError = '';

    this.auth.deleteAccount().subscribe({

      next: () => {

        this.notification.success(
          'Deleted',
          'Account deleted successfully'
        );

        // LOGOUT USER
        localStorage.removeItem('finance_token');

        // CLOSE MODAL
        this.closeDeleteModal();

        // REDIRECT TO LOGIN
        this.router.navigate(['/login']);
      },

      error: () => {

        this.deleting = false;

        this.deleteError = 'Failed to delete account';

        this.notification.error(
          'Error',
          'Failed to delete account'
        );
      }
    });
  }

  // USER INITIALS
  getInitials(): string {

    if (!this.profile?.name) {
      return '?';
    }

    return this.profile.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}