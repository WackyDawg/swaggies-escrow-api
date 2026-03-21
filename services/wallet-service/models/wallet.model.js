import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
    accountNumber: {
        type: String,
        required: true
    },
    accountName: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        default: 'NGN',
        enum: ['NGN', 'USD', 'EUR', 'GBP'],
        required: true
    },
    walletReference: {
        type: String,
        required: true
    },
    walletName: {
        type: String,
        required: true
    },
    bankCode: {
        type: String
    },
    bankName: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    usdBalance: { 
        type: Number, 
        default: 0 
    },
    account: {
        type: [accountSchema],
        default: []
    }
}, { timestamps: true });

export default mongoose.model('Wallet', walletSchema);
