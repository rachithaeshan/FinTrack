import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit, OnDestroy {
  transactions: any[] = [];
  categories: any[] = [];
  showForm = false;
  editingId: number | null = null;
  loading = false;
  private destroy$ = new Subject<void>();

  form: any = {
    title: '', amount: '', type: 'EXPENSE',
    date: '', note: '', category: null
  };

  constructor(
    private txService: TransactionService,
    private categoryService: CategoryService,
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
      transactions: this.txService.getAll().pipe(catchError(() => of([]))),
      categories: this.categoryService.getAll().pipe(catchError(() => of([])))
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    )
    .subscribe(({ transactions, categories }) => {
      this.transactions = Array.isArray(transactions) ? transactions : [];
      this.categories = Array.isArray(categories) ? categories : [];
      this.cdr.markForCheck();
    });
  }

  load() {
    this.txService.getAll().pipe(
      catchError(() => of([])),
      takeUntil(this.destroy$)
    ).subscribe(t => {
      this.transactions = Array.isArray(t) ? t : [];
      this.cdr.markForCheck();
    });
  }

  openForm() {
    this.showForm = true;
    this.editingId = null;
    this.form = {
      title: '', amount: '', type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
      note: '', category: null
    };
  }

  edit(t: any) {
    this.showForm = true;
    this.editingId = t.id;
    this.form = {
      ...t,
      category: t.category?.id || null,
      date: t.date ? t.date.substring(0, 10) : ''
    };
  }

  save() {
    if (!this.form.title || !this.form.amount) {
      this.notification.warning('Incomplete Form', 'Please fill in all required fields');
      return;
    }

    const payload = {
      ...this.form,
      amount: parseFloat(this.form.amount) || 0,
      category: this.form.category ? { id: this.form.category } : null
    };
    delete (payload as any).id;

    const obs = this.editingId
      ? this.txService.update(this.editingId, payload)
      : this.txService.create(payload);

    obs.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        const message = this.editingId ? 'Transaction updated successfully' : 'Transaction added successfully';
        this.notification.success('Success', message);
        this.load();
        this.showForm = false;
        this.form = { title: '', amount: '', type: 'EXPENSE', date: '', note: '', category: null };
      },
      error: () => {
        this.notification.error('Error', 'Failed to save transaction. Please try again.');
      }
    });
  }

  delete(id: number) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.txService.delete(id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.notification.success('Deleted', 'Transaction deleted successfully');
          this.load();
        },
        error: () => {
          this.notification.error('Error', 'Failed to delete transaction');
        }
      });
    }
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}