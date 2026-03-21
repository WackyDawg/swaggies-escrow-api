import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { AuthMiddleware } from "@pocket/shared";

const userRoutes = express.Router(); 
const userControllerInstance = new userController();
const authMiddlewareInstance = new AuthMiddleware();

userRoutes.patch('/account-update', (req, res, next) => authMiddlewareInstance.verifyToken(req, res, next), (req, res) => userControllerInstance.updateProfile(req, res));
userRoutes.get('/account', (req, res, next) => authMiddlewareInstance.verifyToken(req, res, next), (req, res) => userControllerInstance.getProfile(req, res));
userRoutes.post('/change-pin', (req, res, next) => authMiddlewareInstance.verifyToken(req, res, next), (req, res) => userControllerInstance.changePin(req, res));
userRoutes.get('/find-user-by-pocket-id/:swag_id', (req, res, next) => authMiddlewareInstance.verifyToken(req, res, next), (req, res) => userControllerInstance.findUserByPocketId(req, res));

export default userRoutes;