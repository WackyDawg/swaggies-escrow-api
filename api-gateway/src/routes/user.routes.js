import express from 'express';
import { userController } from '../controllers/user.controller.js'

const userControllerInstance = new userController()

const userRouter = express.Router()

userRouter.get('/auth-account', async (req, res) => {
    try {
        const result = await userControllerInstance.getProfile(req.headers.authorization);
        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
})

userRouter.patch('/auth-update-profile', async (req, res) => {
  try {
    const result = await userControllerInstance.updateProfile(req.headers.authorization, req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

userRouter.post('/auth-set-pin', async (req, res) => {
    try {
        const response = await userControllerInstance.changeUserPin(req.headers.authorization, req.body);
        res.status(response.statusCode).json(response)
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
})

export default userRouter;