import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private api = 'http://localhost:8080/api/transactions';
  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<any[]>(this.api); }
  create(t: any) { return this.http.post<any>(this.api, t); }
  update(id: number, t: any) { return this.http.put<any>(`${this.api}/${id}`, t); }
  delete(id: number) { return this.http.delete(`${this.api}/${id}`); }
  getSummary() { return this.http.get<any>(`${this.api}/summary`); }
}