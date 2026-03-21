import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true,
        index: true
    },    
    transactionRef: {
        type: String,
        required: true,
        unique: true
    },
    monnifyRef: {
        type: String,
        sparse: true,
        unique: true
    },
    
    amount: {
        type: Number,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} must be an integer (in Kobo/Cents)'
        }
    },
    fee: {
        type: Number,
        default: 0,
        validate: { validator: Number.isInteger }
    },
    currency: {
        type: String,
        enum: ["NGN", "USD", "EUR", "GBP"],
        default: "NGN",
        required: true
    },    
    type: {
        type: String,
        enum: ['CREDIT', 'DEBIT'],
        required: true
    },
    category: {
        type: String,
        enum: [
            'WALLET_FUNDING', 'WALLET_WITHDRAWAL', 'TRANSFER_OUT',
            'TRANSFER_IN', 'BILL_PAYMENT', 'AIRTIME_PURCHASE',
            'DATA_PURCHASE', 'CABLE_TV', 'ELECTRICITY',
            'REFUND', 'REVERSAL', 'FEE', 'COMMISSION', 'FX_CONVERSION'
        ],
        required: true
    },
    status: {
        type: String,
        enum: ["COMPLETED", "PENDING", "FAILED", "REVERSED"],
        default: "PENDING",
        required: true
    },    
    description: { type: String, required: true },
    narration: { type: String },    
    balanceBefore: { type: Number, validate: { validator: Number.isInteger } },
    balanceAfter: { type: Number, validate: { validator: Number.isInteger } },    
    recipient: {
        accountNumber: String,
        accountName: String,
        bankCode: String,
        bankName: String
    },
    billDetails: {
        provider: String,
        productCode: String,
        customerReference: String,
        customerName: String,
        token: String
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },    
    transactionDate: {
        type: Date,
        default: Date.now,
        index: true
    },
    completedAt: {
        type: Date
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

walletTransactionSchema.index({ userId: 1, transactionDate: -1 });
walletTransactionSchema.index({ walletId: 1, status: 1 });
walletTransactionSchema.index({ category: 1, status: 1 });

walletTransactionSchema.virtual('isInflow').get(function() {
    return this.type === 'CREDIT';
});

walletTransactionSchema.virtual('formattedAmount').get(function() {
    return `${this.currency} ${(this.amount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
});

walletTransactionSchema.pre('save', function() {
    if (this.isModified('status') && this.status === 'COMPLETED' && !this.completedAt) {
        this.completedAt = new Date();
    }
});

export default mongoose.model('WalletTransaction', walletTransactionSchema);