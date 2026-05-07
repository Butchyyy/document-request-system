"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const firebase_1 = require("../config/firebase");
const register = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const { email, password, name, role, adminSecret } = req.body;
    // Validate requested role
    const requestedRole = role === 'admin' ? 'admin' : 'user';
    // Guard: admin registration requires a matching secret
    if (requestedRole === 'admin') {
        const expectedSecret = process.env.ADMIN_REGISTRATION_SECRET;
        if (!expectedSecret || adminSecret !== expectedSecret) {
            return res.status(403).json({ message: 'Invalid admin registration secret.' });
        }
    }
    try {
        const userExists = await firebase_1.db.collection('users').where('email', '==', email).get();
        if (!userExists.empty)
            return res.status(400).json({ message: 'User already exists' });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const userData = {
            email,
            name,
            role: requestedRole,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const userRef = await firebase_1.db.collection('users').add(userData);
        const token = jsonwebtoken_1.default.sign({ userId: userRef.id, email, role: requestedRole }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            message: 'Registration successful',
            token,
            user: { id: userRef.id, email, name, role: requestedRole },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    try {
        const userQuery = await firebase_1.db.collection('users').where('email', '==', email).limit(1).get();
        if (userQuery.empty)
            return res.status(401).json({ message: 'Invalid credentials' });
        const userDoc = userQuery.docs[0];
        const user = { id: userDoc.id, ...userDoc.data() };
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid)
            return res.status(401).json({ message: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const { password, ...safeUser } = req.user;
        res.json({ user: safeUser });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    const { name } = req.body;
    try {
        await firebase_1.db.collection('users').doc(req.user.id).update({
            name,
            updatedAt: new Date().toISOString(),
        });
        res.json({ message: 'Profile updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateProfile = updateProfile;
