import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  if (!token) { inject(Router).navigate(['/login']); return false; }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('JWT payload:', payload);
    const roles: string[] = payload.roles || payload.authorities || [];
    const isAdmin = roles.some((r: string) =>
      r === 'ROLE_ADMIN' || r === 'ADMIN'
    );
    if (isAdmin) return true;
    inject(Router).navigate(['/dashboard']);
    return false;
  } catch {
    inject(Router).navigate(['/login']);
    return false;
  }
};