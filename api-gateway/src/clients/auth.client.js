import axios from "axios"

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://127.0.0.1:3001";

export class authClient {
  constructor() { }

  async create(data) {
    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/api/v1/users/register`, data);
      const statusCode = response.data?.statusCode ?? response.status;
      return { ...response.data, statusCode };
    } catch (error) {
      throw {
        message: error.response?.data?.message || error.message || 'Request failed',
        statusCode: error.response?.status
      };
    }
  }

  async verifyUser(data) {
    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/api/v1/users/verify-account`, data,
        { headers: { 'Content-Type': 'application/json' } }
      );
      const statusCode = response.data?.statusCode ?? response.status;
      return { ...response.data, statusCode };
    } catch (error) {
      throw {
        message: error.response?.data?.message || error.message || 'Request failed',
        statusCode: error.response?.status
      };
    }
  }

  async Login(data) {
    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/api/v1/users/login`, data,
        { headers: { 'Content-Type': 'application/json' } }
      );
      const statusCode = response.data?.statusCode ?? response.status;
      return { ...response.data, statusCode };
    } catch (error) {
      throw {
        message: error.response?.data?.message || error.message || 'Request failed',
        statusCode: error.response?.status
      };
    }
  }

  async Logout(data) {
    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/api/v1/users/logout`, data,
        { headers: { 'Content-Type': 'application/json' } }
      );
      const statusCode = response.data?.statusCode ?? response.status;
      return { ...response.data, statusCode };
    } catch (error) {
      throw {
        message: error.response?.data?.message || error.message || 'Request failed',
        statusCode: error.response?.status
      };
    }
  }

  async updateProfile(authorization, data) {
    try {
      const res = await axios.patch(`${AUTH_SERVICE_URL}/api/v1/users/account-update`, data,
        { headers: { 'Content-Type': 'application/json', 'Authorization': authorization } }
      );
      const statusCode = res.data?.statusCode ?? res.status;
      return { ...res.data, statusCode };
    } catch (error) {
      throw {
        message: error.response?.data?.message || error.message || 'UPDATE_PROFILE_FAILED',
        statusCode: error.response?.status
      };
    }
  }

  async forgotPassword(data) {
    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/api/v1/users/forgot-password`, data,
        { headers: { 'Content-Type': 'application/json' } }
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

  async resetPassword(data) {
      try {
        const response = await axios.post(`${AUTH_SERVICE_URL}/api/v1/users/reset-password`, data,
          { headers: { 'Content-Type': 'application/json' } }
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

}