"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserRole = exports.getUserById = exports.getAllUsers = void 0;
const firebase_1 = require("../config/firebase");
const getAllUsers = async (req, res) => {
    try {
        const snapshot = await firebase_1.db.collection('users').get();
        const users = snapshot.docs.map(doc => {
            const data = doc.data();
            delete data.password;
            return { id: doc.id, ...data };
        });
        res.json({ users });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const userDoc = await firebase_1.db.collection('users').doc(req.params.id).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = userDoc.data();
        delete user?.password;
        res.json({ user: { id: userDoc.id, ...user } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getUserById = getUserById;
const updateUserRole = async (req, res) => {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }
    try {
        await firebase_1.db.collection('users').doc(req.params.id).update({
            role,
            updatedAt: new Date().toISOString(),
        });
        res.json({ message: 'User role updated successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateUserRole = updateUserRole;
const deleteUser = async (req, res) => {
    try {
        await firebase_1.db.collection('users').doc(req.params.id).delete();
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteUser = deleteUser;
