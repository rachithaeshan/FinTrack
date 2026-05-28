import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { BudgetService } from '../../services/budget.service';
import { CategoryService } from '../../services/category.service';
import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.scss'
})
export class BudgetsComponent implements OnInit, OnDestroy {
  budgets: any[] = [];
  categories: any[] = [];
  transactions: any[] = [];
  showForm = false;
  editingId: number | null = null;
  loading = false;
  form: any = { amount: '', category: null };
  private destroy$ = new Subject<void>();

  constructor(
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private txService: TransactionService,
    public auth: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    this.loadAll();
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe(() => this.loadAll());
  }

  loadAll() {
    this.loading = true;
    forkJoin({
      budgets: this.budgetService.getAll().pipe(catchError(() => of([]))),
      categories: this.categoryService.getAll().pipe(catchError(() => of([]))),
      transactions: this.txService.getAll().pipe(catchError(() => of([])))
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    )
    .subscribe(({ budgets, categories, transactions }) => {
      this.budgets = Array.isArray(budgets) ? budgets : [];
      this.categories = Array.isArray(categories) ? categories : [];
      this.transactions = Array.isArray(transactions) ? transactions : [];
      this.cdr.markForCheck();
    });
  }

  load() {
    this.budgetService.getAll().pipe(
      catchError(() => of([])),
      takeUntil(this.destroy$)
    ).subscribe(b => {
      this.budgets = Array.isArray(b) ? b : [];
      this.cdr.markForCheck();
    });
  }

  getSpent(budget: any): number {
    return this.transactions
      .filter(t => t.type === 'EXPENSE' && t.category?.id === budget.category?.id)
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }

  getPercent(budget: any): number {
    if (!budget.amount) return 0;
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
    if (!this.form.amount || !this.form.category) {
      this.notification.warning('Incomplete Form', 'Please select a category and enter an amount');
      return;
    }

    const payload = {
      amount: parseFloat(this.form.amount),
      category: this.form.category ? { id: this.form.category } : null
    };

    if (this.editingId) {
      this.budgetService.update(this.editingId, payload).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.notification.success('Success', 'Budget updated successfully');
          this.load();
          this.showForm = false;
        },
        error: () => this.notification.error('Error', 'Failed to update budget')
      });
    } else {
      this.budgetService.create(payload).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.notification.success('Success', 'Budget created successfully');
          this.load();
          this.showForm = false;
        },
        error: () => this.notification.error('Error', 'Failed to create budget')
      });
    }
  }

  delete(id: number) {
    if (confirm('Are you sure you want to delete this budget?')) {
      this.budgetService.delete(id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.notification.success('Deleted', 'Budget deleted successfully');
          this.load();
        },
        error: () => this.notification.error('Error', 'Failed to delete budget')
      });
    }
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}