import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Subject, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';

import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

import { SidebarComponent } from '../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit, OnDestroy {

  categories: any[] = [];

  showForm = false;

  editingId: number | null = null;

  form = {
    name: '',
    type: 'EXPENSE'
  };

  saving = false;

  error = '';

  loading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private categoryService: CategoryService,
    public auth: AuthService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    this.load();

    this.route.data
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.load());
  }

  load() {

    this.loading = true;

    this.categoryService.getAll()
      .pipe(
        catchError(() => of([])),
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe(c => {
        this.categories = Array.isArray(c) ? c : [];
        this.cdr.markForCheck();
      });
  }

  openForm() {

    this.showForm = true;

    this.editingId = null;

    this.error = '';

    this.form = {
      name: '',
      type: 'EXPENSE'
    };
  }

  edit(c: any) {

    this.showForm = true;

    this.editingId = c.id;

    this.error = '';

    this.form = {
      name: c.name,
      type: c.type
    };
  }

  save() {

    if (this.saving) return;

    this.error = '';

    const payload = {
      name: (this.form.name || '').trim(),
      type: this.form.type
    };

    if (!payload.name) {
      this.notification.warning('Name Required', 'Please enter a category name');
      return;
    }

    if (payload.name.length < 2) {
      this.notification.warning('Name Too Short', 'Category name must be at least 2 characters');
      return;
    }

    this.saving = true;

    if (this.editingId) {

      this.categoryService.update(this.editingId, payload)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.saving = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: () => {
            this.notification.success('Success', 'Category updated successfully');
            this.load();
            this.showForm = false;
          },
          error: () => {
            this.notification.error('Error', 'Failed to update category');
            this.error = 'Update failed';
          }
        });

    } else {

      this.categoryService.create(payload)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.saving = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: () => {
            this.notification.success('Success', 'Category created successfully');
            this.load();
            this.showForm = false;
          },
          error: () => {
            this.notification.error('Error', 'Failed to create category');
            this.error = 'Create failed';
          }
        });

    }

  }

  delete(id: number) {

    if (confirm('Are you sure you want to delete this category?')) {

      this.categoryService.delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notification.success('Deleted', 'Category deleted successfully');
            this.load();
          },
          error: () => this.notification.error('Error', 'Failed to delete category')
        });

    }

  }

  incomeCategories() {
    return this.categories.filter(c => c.type === 'INCOME');
  }

  expenseCategories() {
    return this.categories.filter(c => c.type === 'EXPENSE');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}