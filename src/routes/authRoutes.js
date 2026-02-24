import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { login, logout, getCurrentUser } from '../controllers/authController.js';

const router = express.Router();

// Login
router.post('/login', login);

// Logout (requiere autenticación)
router.post('/logout', authMiddleware, logout);

// Obtener usuario actual (requiere autenticación)
router.get('/me', authMiddleware, getCurrentUser);

export default router;
