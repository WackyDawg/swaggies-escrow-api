import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema({
  bvn: { type: String, default: null },
  nin: { type: String, default: null },
  address: { type: String, default: null }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  pin_code: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  swag_id: {
    type: String,
    unique: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Non-binary", "Prefer not to say"],
    required: false
  },
  dateOfBirth: {
    type: Date,
    required: false
  },
  is_mfa_enabled: {
    type: Boolean,
    default: false
  },
  mfa_type: {
    type: String,
    enum: ['email', 'sms', 'authenticator'],
    required: false
  },
  is_kyc_verified: {
    type: Boolean,
    default: false
  },
  phone_number: {
    type: String,
    default: null
  },
  kyc_level: {
    type: String,
    enum: ['level 1', 'level 2', 'level 3'],
    default: 'level 1'
  },
  kyc_status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  locale: {
    type: String,
    required: false
  },
  geo_location: {
    country: {
      type: String,
      required: false
    },
    city: {
      type: String,
      required: false
    },
    region: {
      type: String,
      required: false
    },
    latitude: {
      type: Number,
      required: false
    },
    longitude: {
      type: Number,
      required: false
    }
  },
  lastLoginIp: {
    type: String,
    default: null
  },
  lastLoginDevice: {
    type: String,
    default: null
  },
  lastLoginDeviceType: {
    type: String,
    default: null
  },
  is_general_notification: {
    type: Boolean,
    default: true
  },
  is_transactional_notification: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  deletedAt: { type: Date, default: null },
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  verificationToken: String,
  verificationTokenExpiresAt: Date,
  refreshToken: String,
  refreshTokenExpiresAt: Date,
  kyc_info: [kycSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.model('User', userSchema);