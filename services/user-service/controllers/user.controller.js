import UserService from "../services/user.service.js";

const userServiceInstance = new UserService();

export class userController {
    constructor(userService = userServiceInstance) {
        this.userService = userService;
    }

    async getProfile(req, res) {
        try {
            const userId = req.userId;
            const user = await this.userService.getProfile(userId);
            res.status(200).json(user);
        } catch (error) {
            res.status(error.statusCode || 400).json({ message: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const userId = req.userId;
            const settingsData = req.body;
            const user = await this.userService.updateProfile(userId, settingsData);
            res.status(200).json(user);
        } catch (error) {
            // console.error(error)
            res.status(error.statusCode || 400).json({ message: error.message });
        }
    }

    async changePin(req, res) {
        try {
            const userId = req.userId;
            const data = req.body;
            const result = await this.userService.changePin(userId, data);
            res.status(result.statusCode || 200).json(result);
        } catch (error) {
            res.status(error.statusCode || 400).json({ message: error.message, data: error.data });
        }
    }

    async findUserByPocketId(req, res) {
        try {
            const { swag_id } = req.params;
            const user = await this.userService.getUserByPocketId(swag_id);
            res.status(user.statusCode || 200).json(user);
        } catch (error) {
            res.status(error.statusCode || 400).json({ message: error.message });
        }
    }
}