import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'transactions',
    loadComponent: () => import('./components/transactions/transactions.component').then(m => m.TransactionsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'budgets',
    loadComponent: () => import('./components/budgets/budgets.component').then(m => m.BudgetsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'categories',
    loadComponent: () => import('./components/categories/categories.component').then(m => m.CategoriesComponent),
    canActivate: [authGuard]
  }
];