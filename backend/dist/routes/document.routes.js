"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const document_controller_1 = require("../controllers/document.controller");
const router = (0, express_1.Router)();
// ── Document Types ─────────────────────────────────────────────────────────
// Public (any authenticated user can browse)
router.get('/types', auth_1.authenticateToken, document_controller_1.getDocumentTypes);
router.get('/types/:id', auth_1.authenticateToken, document_controller_1.getDocumentTypeById);
// Admin only — manage document types
router.post('/types', auth_1.authenticateToken, (0, auth_1.authorize)('admin'), document_controller_1.createDocumentType);
router.put('/types/:id', auth_1.authenticateToken, (0, auth_1.authorize)('admin'), document_controller_1.updateDocumentType);
router.delete('/types/:id', auth_1.authenticateToken, (0, auth_1.authorize)('admin'), document_controller_1.deleteDocumentType);
// ── Document Requests ──────────────────────────────────────────────────────
// Users submit & view their own; admin views all
router.post('/requests', auth_1.authenticateToken, (0, auth_1.authorize)('user', 'admin'), document_controller_1.createDocumentRequest);
router.get('/requests', auth_1.authenticateToken, document_controller_1.getDocumentRequests);
router.get('/requests/:id', auth_1.authenticateToken, document_controller_1.getDocumentRequestById);
// File upload — request owner only (user or admin)
router.post('/requests/:id/upload', auth_1.authenticateToken, (0, auth_1.authorize)('user', 'admin'), upload_1.upload.single('file'), document_controller_1.uploadSupportingFile);
// Admin only — status update & delete
router.patch('/requests/:id/status', auth_1.authenticateToken, (0, auth_1.authorize)('admin'), document_controller_1.updateRequestStatus);
router.delete('/requests/:id', auth_1.authenticateToken, (0, auth_1.authorize)('admin'), document_controller_1.deleteDocumentRequest);
exports.default = router;
