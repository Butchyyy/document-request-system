import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  // Document types
  getDocumentTypes,
  getDocumentTypeById,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
  // Document requests
  createDocumentRequest,
  getDocumentRequests,
  getDocumentRequestById,
  uploadSupportingFile,
  updateRequestStatus,
  deleteDocumentRequest,
} from '../controllers/document.controller';

const router = Router();

// ── Document Types ─────────────────────────────────────────────────────────
// Public (any authenticated user can browse)
router.get('/types', authenticateToken, getDocumentTypes);
router.get('/types/:id', authenticateToken, getDocumentTypeById);

// Admin only — manage document types
router.post('/types', authenticateToken, authorize('admin'), createDocumentType);
router.put('/types/:id', authenticateToken, authorize('admin'), updateDocumentType);
router.delete('/types/:id', authenticateToken, authorize('admin'), deleteDocumentType);

// ── Document Requests ──────────────────────────────────────────────────────
// Users submit & view their own; admin views all
router.post('/requests', authenticateToken, authorize('user', 'admin'), createDocumentRequest);
router.get('/requests', authenticateToken, getDocumentRequests);
router.get('/requests/:id', authenticateToken, getDocumentRequestById);

// File upload — request owner only (user or admin)
router.post('/requests/:id/upload', authenticateToken, authorize('user', 'admin'), upload.single('file'), uploadSupportingFile);

// Admin only — status update & delete
router.patch('/requests/:id/status', authenticateToken, authorize('admin'), updateRequestStatus);
router.delete('/requests/:id', authenticateToken, authorize('admin'), deleteDocumentRequest);

export default router;