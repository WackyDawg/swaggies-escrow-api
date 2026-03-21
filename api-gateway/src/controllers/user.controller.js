import { userClient } from '../clients/user.client.js';
import httpStatus from 'http-status';

export class userController {
    constructor(User = userClient) {
        this.User = new User();
    }

    async getProfile(authorization) {
        try {
            const user = await this.User.getUserProfile(authorization)
            return user;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async updateProfile(authorization, data) {
        try {
            const updateRes = await this.User.updateUSerProfile(authorization, data)
            return updateRes;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async changeUserPin(authorization, data) {
        try {
            const updateRes = await this.User.changeUserPin(authorization, data)
            return updateRes;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }


}