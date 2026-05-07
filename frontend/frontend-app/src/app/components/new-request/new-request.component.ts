import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DocumentService, DocumentType } from '../../services/document.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-new-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './new-request.component.html',
})
export class NewRequestComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';
  selectedFile: File | null = null;
  documentTypes: DocumentType[] = [];
  selectedType: DocumentType | null = null;

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      documentTypeId: ['', Validators.required],
      purpose: ['', [Validators.required, Validators.minLength(10)]],
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    });
  }

  ngOnInit(): void {
    this.documentService.getDocumentTypes().subscribe({
      next: (res) => {
        this.documentTypes = res.types;
        // Pre-select if typeId is in query params
        const typeId = this.route.snapshot.queryParamMap.get('typeId');
        if (typeId) {
          this.form.patchValue({ documentTypeId: typeId });
          this.onTypeChange();
        }
      },
    });
  }

  onTypeChange(): void {
    const id = this.form.get('documentTypeId')?.value;
    this.selectedType = this.documentTypes.find(t => t.id === id) || null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'File size must be less than 5MB.';
        return;
      }
      this.selectedFile = file;
      this.errorMessage = '';
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading = true;
    this.errorMessage = '';

    this.documentService.createRequest(this.form.value).subscribe({
      next: (res) => {
        const requestId = res.request?.id;
        if (this.selectedFile && requestId) {
          this.documentService.uploadFile(requestId, this.selectedFile).subscribe({
            next: () => this.router.navigate(['/requests']),
            error: () => this.router.navigate(['/requests']),
          });
        } else {
          this.router.navigate(['/requests']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to submit request.';
        this.isLoading = false;
      },
    });
  }
}