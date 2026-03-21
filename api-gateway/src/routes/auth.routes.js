import express from 'express';
import { authController } from '../controllers/auth.controller.js';

const authRouter = express.Router();
const authControllerInstance = new authController();

authRouter.post('/auth-register', async (req, res) => {
  try {
    const result = await authControllerInstance.createUser(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

authRouter.post('/auth-verify', async (req, res) => {
  try {
    const result = await authControllerInstance.verifyUser(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

authRouter.post('/auth-login', async (req, res) => {
  try {
    const result = await authControllerInstance.Login(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

authRouter.post('/auth-logout', async (req, res) => {
  try {
    const result = await authControllerInstance.Logout(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

authRouter.post('/auth-forgot-pasword', async (req, res) => {
  try {
    const result = await authControllerInstance.forgotPassword(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
})

authRouter.post('/auth-reset-password', async (req, res) => {
  try {
    const result = await authControllerInstance.resetPassword(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
})

export default authRouter;