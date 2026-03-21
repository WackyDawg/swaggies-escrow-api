import axios from 'axios';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import httpStatus from 'http-status';
import authModelInstance from "../models/auth.model.js";
import { generateVerificationToken } from '../utils/verificationCode.util.js';
import { generateTokenAndSetCookie } from '../utils/jwt.utils.js';
import notificationClient from '../clients/notification-grpc.client.js';
import walletClient from '../clients/wallet-grpc.client.js';
import { generateWalletRef, generateWalletName, generateTxRef } from '../utils/refgenerator.utils.js';
import { encrypt, decrypt } from '../utils/encryption.util.js';

function splitName(fullName) {
  const parts = (fullName || "").trim().split(" ");

  const firstname = parts[0] || "";
  const lastname = parts.length > 1 ? parts.slice(1).join(" ") : "User";

  return { firstname, lastname };
}

class authService {
    constructor(Auth = authModelInstance) {
        this.Auth = Auth;
    }

    async createUser(email, password, name, swag_id, bvn, dateOfBirth, userIp, phone_number) {
        try {
            const normalizedEmail = String(email).trim().toLowerCase();
            const existingUser = await this.Auth.findOne({ email: normalizedEmail });
            if (existingUser) {
                throw {
                    message: 'A user with this email already exists',
                    code: 'USER_EXISTS',
                    statusCode: httpStatus.CONFLICT
                };
            }

            const existingSwagId = await this.Auth.findOne({ swag_id });
            if (existingSwagId) {
                throw {
                    message: 'A user with this swag_id already exists',
                    code: 'SWAG_ID_EXISTS',
                    statusCode: httpStatus.CONFLICT
                };
            }

            const GeoData = await axios.get(`https://ipapi.co/${userIp}/json/`);
            //console.log(GeoData.data)

            const passwordHash = await bcrypt.hash(password, 10);
            const encryptedBvn = encrypt(bvn);
            const verificationToken = generateVerificationToken();

            const user = await this.Auth.create({
                email: normalizedEmail,
                password: passwordHash,
                name,
                swag_id,
                phone_number,
                dateOfBirth,
                verificationToken,
                verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
                kyc_info: [
                    {
                        bvn: encryptedBvn,
                        nin: null,
                        address: null
                    }
                ]
            });

            try {
                await new Promise((resolve, reject) => {
                    notificationClient.SendEmail({
                        to: user.email,
                        subject: 'Verify your account',
                        template: 'verification',
                        variables: { verificationCode: verificationToken }
                    }, (err, res) => err ? reject(err) : resolve(res));
                });
            } catch (error) {
                console.error("gRPC call to notification-service failed:", error);
                const serviceError = new Error("EMAIL_SEND_FAILED");
                throw serviceError;
            }

            return {
                success: true,
                message: 'User created successfully',
                data: {
                    user: {
                        auth_account_id: user._id,
                        email: user.email,
                        name: user.name,
                        swag_id: user.swag_id,
                        role: user.role,
                        createdAt: user.createdAt
                    }
                },
                statusCode: httpStatus.CREATED
            }
        } catch (error) {
            console.error(error);
            throw {
                message: error.message || error,
                code: error.code,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async verifyUser(verificationToken) {
        try {
            const user = await this.Auth.findOne({ verificationToken });
            if (!user) {
                throw {
                    message: 'The verification token provided is invalid or the user was not found',
                    code: 'USER_NOT_FOUND',
                    statusCode: httpStatus.NOT_FOUND
                };
            }

            if (user.verificationTokenExpiresAt < Date.now()) {
                throw {
                    message: 'The verification link has expired',
                    code: 'TOKEN_EXPIRED',
                    statusCode: httpStatus.BAD_REQUEST
                };
            }

            user.isVerified = true;
            user.verificationToken = undefined;
            user.verificationTokenExpiresAt = undefined;
            await user.save();

            try {
                await new Promise((resolve, reject) => {
                    notificationClient.SendEmail({
                        to: user.email,
                        subject: 'Welcome to Swaggies!',
                        template: 'welcome',
                    }, (err, res) => {
                        if (err) return reject(err);
                        resolve(res);
                    });
                });
            } catch (error) {
                console.error("gRPC call to notification-service failed:", error);
            }

            try {
                // const walletReference = `SWG_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                const walletName = `Main Wallet - ${user.name}`;

                const encryptedBvn = user.kyc_info?.[0]?.bvn || user.kyc_info?.bvn || null;
                const decryptedBvn = encryptedBvn ? decrypt(encryptedBvn) : '';
                const tx_ref = generateTxRef("swg");
                const { firstname, lastname } = splitName(user.name);


                const walletData = {
                    userId: String(user._id), 
                    reference: tx_ref,
                    walletName: walletName,
                    customer_firstname: firstname,
                    customer_lastname: lastname,
                    customer_email: user.email,
                    customer_phone: user.phone_number,
                    bvn: decryptedBvn, 
                };

                await new Promise((resolve, reject) => {
                    walletClient.CreateWallet(walletData, (err, res) => {
                        if (err) return reject(err);
                        resolve(res);
                    });
                });
            } catch (error) {
                console.error("gRPC call to wallet-service failed:", error);
                throw {
                    message: "WALLET_CREATION_FAILED",
                    statusCode: httpStatus.INTERNAL_SERVER_ERROR
                };
            }

            return {
                success: true,
                message: 'User verified and wallet created successfully',
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        createdAt: user.createdAt
                    }
                },
                statusCode: httpStatus.OK
            };

        } catch (error) {
            console.error(error);
            throw {
                message: error.message || 'Verification Failed',
                code: error.code || 'VERIFICATION_FAILED',
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async resendVerificationEmail(email) {
        try {
            const user = await this.Auth.findOne({ email });
            if (!user) {
                throw {
                    message: 'USER_NOT_FOUND',
                    status: httpStatus.NOT_FOUND
                };
            }

            if (user.isVerified) {
                throw {
                    message: 'EMAIL_ALREADY_VERIFIED',
                    statusCode: httpStatus.BAD_REQUEST
                };
            }

            const verificationToken = generateVerificationToken();
            user.verificationToken = verificationToken;
            user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
            await user.save();

            try {
                await new Promise((resolve, reject) => {
                    notificationClient.SendEmail({
                        to: user.email,
                        subject: 'Verify your account',
                        template: 'verification',
                        variables: { verificationCode: verificationToken }
                    }, (err, res) => err ? reject(err) : resolve(res));
                });
            } catch (error) {
                console.error("gRPC call to notification-service failed:", error);
                const serviceError = new Error("EMAIL_SEND_FAILED");
                throw serviceError;
            }

            return {
                success: true,
                message: 'Verification email sent successfully',
                statusCode: httpStatus.OK
            }
        } catch (error) {
            console.error(error);
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async isEmailAvailable(email) {
        try {
            const user = await this.Auth.findOne({ email });
            return {
                success: true,
                message: 'Email availability checked successfully',
                data: {
                    available: !user
                },
                statusCode: httpStatus.OK
            }
        } catch (error) {
            console.error(error);
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async loginUser(email, password, res) {
        try {
            const normalizedEmail = String(email).trim().toLowerCase();
            const user = await this.Auth.findOne({ email: normalizedEmail });
            if (!user) {
                const error = new Error('No account found with this email address');
                error.code = 'USER_NOT_FOUND';
                error.statusCode = httpStatus.NOT_FOUND;
                throw error;
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                const error = new Error('The password you entered is incorrect');
                error.code = 'INVALID_PASSWORD';
                error.statusCode = httpStatus.UNAUTHORIZED;
                throw error;
            }

            const { token, refreshToken } = generateTokenAndSetCookie(res, user._id, user.swag_id);
            console.log("User Data",user)

            user.lastLogin = new Date;
            user.refreshToken = refreshToken;
            user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await user.save();


            return {
                message: 'User logged in successfully',
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    token: token,
                    refreshToken: refreshToken
                },
                statusCode: httpStatus.OK
            }
        } catch (error) {
            console.error(error);
            throw {
                message: error.message,
                code: error.code || 'LOGIN_FAILED',
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async deleteUser(email) {
        try {
            const user = await this.Auth.findOne({ email });
            if (!user) {
                const error = new Error('User not found');
                error.statusCode = httpStatus.NOT_FOUND;
                throw error;
            }

            if (user.deleteAt) {
                return {
                    success: false,
                    message: `Account is already scheduled for deletion on ${user.deleteAt.toISOString()}`,
                };
            }

            const deleteAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

            await this.Auth.findByIdAndUpdate(userId, { deleteAt });

            return {
                success: true,
                message: `Account scheduled for deletion on ${deleteAt.toDateString()}`,
            };
        } catch (error) {
            console.error(error);
            throw {
                message: error.message,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async cancelDeleteAccount(userId) {
        try {
            const user = await this.Auth.findById(userId);
            if (!user) {
                return { success: false, message: "User not found" };
            }

            if (!user.deleteAt) {
                return { success: false, message: "Account is not scheduled for deletion" };
            }

            user.deleteAt = null;
            await user.save();

            return { success: true, message: "Account deletion cancelled successfully" };
        } catch (error) {
            console.error(error);
            throw {
                message: error.message,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async forgotPassword(email) {
        try {
            const user = await this.Auth.findOne({ email });
            if (!user) {
                const error = new Error('User not found');
                error.statusCode = httpStatus.NOT_FOUND;
                throw error;
            }

            const resetToken = crypto.randomBytes(26).toString("hex");
            const resetTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000


            user.resetPasswordToken = resetToken;
            user.resetPasswordExpiresAt = resetTokenExpiresAt;
            await user.save();

            const resetLink = `${process.env.BASE_URL || 'https://127.0.0.1:8080'}/reset-password/${resetToken}`;
            await new Promise((resolve, reject) => {
                notificationClient.SendEmail({
                    to: user.email,
                    subject: 'Reset password',
                    template: 'password_reset',
                    variables: { resetURL: resetLink }
                }, (err, res) => err ? reject(err) : resolve(res));
            });

        } catch (error) {
            console.error(error);
            throw {
                message: error.message,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async resetPassword(token, password) {
        try {
            const user = await this.Auth.findOne({
                resetPasswordToken: token,
                resetPasswordExpiresAt: { $gt: new Date() },
            });

            if (!user) {
                const error = new Error('USER_NOT_FOUND_OR_EXPIRED_TOKEN');
                error.statusCode = httpStatus.NOT_FOUND;
                throw error;
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            user.password = hashedPassword;
            user.resetPasswordToken = null;
            user.resetPasswordExpiresAt = null;
            await user.save();

            return {
                success: true,
                message: 'Password reset successfully',
                statusCode: httpStatus.OK
            }
        } catch (error) {
            console.error(error);
            throw {
                message: error.message,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async changePassword(userId, password) {
        try {
            const user = await this.Auth.findById(userId);
            if (!user) {
                const error = new Error('USER_DOES_NOT_EXIST');
                error.statusCode = httpStatus.NOT_FOUND;
                throw error;
            }

            const passwordHash = await bcrypt.hash(password, 10);
            user.password = passwordHash;
            await user.save();

            return {
                message: 'Password changed successfully',
                statusCode: httpStatus.OK
            }
        } catch (error) {
            console.error(error);
            throw {
                message: error.message,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async getProfile(userId) {
        try {
            const user = await this.Auth.findById(userId);
            if (!user) {
                throw new Error("USER_NOT_FOUND");
            }

            return {
                auth_account_id: user._id,
                email: user.email,
                name: user.name,
                date_of_birth: user.date_of_birth,
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

    async checkAuth() {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error("Unauthorized");
            }
            return user;
        } catch (error) {
            return {
                status: httpStatus.UNAUTHORIZED,
                message: "Unauthorized",
                error: error.message
            }
        }
    }

    async updateProfile(userId, data) {
        try {
            const allowedUpdates = ['name', 'phone_number', 'gender', 'locale', 'is_mfa_enabled', 'mfa_type'];
            const updates = Object.keys(data)
                .filter(key => allowedUpdates.includes(key))
                .reduce((obj, key) => ({ ...obj, [key]: data[key] }), {});

            const user = await this.Auth.findByIdAndUpdate(
                userId,
                { $set: updates },
                { new: true, runValidators: true }
            );

            if (!user) {
                const error = new Error('USER_NOT_FOUND');
                error.statusCode = httpStatus.NOT_FOUND;
                throw error;
            }

            return {
                success: true,
                message: 'Profile updated successfully',
                statusCode: httpStatus.OK,
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone_number: user.phone_number,
                    gender: user.gender,
                    locale: user.locale,
                    is_mfa_enabled: user.is_mfa_enabled
                }
            };
        } catch (error) {
            console.error('Error in updateProfile:', error);
            throw {
                message: error.message,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            };
        }
    }
}

export default authService;
