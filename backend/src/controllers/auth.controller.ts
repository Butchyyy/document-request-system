import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { db } from '../config/firebase';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, name, role, adminSecret } = req.body;

  // Validate requested role
  const requestedRole: 'user' | 'admin' = role === 'admin' ? 'admin' : 'user';

  // Guard: admin registration requires a matching secret
  if (requestedRole === 'admin') {
    const expectedSecret = process.env.ADMIN_REGISTRATION_SECRET;
    if (!expectedSecret || adminSecret !== expectedSecret) {
      return res.status(403).json({ message: 'Invalid admin registration secret.' });
    }
  }

  try {
    const userExists = await db.collection('users').where('email', '==', email).get();
    if (!userExists.empty) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      email,
      name,
      role: requestedRole,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const userRef = await db.collection('users').add(userData);
    const token = jwt.sign(
      { userId: userRef.id, email, role: requestedRole },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: userRef.id, email, name, role: requestedRole },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const userQuery = await db.collection('users').where('email', '==', email).limit(1).get();
    if (userQuery.empty) return res.status(401).json({ message: 'Invalid credentials' });

    const userDoc = userQuery.docs[0];
    const user = { id: userDoc.id, ...(userDoc.data() as any) };

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { password, ...safeUser } = req.user;
    res.json({ user: safeUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  try {
    await db.collection('users').doc(req.user.id).update({
      name,
      updatedAt: new Date().toISOString(),
    });
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};