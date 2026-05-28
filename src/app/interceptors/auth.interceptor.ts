import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  console.log('Auth Interceptor: Processing request to', req.url, 'Token:', token ? 'present' : 'missing');
  if (token) {
    console.log('Auth Interceptor: Adding Authorization header');
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  } else {
    console.log('Auth Interceptor: No token available');
  }
  return next(req);
};