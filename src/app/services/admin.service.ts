import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get(`${this.api}/stats`);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/users`);
  }

  getUserActivity(userId: string | number): Observable<any> {
    return this.http.get(`${this.api}/users/${userId}/activity`);
  }

  blockUser(userId: string | number): Observable<any> {
    return this.http.post(`${this.api}/users/${userId}/block`, {});
  }

  unblockUser(userId: string | number): Observable<any> {
    return this.http.post(`${this.api}/users/${userId}/unblock`, {});
  }
}
