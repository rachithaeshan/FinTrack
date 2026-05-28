import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ProfileComponent } from '../../profile/profile.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, ProfileComponent],
  template: `
    <aside class="sidebar">
       <div class="sidebar-brand">
        <div class="brand-icon"><i class="ti ti-trending-up"></i></div>
        <span>FinTrack</span>
        <div class="brand-spacer"></div>
        <app-profile></app-profile>
      </div>
      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active"
           [routerLinkActiveOptions]="{exact:true}" class="nav-link">
          <i class="ti ti-layout-dashboard"></i><span>Dashboard</span>
        </a>
        <a routerLink="/transactions" routerLinkActive="active"
           [routerLinkActiveOptions]="{exact:true}" class="nav-link">
          <i class="ti ti-credit-card"></i><span>Transactions</span>
        </a>
        <a routerLink="/budgets" routerLinkActive="active"
           [routerLinkActiveOptions]="{exact:true}" class="nav-link">
          <i class="ti ti-target"></i><span>Budgets</span>
        </a>
        <a routerLink="/categories" routerLinkActive="active"
           [routerLinkActiveOptions]="{exact:true}" class="nav-link">
          <i class="ti ti-tag"></i><span>Categories</span>
        </a>
        <a *ngIf="auth.isAdmin()" routerLink="/admin"
           routerLinkActive="active" class="nav-link admin-link">
          <i class="ti ti-shield-check"></i><span>Admin Panel</span>
        </a>
      </nav>
      <div class="sidebar-footer">
        <button class="nav-link logout" (click)="auth.logout()">
          <i class="ti ti-logout"></i><span>Logout</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    :host { display: contents; }
    .sidebar { width: 220px; background: #0f4c5c; display: flex;
      flex-direction: column; position: fixed; height: 100vh; z-index: 10; }
    .sidebar-brand { display: flex; align-items: center; gap: 10px;
      padding: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .brand-icon { width: 30px; height: 30px; border-radius: 7px;
      background: #14b8a6; display: flex; align-items: center; justify-content: center; }
    .brand-icon i { font-size: 16px; color: white; }
    .sidebar-brand span { font-size: 15px; font-weight: 600; color: white; }
    .sidebar-nav { flex: 1; padding: 0.75rem 0.5rem;
      display: flex; flex-direction: column; gap: 2px; }
    .sidebar-footer { padding: 0.75rem 0.5rem;
      border-top: 1px solid rgba(255,255,255,0.08); }
    .nav-link { display: flex; align-items: center; gap: 10px;
      padding: 0.6rem 0.75rem; border-radius: 8px; color: rgba(255,255,255,0.55);
      font-size: 0.875rem; font-weight: 400; transition: all 0.15s;
      border: none; background: none; width: 100%; text-align: left;
      text-decoration: none; cursor: pointer; }
    .nav-link i { font-size: 17px; }
    .nav-link:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); }
    .nav-link.active { background: rgba(20,184,166,0.18); color: white;
      font-weight: 500; border: 1px solid rgba(20,184,166,0.25); }
    .nav-link.active i { color: #14b8a6; }
    .nav-link.logout:hover { background: rgba(244,63,94,0.15); color: #fda4af; }
    .nav-link.logout:hover i { color: #fda4af; }
    .admin-link { margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.08);
      padding-top: 0.75rem; }
    .admin-link.active { background: rgba(124,58,237,0.2);
      border-color: rgba(124,58,237,0.3); }
    .admin-link.active i { color: #a78bfa; }
  `]
})
export class SidebarComponent {
  constructor(public auth: AuthService, private router: Router) { }
}