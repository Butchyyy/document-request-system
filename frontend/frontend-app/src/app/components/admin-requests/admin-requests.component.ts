import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DocumentService, DocumentRequest } from '../../services/document.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-requests.component.html',
})
export class AdminRequestsComponent implements OnInit {
  requests: DocumentRequest[] = [];
  isLoading = true;
  errorMessage = '';
  statusFilter = '';
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;

  // For inline approve/reject modal
  selectedRequest: DocumentRequest | null = null;
  adminNote = '';
  actionLoading = false;
  actionSuccess = '';

  statuses = [
    { value: '', label: 'All' },
    { value: 'pending', label: '⏳ Pending' },
    { value: 'approved', label: '✅ Approved' },
    { value: 'processing', label: '🔄 Processing' },
    { value: 'completed', label: '🎉 Completed' },
    { value: 'rejected', label: '❌ Rejected' },
  ];

  constructor(private documentService: DocumentService, public authService: AuthService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.documentService.getRequests({
      status: this.statusFilter || undefined,
      page: this.currentPage,
      limit: this.itemsPerPage,
    }).subscribe({
      next: (res) => {
        this.requests = res.documents || [];
        this.totalPages = res.pagination?.totalPages || 1;
        this.totalItems = res.pagination?.totalItems || 0;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load requests.';
        this.isLoading = false;
      },
    });
  }

  onFilterChange(): void { this.currentPage = 1; this.load(); }
  goToPage(p: number): void { if (p < 1 || p > this.totalPages) return; this.currentPage = p; this.load(); }

  openAction(request: DocumentRequest): void {
    this.selectedRequest = request;
    this.adminNote = request.adminNote || '';
    this.actionSuccess = '';
  }

  closeAction(): void { this.selectedRequest = null; this.adminNote = ''; }

  updateStatus(status: string): void {
    if (!this.selectedRequest) return;
    this.actionLoading = true;
    this.documentService.updateRequestStatus(this.selectedRequest.id, status, this.adminNote).subscribe({
      next: () => {
        this.selectedRequest!.status = status as any;
        this.selectedRequest!.adminNote = this.adminNote;
        this.actionSuccess = `Status updated to ${status}`;
        this.actionLoading = false;
        this.load(); // refresh list
      },
      error: () => { this.actionLoading = false; },
    });
  }

  deleteRequest(id: string): void {
    if (!confirm('Delete this request permanently?')) return;
    this.documentService.deleteRequest(id).subscribe({
      next: () => this.load(),
      error: () => alert('Delete failed.'),
    });
  }

  getStatusClass(s: string): string {
    const m: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800', processing: 'bg-blue-100 text-blue-800', completed: 'bg-purple-100 text-purple-800',
    };
    return m[s] || 'bg-gray-100 text-gray-800';
  }

  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
}