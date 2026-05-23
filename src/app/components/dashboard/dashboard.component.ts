import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';
import { Subject, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  summary: any = { totalIncome: 0, totalExpense: 0, balance: 0 };
  transactions: any[] = [];
  loading = false;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(private txService: TransactionService, public auth: AuthService) {}

  ngOnInit() {
    this.loading = true;
    this.txService.getSummary()
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => { this.error = 'Failed to load summary'; return of({ totalIncome: 0, totalExpense: 0, balance: 0 }); })
      )
      .subscribe(s => this.summary = s);

    this.txService.getAll()
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => { this.error = 'Failed to load transactions'; return of([]); })
      )
      .subscribe(t => {
        this.transactions = Array.isArray(t) ? t.slice(0, 5) : [];
        this.loading = false;
      });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}