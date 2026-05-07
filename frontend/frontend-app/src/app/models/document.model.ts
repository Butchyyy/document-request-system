export interface DocumentRequest {
  id?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  title: string;
  description?: string;
  type: 'birth_certificate' | 'marriage_certificate' | 'barangay_clearance' | 'police_clearance' | 'others';
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  fileUrl?: string;
  fileName?: string;
  requestDate?: string;
  updatedAt?: string;
  completedDate?: string;
  adminNotes?: string;
}

export interface DocumentResponse {
  message?: string;
  document?: DocumentRequest;
  documents?: DocumentRequest[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CreateDocumentRequest {
  title: string;
  description?: string;
  type: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  description?: string;
  type?: string;
}

export interface UpdateStatusRequest {
  status: string;
  adminNotes?: string;
}

export interface FileUploadResponse {
  message: string;
  fileUrl: string;
  fileName: string;
}