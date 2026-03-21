import axios from 'axios';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://127.0.0.1:3002";

export class userClient {
    constructor() {
    }

    async getUserProfile(authorization) {
        try {
            const response = await axios.get(`${USER_SERVICE_URL}/api/v1/users/account`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authorization
                    }
                }
            );
            const statusCode = response.data?.statusCode ?? response.status;
            return { ...response.data, statusCode };
        } catch (error) {
            throw {
                message: error.response?.data?.message || error.message || 'REQUEST_FAILED',
                statusCode: error.response?.status
            };
        }
    }

    async updateUSerProfile(authorization, data) {
        try {
            const updateRes = await axios.patch(`${USER_SERVICE_URL}/api/v1/users/account-update`, data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authorization
                    }
                }
            )
            const statusCode = updateRes.data?.statusCode ?? updateRes.status;
            return { ...updateRes.data, statusCode };
        } catch (error) {
            throw {
                message: error.response?.data?.message || error.message || 'REQUEST_FAILED',
                statusCode: error.response?.status
            };
        }
    }

    async changeUserPin(authorization, data) {
        try {
            const response = await axios.post(`${USER_SERVICE_URL}/api/v1/users/change-pin`, data,
                {
                    headers: {
                        'Content-Type': "application/json",
                        'Authorization': authorization
                    }
                }
            )
            const statusCode = response.data?.statusCode ?? response.status;
            return { ...response.data, statusCode }
        } catch (error) {
            throw {
                message: error.response?.data?.message || error.message || 'REQUEST_FAILED',
                statusCode: error.response?.status
            }
        }
    }

}
