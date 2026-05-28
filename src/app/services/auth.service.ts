import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:8080/api/auth';
  private tokenKey = 'finance_token';
  isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) { }

  register(data: any): Observable<any> {
    return this.http.post(`${this.api}/register`, data).pipe(
      tap((res: any) => {
        if (res && res.token) {
          this.saveToken(res.token);
        }
      })
    );
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.api}/login`, data).pipe(
      tap((res: any) => {
        if (res && res.token) {
          this.saveToken(res.token);
        }
      })
    );
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.api}/me`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.api}/me`, data);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.isLoggedIn$.next(false);
    this.router.navigate(['/login']);
  }
  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.api}/me`);
  }

  getToken() { return localStorage.getItem(this.tokenKey); }
  hasToken() {
    const token = localStorage.getItem(this.tokenKey);
    return !!token && token !== 'undefined';
  }

  private saveToken(token: string) {
    if (!token) return;
    localStorage.setItem(this.tokenKey, token);
    this.isLoggedIn$.next(true);
  }

  isAdmin(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles: string[] = payload.roles || payload.authorities || [];
      return roles.some((r: string) => r === 'ROLE_ADMIN' || r === 'ADMIN');
    } catch { return false; }
  }
}
