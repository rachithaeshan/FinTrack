import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  summary: any = { totalIncome: 0, totalExpense: 0, balance: 0 };
  transactions: any[] = [];
  loading = false;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(
    private txService: TransactionService,
    public auth: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe(() => this.loadData());
  }

  loadData() {
    this.loading = true;
    forkJoin({
      summary: this.txService.getSummary().pipe(
        catchError(() => of({ totalIncome: 0, totalExpense: 0, balance: 0 }))
      ),
      transactions: this.txService.getAll().pipe(
        catchError(() => of([]))
      )
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe(({ summary, transactions }) => {
      this.summary = summary;
      this.transactions = Array.isArray(transactions) ? transactions.slice(0, 5) : [];
      if (summary && (summary as any).summary) this.summary = (summary as any).summary;
      if (!Array.isArray(transactions) && (transactions as any).transactions) {
        this.transactions = (transactions as any).transactions.slice(0, 5);
      }
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}