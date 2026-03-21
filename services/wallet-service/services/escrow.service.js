import Escrow from "../models/escrow.model.js";
import Wallet from "../models/wallet.model.js";
import walletTransactionModel from "../models/wallet_transaction.model.js";
import crypto from 'crypto';
import userClient from '../client/user-grpc.client.js';
import notificationClient from '../client/notification-grpc.client.js';


export class EscrowService {
    constructor(){
        this.Escrow = Escrow;
        this.Wallet = Wallet;
        this.Transaction = walletTransactionModel;
    }


    async createEscrow(clientId, freelancerId, amountInKobo, title, description) {
        try {
            const newEscrow = await this.Escrow.create({
                clientId,
                freelancerId,
                title,
                description,
                amount: amountInKobo,
                status: 'AWAITING_PAYMENT' 
            });

            return {
                success: true,
                message: "Escrow contract created successfully.",
                code: 200,
                data: newEscrow
            };
        } catch (error) {
            console.error("Create Escrow Service Error:", error);
            return { success: false, message: error.message };
        }
    }

    async fundEscrow(clientId, escrowId) {
        const session = await this.Wallet.db.startSession();
        try {
            session.startTransaction();
            
            const escrow = await this.Escrow.findById(escrowId).session(session);
            if (!escrow) throw new Error("Escrow contract not found");
            if (String(escrow.clientId) !== String(clientId)) throw new Error("Unauthorized: Only the client can fund this escrow.");
            
            if (escrow.status !== 'AWAITING_PAYMENT' && escrow.status !== 'DRAFT') {
                throw new Error(`Escrow cannot be funded. Current status is ${escrow.status}.`);
            }

            const clientWallet = await this.Wallet.findOne({ userId: clientId }).session(session);
            if (!clientWallet) throw new Error("Client wallet not found.");
            if (clientWallet.balance < escrow.amount) throw new Error("Insufficient funds to lock this escrow.");

            const balanceBefore = clientWallet.balance;
            clientWallet.balance -= escrow.amount;
            await clientWallet.save({ session });

            escrow.status = 'FUNDED_LOCKED';
            escrow.fundedAt = Date.now();
            await escrow.save({ session });

            await this.Transaction.create([{
                userId: clientId,
                walletId: clientWallet._id,
                transactionRef: `ESC_FUND_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                amount: escrow.amount,
                type: 'DEBIT',
                category: 'TRANSFER_OUT',
                status: 'COMPLETED',
                description: `Locked funds for Escrow: ${escrow.title}`,
                balanceBefore: balanceBefore,
                balanceAfter: clientWallet.balance,
                metadata: { escrowId: String(escrow._id) }
            }], { session });

            await session.commitTransaction();

            return {
                success: true,
                message: "Funds successfully locked in Escrow.",
                data: escrow
            };
        } catch (error) {
            await session.abortTransaction();
            console.error("Fund Escrow Service Error:", error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    async releaseEscrow(clientId, escrowId) {
        const session = await this.Wallet.db.startSession();
        try {
            session.startTransaction();

            const escrow = await this.Escrow.findById(escrowId).session(session);
            if (!escrow) throw new Error("Escrow contract not found.");
            if (String(escrow.clientId) !== String(clientId)) throw new Error("Unauthorized: Only the client can release these funds.");
            
            if (escrow.status !== 'FUNDED_LOCKED') {
                throw new Error("Only funded escrows can be released.");
            }

            const freelancerWallet = await this.Wallet.findOne({ userId: escrow.freelancerId }).session(session);
            if (!freelancerWallet) throw new Error("Freelancer wallet not found.");

            const balanceBefore = freelancerWallet.balance;
            freelancerWallet.balance += escrow.amount;
            await freelancerWallet.save({ session });

            escrow.status = 'RELEASED';
            escrow.releasedAt = Date.now();
            await escrow.save({ session });

            await this.Transaction.create([{
                userId: escrow.freelancerId,
                walletId: freelancerWallet._id,
                transactionRef: `ESC_REL_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                amount: escrow.amount,
                type: 'CREDIT',
                category: 'TRANSFER_IN',
                status: 'COMPLETED',
                description: `Released funds from Escrow: ${escrow.title}`,
                balanceBefore: balanceBefore,
                balanceAfter: freelancerWallet.balance,
                metadata: { escrowId: String(escrow._id) }
            }], { session });

            await session.commitTransaction();
            
            return { 
                success: true, 
                message: "Funds successfully released to freelancer.", 
                data: escrow 
            };

        } catch (error) {
            await session.abortTransaction();
            return { success: false, message: error.message };
        } finally {
            session.endSession();
        }
    }

