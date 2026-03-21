import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const userRoutes = express.Router();
const authControllerInstance = new authController();
const authMiddlewareInstance = new AuthMiddleware();

userRoutes.post('/register', (req, res) => authControllerInstance.createUser(req, res));
userRoutes.post('/verify-account', (req, res) => authControllerInstance.verifyAccount(req, res));
userRoutes.post('/login', (req, res) => authControllerInstance.loginUser(req, res));
userRoutes.post('/logout', (req, res) => authControllerInstance.Logout(req, res));
userRoutes.post('/forgot-password', (req, res) => authControllerInstance.forgotPassword(req, res));
userRoutes.post('/reset-password', (req, res) => authControllerInstance.resetPassword(req, res));
userRoutes.patch('/account-update', (req, res, next) => authMiddlewareInstance.verifyToken(req, res, next), (req, res) => authControllerInstance.updateProfile(req, res));
userRoutes.get('/account', (req, res, next) => authMiddlewareInstance.verifyToken(req, res, next), (req, res) => authControllerInstance.getProfile(req, res));

export default userRoutes;