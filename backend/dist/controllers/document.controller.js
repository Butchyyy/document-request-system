"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocumentRequest = exports.updateRequestStatus = exports.uploadSupportingFile = exports.getDocumentRequestById = exports.getDocumentRequests = exports.createDocumentRequest = exports.deleteDocumentType = exports.updateDocumentType = exports.createDocumentType = exports.getDocumentTypeById = exports.getDocumentTypes = void 0;
const firebase_1 = require("../config/firebase");
// ─── Document Types ────────────────────────────────────────────────────────
const getDocumentTypes = async (req, res, next) => {
    try {
        const snapshot = await firebase_1.db.collection('document_types').orderBy('name').get();
        const types = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.json({ types });
    }
    catch (error) {
        next(error);
    }
};
exports.getDocumentTypes = getDocumentTypes;
const getDocumentTypeById = async (req, res, next) => {
    try {
        const doc = await firebase_1.db.collection('document_types').doc(req.params.id).get();
        if (!doc.exists)
            return res.status(404).json({ message: 'Document type not found' });
        res.json({ type: { id: doc.id, ...doc.data() } });
    }
    catch (error) {
        next(error);
    }
};
exports.getDocumentTypeById = getDocumentTypeById;
const createDocumentType = async (req, res, next) => {
    const { name, description, fee, processingDays, requirements } = req.body;
    const feeValue = Number(fee);
    const daysValue = Number(processingDays);
    if (!name || isNaN(feeValue) || isNaN(daysValue) || feeValue <= 0 || daysValue <= 0) {
        return res.status(400).json({ message: 'name, fee, and processingDays are required and must be positive numbers' });
    }
    try {
        const ref = await firebase_1.db.collection('document_types').add({
            name,
            description: description || '',
            fee: feeValue,
            processingDays: daysValue,
            requirements: Array.isArray(requirements) ? requirements : [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        res.status(201).json({ message: 'Document type created', id: ref.id });
    }
    catch (error) {
        next(error);
    }
};
exports.createDocumentType = createDocumentType;
const updateDocumentType = async (req, res, next) => {
    const { name, description, fee, processingDays, requirements } = req.body;
    try {
        const doc = await firebase_1.db.collection('document_types').doc(req.params.id).get();
        if (!doc.exists)
            return res.status(404).json({ message: 'Document type not found' });
        const updates = { updatedAt: new Date().toISOString() };
        if (name !== undefined)
            updates.name = name;
        if (description !== undefined)
            updates.description = description;
        if (fee !== undefined)
            updates.fee = Number(fee);
        if (processingDays !== undefined)
            updates.processingDays = Number(processingDays);
        if (requirements !== undefined)
            updates.requirements = requirements;
        await firebase_1.db.collection('document_types').doc(req.params.id).update(updates);
        res.json({ message: 'Document type updated' });
    }
    catch (error) {
        next(error);
    }
};
exports.updateDocumentType = updateDocumentType;
const deleteDocumentType = async (req, res, next) => {
    try {
        const doc = await firebase_1.db.collection('document_types').doc(req.params.id).get();
        if (!doc.exists)
            return res.status(404).json({ message: 'Document type not found' });
        await firebase_1.db.collection('document_types').doc(req.params.id).delete();
        res.json({ message: 'Document type deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDocumentType = deleteDocumentType;
// ─── Document Requests ─────────────────────────────────────────────────────
const createDocumentRequest = async (req, res, next) => {
    const { documentTypeId, purpose, quantity } = req.body;
    if (!documentTypeId || !purpose) {
        return res.status(400).json({ message: 'documentTypeId and purpose are required' });
    }
    try {
        const typeDoc = await firebase_1.db.collection('document_types').doc(documentTypeId).get();
        if (!typeDoc.exists) {
            return res.status(404).json({ message: 'Document type not found' });
        }
        const typeData = typeDoc.data();
        const requestData = {
            userId: req.user.id,
            userName: req.user.name,
            userEmail: req.user.email,
            documentTypeId,
            documentTypeName: typeData.name,
            purpose,
            quantity: Number(quantity) || 1,
            fee: typeData.fee,
            status: 'pending',
            fileUrl: null,
            fileName: null,
            adminNote: '',
            requestDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const docRef = await firebase_1.db.collection('document_requests').add(requestData);
        res.status(201).json({
            message: 'Document request submitted successfully',
            request: { id: docRef.id, ...requestData },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createDocumentRequest = createDocumentRequest;
const getDocumentRequests = async (req, res, next) => {
    try {
        const { status, documentTypeId, page = '1', limit = '10' } = req.query;
        const pageNumber = Math.max(1, Number(page) || 1);
        const pageLimit = Math.max(1, Number(limit) || 10);
        let query = firebase_1.db.collection('document_requests');
        if (req.user.role !== 'admin') {
            query = query.where('userId', '==', req.user.id);
        }
        if (status)
            query = query.where('status', '==', status);
        if (documentTypeId)
            query = query.where('documentTypeId', '==', documentTypeId);
        const snapshot = await query.get();
        const allDocuments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const sortedDocuments = allDocuments.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
        const totalItems = sortedDocuments.length;
        const start = (pageNumber - 1) * pageLimit;
        const pagedDocuments = sortedDocuments.slice(start, start + pageLimit);
        res.json({
            documents: pagedDocuments,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.max(1, Math.ceil(totalItems / pageLimit)),
                totalItems,
                itemsPerPage: pageLimit,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDocumentRequests = getDocumentRequests;
const getDocumentRequestById = async (req, res, next) => {
    try {
        const doc = await firebase_1.db.collection('document_requests').doc(req.params.id).get();
        if (!doc.exists)
            return res.status(404).json({ message: 'Request not found' });
        const document = { id: doc.id, ...doc.data() };
        if (req.user.role !== 'admin' && document.userId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }
        res.json({ document });
    }
    catch (error) {
        next(error);
    }
};
exports.getDocumentRequestById = getDocumentRequestById;
const uploadSupportingFile = async (req, res, next) => {
    try {
        if (!req.file)
            return res.status(400).json({ message: 'No file uploaded' });
        const doc = await firebase_1.db.collection('document_requests').doc(req.params.id).get();
        if (!doc.exists)
            return res.status(404).json({ message: 'Request not found' });
        const document = doc.data();
        if (document.userId !== req.user.id) {
            return res.status(403).json({ message: 'You can only upload files for your own requests' });
        }
        if (document.status !== 'pending') {
            return res.status(400).json({ message: 'Cannot upload file for a non-pending request' });
        }
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        await firebase_1.db.collection('document_requests').doc(req.params.id).update({
            fileUrl,
            fileName: req.file.originalname,
            updatedAt: new Date().toISOString(),
        });
        res.json({ message: 'File uploaded successfully', fileUrl, fileName: req.file.originalname });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadSupportingFile = uploadSupportingFile;
const updateRequestStatus = async (req, res, next) => {
    const { status, adminNote } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected', 'processing', 'completed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }
    try {
        const doc = await firebase_1.db.collection('document_requests').doc(req.params.id).get();
        if (!doc.exists)
            return res.status(404).json({ message: 'Request not found' });
        await firebase_1.db.collection('document_requests').doc(req.params.id).update({
            status,
            adminNote: adminNote || '',
            updatedAt: new Date().toISOString(),
            ...(status === 'completed' && { completedDate: new Date().toISOString() }),
        });
        res.json({ message: `Request status updated to ${status}` });
    }
    catch (error) {
        next(error);
    }
};
exports.updateRequestStatus = updateRequestStatus;
const deleteDocumentRequest = async (req, res, next) => {
    try {
        const doc = await firebase_1.db.collection('document_requests').doc(req.params.id).get();
        if (!doc.exists)
            return res.status(404).json({ message: 'Request not found' });
        await firebase_1.db.collection('document_requests').doc(req.params.id).delete();
        res.json({ message: 'Request deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDocumentRequest = deleteDocumentRequest;
