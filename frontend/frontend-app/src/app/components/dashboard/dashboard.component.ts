import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DocumentService, DocumentRequest } from '../../services/document.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  recentRequests: DocumentRequest[] = [];
  stats = { total: 0, pending: 0, approved: 0, rejected: 0, processing: 0, completed: 0 };
  isLoading = true;

  constructor(public authService: AuthService, private documentService: DocumentService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.documentService.getRequests({ limit: 5 }).subscribe({
      next: (res) => {
        this.recentRequests = res.documents || [];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });

    this.documentService.getRequests({ limit: 1000 }).subscribe({
      next: (res) => {
        const docs = res.documents || [];
        this.stats.total = docs.length;
        this.stats.pending = docs.filter(d => d.status === 'pending').length;
        this.stats.approved = docs.filter(d => d.status === 'approved').length;
        this.stats.rejected = docs.filter(d => d.status === 'rejected').length;
        this.stats.processing = docs.filter(d => d.status === 'processing').length;
        this.stats.completed = docs.filter(d => d.status === 'completed').length;
      },
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      pending: '⏳', approved: '✅', rejected: '❌', processing: '🔄', completed: '🎉',
    };
    return map[status] || '📄';
  }
}