import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private api = 'http://localhost:8080/api/budgets';
  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<any[]>(this.api); }
  create(b: any) { return this.http.post<any>(this.api, b); }
  update(id: number, b: any) { return this.http.put<any>(`${this.api}/${id}`, b); }
  delete(id: number) { return this.http.delete(`${this.api}/${id}`); }
}