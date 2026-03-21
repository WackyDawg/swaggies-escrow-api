import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import httpStatus from 'http-status';
import userModelInstance from "../models/user.model.js";

class userService {
    constructor(User = userModelInstance) {
        this.User = User;
    }
    // Placeholder for wallet client if needed for wallet creation on user signup
    // constructor(User = userModelInstance, walletClient) {
    //     this.User = User;
    //     this.walletClient = walletClient;
    // }

    async getProfile(userId) {
        try {
            const user = await this.User.findById(userId);
            if (!user) {
                throw new Error("USER_NOT_FOUND");
            }

            return {
                auth_account_id: user._id,
                email: user.email,
                name: user.name,
                date_of_birth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : null,
                phone_number: user.phone_number,
                is_mfa_enabled: user.is_mfa_enabled,
                is_kyc_verified: user.is_kyc_verified,
                mfa_type: user.mfa_type,
                locale: user.locale,
                gender: user.gender,
                //role: user.role,
                created_at_unix: user.createdAt,
                statusCode: httpStatus.OK
            };
        } catch (error) {
            console.error(error)
            throw {
                message: error.message,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async updateProfile(userId, settingsData) {
        try {
            const user = await this.User.findById(userId);
            if (!user) {
                throw new Error("USER_NOT_FOUND");
            }

            const allowedFields = ['name', 'email', 'bvn', 'nin', 'phone_number'];
            Object.keys(settingsData).forEach((key) => {
                if (allowedFields.includes(key)) {
                    user[key] = settingsData[key];
                }
            });

            await user.save();

            return {
                message: "PROFILE_UPDATED_SUCCESSFULLY",
                statusCode: httpStatus.OK
            };
        } catch (error) {
            console.error(error)
            throw {
                message: error.message,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    //left for now till i learn GCP Bucket upload in node js
    async updateProfilePic(userId, data) {
        try {
            const user = await this.User.findById(userId);
            if (!user) {
                throw new Error('USER_DOES_NOT_EXIST')
            }


        } catch (error) {

        }
    }

    async changePin(userId, data) {
        try {
            const user = await this.User.findById(userId);
            if (!user) {
                throw new Error("USER_DOES_NOT_EXIST")
            }

            const pinCodeRaw = data.pinCode ?? data.pin_code ?? data.pin;
            if (pinCodeRaw === undefined || pinCodeRaw === null) {
                throw { message: 'PIN_CODE_REQUIRED', statusCode: httpStatus.BAD_REQUEST };
            }
            const pinCodeStr = String(pinCodeRaw);

            const hashedNewPin = await bcrypt.hash(pinCodeStr, 10);
            user.pin_code = hashedNewPin;
            await user.save();

            return {
                message: "PIN_CHANGED_SUCCESSFULLY",
                statusCode: httpStatus.OK
            };
        } catch (error) {
            throw {
                message: error.message,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }
    
    async getUserByPocketId(swag_id) {
        try {
            console.log(swag_id)
            const user = await this.User.findOne({ swag_id });
            if (!user) {
                throw {
                    message: "USER_NOT_FOUND",
                    statusCode: httpStatus.NOT_FOUND
                };
            }

            return {
                account_id: user._id,
                email: user.email,
                name: user.name,
                date_of_birth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : null,
                phone_number: user.phone_number,
                is_mfa_enabled: user.is_mfa_enabled,
                is_kyc_verified: user.is_kyc_verified,
                mfa_type: user.mfa_type,
                locale: user.locale,
                gender: user.gender,
                //role: user.role,
                created_at_unix: user.createdAt,
                statusCode: httpStatus.OK
            };
        } catch (error) {
            throw {
                message: error.message,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async createUserProfile(profileData) {
        try {
            const { authId, name, email, swag_id } = profileData;

            const newUser = new this.User({
                _id: authId,
                name,
                email,
                swag_id,
            });

            await newUser.save();

            return {
                userId: newUser._id,
                message: "USER_PROFILE_CREATED"
            };
        } catch (error) {
            throw { message: error.message, statusCode: httpStatus.CONFLICT };
        }
    }
}

export default userService;