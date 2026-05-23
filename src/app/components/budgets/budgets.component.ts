import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BudgetService } from '../../services/budget.service';
import { CategoryService } from '../../services/category.service';
import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.scss']
})
export class BudgetsComponent implements OnInit {
  budgets: any[] = [];
  categories: any[] = [];
  transactions: any[] = [];
  showForm = false;
  editingId: number | null = null;
  form: any = { amount: '', category: null };

  constructor(
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private txService: TransactionService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.load();
    this.categoryService.getAll().subscribe(c => this.categories = c);
    this.txService.getAll().subscribe(t => this.transactions = t);
  }

  load() {
    this.budgetService.getAll().subscribe(b => this.budgets = b);
  }

  getSpent(budget: any): number {
    return this.transactions
      .filter(t => t.type === 'EXPENSE' && t.category?.id === budget.category?.id)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getPercent(budget: any): number {
    const spent = this.getSpent(budget);
    return Math.min(Math.round((spent / budget.amount) * 100), 100);
  }

  isOverBudget(budget: any): boolean {
    return this.getSpent(budget) > budget.amount;
  }

  openForm() {
    this.showForm = true;
    this.editingId = null;
    this.form = { amount: '', category: null };
  }

  edit(b: any) {
    this.showForm = true;
    this.editingId = b.id;
    this.form = { amount: b.amount, category: b.category?.id };
  }

  save() {
    const payload = {
      amount: parseFloat(this.form.amount),
      category: this.form.category ? { id: this.form.category } : null
    };
    if (this.editingId) {
      this.budgetService.update(this.editingId, payload).subscribe(() => {
        this.load(); this.showForm = false;
      });
    } else {
      this.budgetService.create(payload).subscribe(() => {
        this.load(); this.showForm = false;
      });
    }
  }

  delete(id: number) {
    if (confirm('Delete this budget?')) {
      this.budgetService.delete(id).subscribe(() => this.load());
    }
  }
}