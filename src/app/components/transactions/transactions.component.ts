import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.scss']
})
export class TransactionsComponent implements OnInit {
  transactions: any[] = [];
  categories: any[] = [];
  showForm = false;
  editingId: number | null = null;

  form: any = {
    title: '', amount: '', type: 'EXPENSE',
    date: '', note: '', category: null
  };

  constructor(
    private txService: TransactionService,
    private categoryService: CategoryService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.load();
    this.categoryService.getAll().subscribe(c => this.categories = c);
  }

  load() {
    this.txService.getAll().subscribe(t => this.transactions = t);
  }

  openForm() {
    this.showForm = true;
    this.editingId = null;
    this.form = { title: '', amount: '', type: 'EXPENSE', date: '', note: '', category: null };
  }

  edit(t: any) {
    this.showForm = true;
    this.editingId = t.id;
    this.form = { ...t, category: t.category?.id ? { id: t.category.id } : null };
  }

  save() {
    const payload = {
      ...this.form,
      amount: parseFloat(this.form.amount),
      category: this.form.category ? { id: this.form.category } : null
    };
    if (this.editingId) {
      this.txService.update(this.editingId, payload).subscribe(() => {
        this.load(); this.showForm = false;
      });
    } else {
      this.txService.create(payload).subscribe(() => {
        this.load(); this.showForm = false;
      });
    }
  }

  delete(id: number) {
    if (confirm('Delete this transaction?')) {
      this.txService.delete(id).subscribe(() => this.load());
    }
  }
}