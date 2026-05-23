import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private api = 'http://localhost:8080/api/categories';
  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<any[]>(this.api); }
  create(c: any) { return this.http.post<any>(this.api, c); }
  update(id: number, c: any) { return this.http.put<any>(`${this.api}/${id}`, c); }
  delete(id: number) { return this.http.delete(`${this.api}/${id}`); }
}