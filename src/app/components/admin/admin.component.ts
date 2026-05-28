import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  stats: any = {};
  selectedUser: any = null;
  userActivity: any = null;
  loading = true;
  activityLoading = false;
  error: string | null = null;
  debugInfo: any = {};

  constructor(
    private adminService: AdminService,
    public auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = null;

    this.adminService.getStats().subscribe({
      next: s => {
        this.stats = s;
        this.cdr.markForCheck();
      },
      error: err => console.error('Stats error:', err)
    });

    this.adminService.getUsers().subscribe({
      next: u => {
        this.users = Array.isArray(u) ? u : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: err => {
        console.error('Users error:', err);
        this.error = err.status === 401
          ? 'Unauthorized. Please log in again.'
          : 'Failed to load users. Backend may be down.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  viewActivity(user: any) {
    this.selectedUser = user;
    this.activityLoading = true;
    this.userActivity = null;
    this.cdr.markForCheck();
    this.adminService.getUserActivity(user.id).subscribe({
      next: a => {
        this.userActivity = a;
        this.activityLoading = false;
        this.cdr.markForCheck();
      },
      error: err => {
        console.error('Activity error:', err);
        this.activityLoading = false;
        this.userActivity = {
          totalTransactions: 0,
          incomeTransactions: 0,
          expenseTransactions: 0,
          totalIncome: 0,
          totalExpense: 0,
          user: user
        };
        this.cdr.markForCheck();
      }
    });
  }

  closeActivity() {
    this.selectedUser = null;
    this.userActivity = null;
  }

  toggleBlock(user: any) {
    const action = user.blocked
      ? this.adminService.unblockUser(user.id)
      : this.adminService.blockUser(user.id);
    action.subscribe(() => {
      this.loadData();
      this.cdr.markForCheck();
    });
  }

  exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('FinTrack — User Activity Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    autoTable(doc, {
      startY: 38,
      head: [['Name', 'Email', 'Role', 'Status', 'Joined']],
      body: this.users.map(u => [
        u.name, u.email, u.role,
        u.blocked ? 'Blocked' : 'Active',
        u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'
      ]),
      headStyles: { fillColor: [15, 76, 92] },
      alternateRowStyles: { fillColor: [240, 253, 250] },
      styles: { fontSize: 10 }
    });
    doc.save('fintrack-user-report.pdf');
  }

  exportExcel() {
    const data = this.users.map(u => ({
      'Name': u.name,
      'Email': u.email,
      'Role': u.role,
      'Status': u.blocked ? 'Blocked' : 'Active',
      'Joined': u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    ws['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 15 }];
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'fintrack-users.xlsx');
  }

  formatDate(dateVal: any): string {
    if (!dateVal) return '—';
    try {
      if (Array.isArray(dateVal)) {
        const [year, month, day, hours, minutes, seconds] = dateVal;
        const date = new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, seconds || 0);
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      }
      const parsed = new Date(dateVal);
      if (isNaN(parsed.getTime())) {
        return '—';
      }
      return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '—';
    }
  }

  goBack() { this.router.navigate(['/dashboard']); }
}