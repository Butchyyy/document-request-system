import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DocumentService, DocumentRequest } from '../../services/document.service';
import { AuthService } from '../../services/auth.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './document-list.component.html',
})
export class DocumentListComponent implements OnInit {
  documents: DocumentRequest[] = [];
  isLoading = true;
  errorMessage = '';
  statusFilter = '';
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;

  private searchSubject = new Subject<string>();

  statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: '⏳ Pending' },
    { value: 'approved', label: '✅ Approved' },
    { value: 'processing', label: '🔄 Processing' },
    { value: 'completed', label: '🎉 Completed' },
    { value: 'rejected', label: '❌ Rejected' },
  ];

  constructor(
    private documentService: DocumentService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.load();
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.currentPage = 1;
      this.load();
    });
  }

  load(): void {
    this.isLoading = true;
    this.documentService.getRequests({
      status: this.statusFilter || undefined,
      page: this.currentPage,
      limit: this.itemsPerPage,
    }).subscribe({
      next: (res: { documents: DocumentRequest[]; pagination: any }) => {
        this.documents = res.documents || [];
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

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.load();
  }

  getStatusClass(s: string): string {
    const m: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800',
    };
    return m[s] || 'bg-gray-100 text-gray-800';
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}