import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  fee: number;
  processingDays: number;
  requirements: string[];
}

export interface DocumentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  documentTypeId: string;
  documentTypeName: string;
  purpose: string;
  quantity: number;
  fee: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  fileUrl: string | null;
  fileName: string | null;
  adminNote: string;
  requestDate: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  getDocumentTypes(): Observable<{ types: DocumentType[] }> {
    return this.http.get<{ types: DocumentType[] }>(`${this.apiUrl}/types`);
  }

  getDocumentTypeById(id: string): Observable<{ type: DocumentType }> {
    return this.http.get<{ type: DocumentType }>(`${this.apiUrl}/types/${id}`);
  }

  createDocumentType(data: Partial<DocumentType>): Observable<any> {
    return this.http.post(`${this.apiUrl}/types`, data);
  }

  updateDocumentType(id: string, data: Partial<DocumentType>): Observable<any> {
    return this.http.put(`${this.apiUrl}/types/${id}`, data);
  }

  deleteDocumentType(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/types/${id}`);
  }

  getRequests(filters?: {
    status?: string;
    documentTypeId?: string;
    page?: number;
    limit?: number;
  }): Observable<{ documents: DocumentRequest[]; pagination: any }> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.documentTypeId) params = params.set('documentTypeId', filters.documentTypeId);
    if (filters?.page) params = params.set('page', filters.page.toString());
    if (filters?.limit) params = params.set('limit', filters.limit.toString());
    return this.http.get<{ documents: DocumentRequest[]; pagination: any }>(
      `${this.apiUrl}/requests`, { params }
    );
  }

  getRequestById(id: string): Observable<{ document: DocumentRequest }> {
    return this.http.get<{ document: DocumentRequest }>(`${this.apiUrl}/requests/${id}`);
  }

  createRequest(data: { documentTypeId: string; purpose: string; quantity: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/requests`, data);
  }

  uploadFile(requestId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/requests/${requestId}/upload`, formData);
  }

  updateRequestStatus(id: string, status: string, adminNote: string = ''): Observable<any> {
    return this.http.patch(`${this.apiUrl}/requests/${id}/status`, { status, adminNote });
  }

  deleteRequest(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/requests/${id}`);
  }
}