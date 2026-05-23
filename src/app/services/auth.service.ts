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

  constructor(private http: HttpClient, private router: Router) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.api}/register`, data).pipe(
      tap((res: any) => this.saveToken(res.token))
    );
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.api}/login`, data).pipe(
      tap((res: any) => this.saveToken(res.token))
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.isLoggedIn$.next(false);
    this.router.navigate(['/login']);
  }

  getToken() { return localStorage.getItem(this.tokenKey); }
  hasToken() { return !!localStorage.getItem(this.tokenKey); }

  private saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.isLoggedIn$.next(true);
  }
}