import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['PENDING', 'IN_REVIEW', 'COMPLETED', 'DISPUTED'], 
        default: 'PENDING' 
    },
    submissionDetails: { type: String, default: null },
    releasedAt: { type: Date, default: null }
});

const escrowSchema = new mongoose.Schema({
    freelancerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    clientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        sparse: true 
    },
    clientEmail: { 
        type: String, 
        required: true 
    },
    paymentToken: { 
        type: String, 
        unique: true, 
        index: true 
    },
    trackingToken: { type: String, unique: true, sparse: true, index: true, default: null },
    approvalCode: { type: String, sparse: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    isMilestoneBased: { type: Boolean, default: false },
    milestones: [milestoneSchema],
    status: { 
        type: String, 
        enum: ['DRAFT', 'AWAITING_PAYMENT', 'FUNDED_LOCKED', 'IN_REVIEW', 'RELEASED', 'COMPLETED', 'DISPUTED'], 
        default: 'AWAITING_PAYMENT' 
    },
    submissionDetails: {
        type: String
    },
    fundedAt: { type: Date },
    releasedAt: { type: Date },
    completedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Escrow', escrowSchema);