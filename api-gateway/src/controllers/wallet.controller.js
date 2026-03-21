import { walletClient } from '../clients/wallet.client.js'
import httpStatus from 'http-status';

export class walletController {
    constructor(Wallet = walletClient) {
        this.Wallet = new Wallet()
    }

    async getWalletBalance(accountNumber, authorization) {
        try {
            //console.log("Authorization token",authorization)
            const wallet = await this.Wallet.getWalletBalance(accountNumber, authorization)
            return wallet;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async getWalletTransactions(accountNumber, authorization) {
        try {
            const wallet = await this.Wallet.getWalletTransactions(accountNumber, authorization)
            return wallet;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async transferFunds(transferData, authorization) {
        try {
            const transfer = await this.Wallet.initiateTransfer(transferData, authorization);
            return transfer;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async createEscrow(escrowData, authorization) {
        try {
            const escrow = await this.Wallet.createEscrow(escrowData, authorization);
            return escrow;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async fundEscrow(escrowId, authorization) {
        try {
            const escrow = await this.Wallet.fundEscrow(escrowId, authorization);
            return escrow;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async releaseEscrow(escrowId, authorization) {
        try {
            const escrow = await this.Wallet.releaseEscrow(escrowId, authorization);
            return escrow;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async generateInvoiceLink(escrowData, authorization) {
        try {
            const invoiceLink = await this.Wallet.generateInvoiceLink(escrowData, authorization);
            return invoiceLink;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async viewPublicInvoice(token) {
        try {
            const invoiceLink = await this.Wallet.viewPublicInvoice(token);
            return invoiceLink;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async viewTrackingInvoice(token) {
        try {
            const trackingDetails = await this.Wallet.viewTrackingInvoice(token);
            return trackingDetails;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async requestApprovalCode(token) {
        try {
            const result = await this.Wallet.requestApprovalCode(token);
            return result;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async submitMilestone(escrowId, milestoneId, submissionDetails, authorization) {
        try {
            const result = await this.Wallet.submitMilestone(escrowId, milestoneId, submissionDetails, authorization);
            return result;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async guestApproveMilestone(token, milestoneId, approvalCode, authorization) {
        try {
            const result = await this.Wallet.guestApproveMilestone(token, milestoneId, approvalCode, authorization);
            return result;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }

    async guestRejectMilestone(token, milestoneId, reason) {
        try {
            const result = await this.Wallet.rejectMilestone(token, milestoneId, reason);
            return result;
        } catch (error) {
            throw {
                message: error.message || error,
                statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
            }
        }
    }
}
