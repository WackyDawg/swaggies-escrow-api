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
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  swag_id: {
    type: String,
    unique: true,
    sparse: true,
    default: null
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Non-binary", "Prefer not to say"],
  },
  dateOfBirth: Date,
  is_mfa_enabled: {
    type: Boolean,
    default: false
  },
  mfa_type: {
    type: String,
    enum: ['email', 'sms', 'authenticator'],
  },
  is_seller: {
    type: Boolean,
    default: false
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
  kyc_info: {
    type: [kycSchema],
    default: []
  },
  locale: String,
  geo_location: {
    country: String,
    city: String,
    region: String,
    latitude: Number,
    longitude: Number
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
  refreshTokenExpiresAt: Date
}, { timestamps: true });

export default mongoose.model('User', userSchema);
