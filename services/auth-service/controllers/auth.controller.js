import requestIp from "request-ip";
import AuthService from "../services/auth.service.js"

const authServiceInstance = new AuthService();

export class authController {
    constructor(authService = authServiceInstance) {
        this.authService = authService;
    }

    async createUser(req, res) {
        try {
            const { email, password, name, swag_id, bvn, dateOfBirth, phone_number } = req.body;
            const userIp = requestIp.getClientIp(req);
            const user = await this.authService.createUser(email, password, name, swag_id, bvn, dateOfBirth, userIp, phone_number);
            res.status(201).json(user);
        } catch (error) {
            res.status(error.statusCode || 400).json({ message: error.message, code: error.code });
        }
    }

    async verifyAccount(req, res) {
        try {
            const { code } = req.body;
            const user = await this.authService.verifyUser(code);
            res.status(200).json(user);
        } catch (error) {
            res.status(error.statusCode || 400).json({ message: error.message, code: error.code });
        }
    }

    async loginUser(req, res) {
        try {
            const { email, password } = req.body;
            const user = await this.authService.loginUser(email, password, res);
            res.status(200).json(user);
        } catch (error) {
            res.status(error.statusCode || 400).json({ message: error.message, code: error.code });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const user = await this.authService.forgotPassword(email);
            res.status(200).json(user);
        } catch (error) {
            res.status(error.statusCode || 400).json({ message: error.message, code: error.code });
        }
    }

    async resetPassword(req, res) {
        try {
            const { resetToken, password } = req.body;
            const result = await this.authService.resetPassword(resetToken, password);
            
            res.status(result.statusCode || 200).json({
                success: result.success,
                message: result.message
            });
        } catch (error) {
            res.status(error.statusCode || 400).json({ message: error.message, code: error.code });
        }
    }

    async changePassword(req, res) {
        try {
            const { email, password } = req.body;
            const user = await this.authService.changePassword(email, password);
            res.status(200).json(user);
        } catch (error) {
            res.status(error.statusCode || 400).json({ message: error.message, code: error.code });
        }
    }

    async updateProfile(req, res) {
        try {
          const updateData = req.body;
          const userId = req.userId;
          const user = await this.authService.updateProfile(userId, updateData);
          res.status(200).json(user);
        } catch (error) {
            res.status(error.statusCode || 400).json({ message: error.message, code: error.code });
        }
    }

    async getProfile(req, res) {
        try {
            const userId = req.userId;
            const user = await this.authService.getProfile(userId);
            res.status(200).json(user);
        } catch (error) {
            res.status(error.statusCode || 400).json({ message: error.message, code: error.code });
        }
    }

    async Logout(req, res) {
        try {
            const { id } = req.params;
            const user = await this.authService.Logout(id);
            res.status(200).json(user);
        } catch (error) {
            res.status(error.statusCode || 400).json({ message: error.message, code: error.code });
        }
    }

}