    async createGuestInvoice(freelancerId, clientEmail, amountInKobo, title, description, milestones) {
        try {
            const token = crypto.randomBytes(16).toString('hex');
            
            let isMilestoneBased = false;
            let formattedMilestones = [];

            if (milestones && milestones.length > 0) {
                isMilestoneBased = true;

                let calculatedTotalKobo = 0;

                formattedMilestones = milestones.map(m => {
                    const mKobo = Math.round(parseFloat(m.amount) * 100);
                    if (mKobo <= 0) throw new Error("Milestone amounts must be greater than 0.");
                    calculatedTotalKobo += mKobo;

                    return {
                        title: m.title,
                        amount: mKobo,
                        status: 'PENDING'
                    };
                });

                if (calculatedTotalKobo !== amountInKobo) {
                    throw new Error(`Total project amount is ₦${amountInKobo/100}, but milestones add up to ₦${calculatedTotalKobo/100}.`);
                }
            } else {
                formattedMilestones = [{
                    title: title,
                    amount: amountInKobo,
                    status: 'PENDING'
                }];
            }

            const newEscrow = await this.Escrow.create({
                freelancerId,
                clientEmail,
                paymentToken: token,
                title,
                description,
                amount: amountInKobo,
                isMilestoneBased,
                milestones: formattedMilestones,
                status: 'AWAITING_PAYMENT'
            });

            return {
                success: true,
                message: isMilestoneBased ? "Milestone invoice link generated successfully." : "Standard invoice generated successfully.",
                data: {
                    invoiceDetails: newEscrow,
                    paymentLink: `${process.env.FRONTEND_URL}/invoice?paymentToken=${token}`
                }
            };
        } catch (error) {
            console.error("Create Invoice Error:", error);
            return { success: false, message: error.message };
        }
    }

    
    async _getInvoiceByToken(query, isTrackingLink) {
        try {
            const escrow = await this.Escrow.findOne(query).lean();
            if (!escrow) throw new Error("Invalid or expired link.");

            let freelancerName = "";
            let freelancerEmail = "";

            try {
                const freelancerId = String(escrow.freelancerId);              
                const freelancer = await new Promise((resolve, reject) => {
                    userClient.GetUserProfile({ userId: freelancerId }, (err, response) => {
                        if (err) {
                            console.error(`[EscrowService] gRPC Error fetching freelancer ${freelancerId}:`, err.message || err);
                            return reject(err);
                        }
                        resolve(response);
                    });
                });

                if (freelancer && (freelancer.name || freelancer.email)) {
                   freelancerName = freelancer.name || freelancerName;
                   freelancerEmail = freelancer.email || freelancerEmail;
                }
            } catch (err) {
                console.error("[EscrowService] Warning: Could not fetch freelancer details via gRPC.", err.message);
            }

            return {
                success: true,
                data: {
                    title: escrow.title,
                    description: escrow.description,
                    amountInNaira: escrow.amount / 100,
                    status: escrow.status,
                    isTrackingLink,
                    freelancer: {
                        name: freelancerName,
                        email: freelancerEmail
                    },
                    clientEmail: escrow.clientEmail,
                    milestones: escrow.milestones
                }
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getInvoiceByPaymentToken(token) {
        return this._getInvoiceByToken({ paymentToken: token }, false);
    }

    async getInvoiceByTrackingToken(token) {
        return this._getInvoiceByToken({ trackingToken: token }, true);
    }

    async submitMilestoneWork(freelancerId, escrowId, milestoneId, submissionDetails) {
        try {
            const escrow = await this.Escrow.findById(escrowId);

            if (!escrow) throw new Error("Escrow contract not found.");

            if (String(escrow.freelancerId) !== String(freelancerId)) {
                throw new Error("Unauthorized: Only the assigned freelancer can submit work.");
            }

            if (escrow.status !== 'FUNDED_LOCKED') {
                throw new Error(`Cannot submit work. Main Escrow status is: ${escrow.status}`);
            }

            const milestone = escrow.milestones.id(milestoneId);
            if (!milestone) throw new Error("Milestones not found.");

            if (milestone.status !== 'PENDING') {
                throw new Error(`Cannot submit. Milestone is currently in ${milestone.status} state.`);
            }

            milestone.status = 'IN_REVIEW';
            milestone.submissionDetails = submissionDetails;
            await escrow.save();

            let freelancerName = "Freelancer";
            let freelancerEmail = "";

            try {
                const freelancer = await new Promise((resolve, reject) => {
                    userClient.GetUserProfile({ userId: String(escrow.freelancerId) }, (err, response) => {
                        if (err) resolve(null);
                        else resolve(response);
                    });
                });

                if (freelancer) {
                    freelancerName = freelancer.fullName || freelancer.username || "Freelancer";
                    freelancerEmail = freelancer.email || "";
                }
            } catch (err) {
                console.error("Warning: Could not fetch freelancer details for email:", err.message);
            }

            try {
              await new Promise((resolve, reject) => {
                notificationClient.SendEmail({
                  to: escrow.clientEmail,
                  subject: `Milestone Review: ${milestone.title}`,
                  template: 'milestone_review',
                  variables: {
                    milestoneTitle: milestone.title,
                    freelancerName: freelancerName,
                    freelancerEmail: freelancerEmail,
                    trackingLink: `${process.env.FRONTEND_URL}/tracking?trackingToken=${escrow.trackingToken}`,
                    escrowId: escrowId,
                    milestoneId: milestoneId
                  }
                }, (err, res) => {
                  if (err) return reject(err);
                  resolve(res);
                });
              });
            } catch (error) {
              console.error("gRPC call to notification-service failed:", error);
              const serviceError = new Error("EMAIL_SEND_FAILED");
              throw serviceError;
            }

            return {
                success: true,
                message: `Milestone '${milestone.title}' submitted successfully.Client has been notified.`,
                data: escrow
            }
        } catch (error) {
            console.error("Submit Milestone Error:", error);
            return { success: false, message: error.message };
        }
    }

    async releaseGuestMilestone(trackingToken, milestoneId, approvalCode) {
        const session = await this.Wallet.db.startSession();

        try {
           session.startTransaction();

           const escrow = await this.Escrow.findOne({ trackingToken }).session(session);
           if (!escrow) {
                const isPaymentToken = await this.Escrow.exists({ paymentToken: trackingToken });
                if (isPaymentToken) {
                    throw new Error("Security Restriction: This action can only be performed using the secure tracking link sent to your email after payment.");
                }
                throw { statusCode: 404, message: "Escrow not found or invalid token." };
           }

           if (escrow.approvalCode !== approvalCode) {
                throw { statusCode: 400, message: "Invalid verification code. Please try again." };
            }

           if (escrow.status !== 'FUNDED_LOCKED') {
              throw new Error(`Cannot release funds. Escrow is currently: ${escrow.status}`);
           }

           const milestone = escrow.milestones.id(milestoneId);
           if (!milestone) throw new Error("Milestone not found.");

           if (milestone.status !== 'IN_REVIEW') {
            throw new Error(`Cannot release. Milestone must be IN_REVIEW. Current state: ${milestone.status}`);
           }
           
           const freelancerWallet = await this.Wallet.findOne({ userId: escrow.freelancerId }).session(session);
           if (!freelancerWallet) throw new Error("Freelancer wallet not found. Payout aborted.");

           const balanceBefore = freelancerWallet.balance;
           freelancerWallet.balance += milestone.amount;
           await freelancerWallet.save({ session });

           await this.Transaction.create([{
                userId: escrow.freelancerId,
                walletId: freelancerWallet._id,
                transactionRef: `ESC_MILESTONE_REL_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                amount: milestone.amount,
                type: 'CREDIT',
                category: 'TRANSFER_IN',
                status: 'COMPLETED',
                description: `Milestone Payout: ${milestone.title} (${escrow.title})`,
                balanceBefore: balanceBefore,
                balanceAfter: freelancerWallet.balance,
                metadata: { escrowId: String(escrow._id), milestoneId: String(milestone._id) }
            }], { session });
           
            milestone.status = 'COMPLETED';
            milestone.releasedAt = Date.now();

            const allCompleted = escrow.milestones.every(m => m.status === 'COMPLETED');
            if (allCompleted) {
                escrow.status = 'COMPLETED';
                escrow.completedAt = Date.now();
                console.log(`🎉 Project Fully Completed! Escrow ${escrow._id} closed.`)
            }
            
            await escrow.save({ session });

            await session.commitTransaction();

            escrow.approvalCode = null;
            await escrow.save();
            
            return {
                success: true,
                message: "Milestone released successfully.",
                data: milestone
            };
        } catch (error) {
           await session.abortTransaction();
           console.error("Release Milestone Error:", error);
           throw error;
        } finally {
            session.endSession();
        }
    }

    async rejectGuestMilestone(trackingToken, milestoneId, reason) {
        const escrow = await this.Escrow.findOne({ trackingToken });
        if (!escrow) throw { statusCode: 404, message: "Invalid tracking token." };

        const milestone = escrow.milestones.id(milestoneId);
        if (!milestone) throw { statusCode: 404, message: "Milestone not found." };

        if (milestone.status !== 'IN_REVIEW') {
            throw { statusCode: 400, message: "Only milestones currently 'IN_REVIEW' can be rejected/disputed." };
        }

        milestone.status = 'DISPUTED';
        milestone.submissionDetails = `[REJECTED] Reason: ${reason}\n\n[PREVIOUS SUBMISSION]: ${milestone.submissionDetails || 'No details'}`;
        
        await escrow.save();

        // Notify Freelancer
        try {
            const freelancer = await new Promise((resolve) => {
                userClient.GetUserProfile({ userId: String(escrow.freelancerId) }, (err, response) => {
                    if (err) resolve(null);
                    else resolve(response);
                });
            });

            const freelancerEmail = freelancer?.email || "";
            if (freelancerEmail) {
                notificationClient.SendEmail({
                    to: freelancerEmail,
                    subject: `Milestone Disputed: ${escrow.title}`,
                    template: 'milestone_rejected',
                    variables: {
                        projectTitle: escrow.title,
                        milestoneTitle: milestone.title,
                        rejectionReason: reason,
                        clientEmail: escrow.clientEmail
                    }
                }, (err) => {
                    if (err) console.error("Failed to notify freelancer of rejection:", err);
                });
            }
        } catch (err) {
            console.error("Error in rejection notification flow:", err);
        }

        return {
            success: true,
            message: "Milestone work rejected. Freelancer has been notified.",
            data: milestone
        };
    }

    async sendApprovalCode(trackingToken) {
        try {
            const escrow = await this.Escrow.findOne({ trackingToken });
            if (!escrow) {
                throw { statusCode: 404, message: "Invalid tracking token." };
            }

            const approvalCode = Math.floor(100000 + Math.random() * 900000).toString();
            escrow.approvalCode = approvalCode;
            await escrow.save();

            try {
                notificationClient.SendEmail({
                    to: escrow.clientEmail,
                    subject: `Verification Code: ${escrow.title}`,
                    template: "escrow_otp",
                    variables: {
                        projectTitle: escrow.title,
                        otpCode: approvalCode
                    }
                }, (error, response) => {
                    if (error) console.error("Failed to send OTP email:", error); // Changed logger.error to console.error
                });
            } catch (e) {
                console.error("Error calling notification service for OTP:", e); // Changed logger.error to console.error
            }

            return {
                success: true,
                message: "Verification code sent to your email."
            };
        } catch (error) {
            throw error;
        }
    }

    async handleEscrowPayment(paymentToken) {
        try {
            const escrow = await this.Escrow.findOne({ paymentToken });
            
            if (!escrow) {
                console.error(`[EscrowService] handleEscrowPayment: Escrow not found for token ${paymentToken}`);
                return { success: false, message: "Escrow not found." };
            }

            if (escrow.status !== 'AWAITING_PAYMENT') {
                console.warn(`[EscrowService] handleEscrowPayment: Escrow ${escrow._id} already processed. Status: ${escrow.status}`);
                return { success: true, message: "Escrow already processed." };
            }

            const trackingToken = crypto.randomBytes(16).toString('hex');
            
            escrow.status = 'FUNDED_LOCKED';
            escrow.fundedAt = Date.now();
            escrow.trackingToken = trackingToken;
            await escrow.save();

            console.log(`[EscrowService] Escrow ${escrow._id} funded. Tracking token generated.`);

            try {
                let freelancerName = "Your Freelancer";
                try {
                    const freelancer = await new Promise((resolve, reject) => {
                        userClient.GetUserProfile({ userId: String(escrow.freelancerId) }, (err, response) => {
                            if (err) return resolve(null);
                            resolve(response);
                        });
                    });
                    if (freelancer && (freelancer.fullName || freelancer.name)) {
                        freelancerName = freelancer.fullName || freelancer.name;
                    }
                } catch (e) {}

                const trackingLink = `${process.env.FRONTEND_URL}/tracking?trackingToken=${trackingToken}`;

                notificationClient.SendEmail({
                    to: escrow.clientEmail,
                    subject: `Project Funded Successfully - ${escrow.title}`,
                    template: 'escrow_funded',
                    variables: {
                        projectTitle: escrow.title,
                        trackingLink: trackingLink,
                        totalAmount: `₦${(escrow.amount / 100).toLocaleString()}`,
                        freelancerName: freelancerName
                    }
                }, (err, response) => {
                    if (err) console.error("[EscrowService] Failed to send tracking link email:", err);
                    else console.log("[EscrowService] Tracking link email sent to client.");
                });
            } catch (err) {
                console.error("[EscrowService] Error in notification sub-task:", err);
            }

            return { success: true, data: escrow };
        } catch (error) {
            console.error("[EscrowService] Transaction check/update error:", error);
            return { success: false, message: error.message };
        }
    }
}