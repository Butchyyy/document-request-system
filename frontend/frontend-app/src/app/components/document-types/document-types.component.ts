import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DocumentService, DocumentType } from '../../services/document.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-document-types',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './document-types.component.html',
})
export class DocumentTypesComponent implements OnInit {
  types: DocumentType[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private documentService: DocumentService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.documentService.getDocumentTypes().subscribe({
      next: (res) => { this.types = res.types; this.isLoading = false; },
      error: () => { this.errorMessage = 'Failed to load document types.'; this.isLoading = false; },
    });
  }

  requestDocument(typeId: string): void {
    this.router.navigate(['/requests/new'], { queryParams: { typeId } });
  }
}