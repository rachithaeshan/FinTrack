import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.scss']
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  showForm = false;
  editingId: number | null = null;
  form = { name: '', type: 'EXPENSE' };
  saving = false;
  error = '';

  constructor(private categoryService: CategoryService, public auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.categoryService.getAll().subscribe({
      next: c => this.categories = c,
      error: () => this.categories = []
    });
  }

  openForm() {
    this.showForm = true;
    this.editingId = null;
    this.form = { name: '', type: 'EXPENSE' };
  }

  edit(c: any) {
    this.showForm = true;
    this.editingId = c.id;
    this.form = { name: c.name, type: c.type };
  }

  save() {
    if (this.saving) return;
    this.error = '';
    this.saving = true;

    const payload = { name: (this.form.name || '').trim(), type: this.form.type };
    if (!payload.name) {
      this.error = 'Name is required';
      this.saving = false;
      return;
    }

    if (this.editingId) {
      this.categoryService.update(this.editingId, payload).subscribe({
        next: updated => {
          const idx = this.categories.findIndex(x => x.id === this.editingId);
          if (idx !== -1) this.categories[idx] = updated || { id: this.editingId, ...payload };
          this.showForm = false;
        },
        error: () => this.error = 'Update failed',
        complete: () => this.saving = false
      });
    } else {
      this.categoryService.create(payload).subscribe({
        next: created => {
          // optimistic: add returned category if present, otherwise reload
          if (created && created.id) this.categories.push(created);
          else this.load();
          this.showForm = false;
        },
        error: () => this.error = 'Create failed',
        complete: () => this.saving = false
      });
    }
  }

  delete(id: number) {
    if (confirm('Delete this category?')) {
      this.categoryService.delete(id).subscribe({
        next: () => { this.categories = this.categories.filter(c => c.id !== id); },
        error: () => alert('Delete failed')
      });
    }
  }

  incomeCategories() { return this.categories.filter(c => c.type === 'INCOME'); }
  expenseCategories() { return this.categories.filter(c => c.type === 'EXPENSE'); }
}