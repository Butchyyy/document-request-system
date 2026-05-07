import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DocumentService, DocumentRequest } from '../../services/document.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './document-detail.component.html',
})
export class DocumentDetailComponent implements OnInit {
  document: DocumentRequest | null = null;
  isLoading = true;
  errorMessage = '';
  selectedFile: File | null = null;
  uploadLoading = false;
  uploadSuccess = '';

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.documentService.getRequestById(id).subscribe({
      next: (res) => { this.document = res.document; this.isLoading = false; },
      error: () => { this.errorMessage = 'Request not found.'; this.isLoading = false; },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      if (input.files[0].size > 5 * 1024 * 1024) { this.errorMessage = 'File too large (max 5MB).'; return; }
      this.selectedFile = input.files[0];
    }
  }

  uploadFile(): void {
    if (!this.selectedFile || !this.document) return;
    this.uploadLoading = true;
    this.documentService.uploadFile(this.document.id, this.selectedFile).subscribe({
      next: (res) => {
        this.document!.fileUrl = res.fileUrl;
        this.document!.fileName = res.fileName;
        this.uploadSuccess = 'File uploaded successfully!';
        this.uploadLoading = false;
      },
      error: () => { this.errorMessage = 'Upload failed.'; this.uploadLoading = false; },
    });
  }

  getStatusClass(s: string): string {
    const m: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800', processing: 'bg-blue-100 text-blue-800', completed: 'bg-purple-100 text-purple-800',
    };
    return m[s] || 'bg-gray-100 text-gray-800';
  }

  getStatusBannerClass(status: string): string {
  const map: Record<string, string> = {
    pending:    'bg-amber-50 border-amber-300 text-amber-900',
    approved:   'bg-green-50 border-green-300 text-green-900',
    rejected:   'bg-red-50 border-red-300 text-red-900',
    processing: 'bg-blue-50 border-blue-300 text-blue-900',
    completed:  'bg-purple-50 border-purple-300 text-purple-900',
  };
  return map[status] || 'bg-gray-50 border-gray-200 text-gray-800';
}
}