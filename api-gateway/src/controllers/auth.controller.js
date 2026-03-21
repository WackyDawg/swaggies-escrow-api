import { authClient } from '../clients/auth.client.js'
import httpStatus from 'http-status';

export class authController {
    constructor(Auth = authClient) {
        this.Auth = new Auth()
    }
    
    async createUser(data) {
        try {
            const user = await this.Auth.create(data)
            return user;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async verifyUser(verificationToken) {
        try {
            const user = await this.Auth.verifyUser(verificationToken)
            return user;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async Login(data) {
        try {
            const user = await this.Auth.Login(data)
            return user;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async Logout(data) {
        try {
            const user = await this.Auth.Logout(data)
            return user;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async forgotPassword(data) {
        try {
            const user = await this.Auth.forgotPassword(data)
            return user;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async resetPassword(data) {
        try {
          const user = await this.Auth.resetPassword(data)
          return user;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }
 
    async getProfile(authorization) {
        try {
            const user = await this.Auth.getProfile(authorization)
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
          const user = await this.Auth.updateProfile(authorization, data)
          return user;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

     
}