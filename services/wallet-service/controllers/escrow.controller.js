import { EscrowService } from '../services/escrow.service.js';

const escrowService = new EscrowService();

export class EscrowController {
    
    async createEscrow(req, res) {
        try {
            const clientId = req.user.userId; 
            const { freelancerId, amount, title, description } = req.body;

            if (!freelancerId || !amount || !title) {
                return res.status(400).json({ 
                    success: false, 
                    message: "freelancerId, amount, and title are strictly required." 
                });
            }

            const amountInKobo = Math.round(parseFloat(amount) * 100);

            const result = await escrowService.createEscrow(
                clientId, 
                freelancerId, 
                amountInKobo, 
                title, 
                description
            );

            if (!result.success) {
                return res.status(400).json({ success: false, message: result.message });
            }

            return res.status(201).json(result);

        } catch (error) {
            console.error("Create Escrow Controller Error:", error);
            return res.status(500).json({ success: false, message: "Internal server error during escrow creation." });
        }
    }

    async fundEscrow(req, res) {
        try {
            const clientId = req.user.userId;
            const { escrowId } = req.params;

            if (!escrowId) {
                return res.status(400).json({ success: false, message: "Escrow ID parameter is required." });
            }

            const result = await escrowService.fundEscrow(clientId, escrowId);

            if (!result.success) {
                return res.status(400).json({ success: false, message: result.message });
            }

            return res.status(200).json(result);

        } catch (error) {
            console.error("Fund Escrow Controller Error:", error);
            return res.status(500).json({ success: false, message: "Internal server error during escrow funding." });
        }
    }

    async releaseEscrow(req, res) {
        try {
            const clientId = req.user.userId;
            const { escrowId } = req.params;

            if (!escrowId) {
                return res.status(400).json({ success: false, message: "Escrow ID parameter is required." });
            }

            const result = await escrowService.releaseEscrow(clientId, escrowId);

            if (!result.success) {
                return res.status(400).json({ success: false, message: result.message });
            }

            return res.status(200).json(result);

        } catch (error) {
            console.error("Release Escrow Controller Error:", error);
            return res.status(500).json({ success: false, message: "Internal server error during escrow release." });
        }
    }

    async generateInvoiceLink(req, res) {
        try {
          const freelancerId = req.user.userId;
          const { clientEmail, amount, title, description, milestones } = req.body;

          if (!clientEmail || !amount || !title) {
            return res.status(400).json({ success: false, message: "clientEmail, amount, and title are strictly required." });
          }

          const amountInKobo = Math.round(parseFloat(amount) * 100);

          const result = await escrowService.createGuestInvoice(
            freelancerId,
            clientEmail,
            amountInKobo,
            title,
            description,
            milestones
          );

          if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
          }

          return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
          console.error("Generate Invoice Link Controller Error:", error);
          return res.status(500).json({ success: false, message: "Internal server error during invoice link generation." });
        }
    }

    async viewPaymentInvoice(req, res) {
        try {
            const { paymentToken } = req.params;
            const result = await escrowService.getInvoiceByPaymentToken(paymentToken);

            return res.status(result.success ? 200 : 404).json(result)
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async viewTrackingInvoice(req, res) {
        try {
            const { trackingToken } = req.params;
            const result = await escrowService.getInvoiceByTrackingToken(trackingToken);

            return res.status(result.success ? 200 : 404).json(result)
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async submitMilestone(req, res) {
        try {
            const freelancerId = req.user.userId;
            const { escrowId, milestoneId } = req.params;
            const { submissionDetails } = req.body;

            if (!escrowId || !milestoneId || !submissionDetails) {
                return res.status(400).json({
                    success: false,
                    message: 'escrowId, milestoneId, and submissionDetails are strictly required.'
                });
            }

            const result = await escrowService.submitMilestoneWork(
                freelancerId,
                escrowId,
                milestoneId,
                submissionDetails
            );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            console.error("Submit Milestone Controller Error", error);
            return res.status(500).json({ success: false, message: "Internal server error during milestone submission." });
        }
    }

    async guestApproveMilestone(req, res) {
        try {
            const { trackingToken, milestoneId } = req.params;
            const { approvalCode } = req.body;

            if (!trackingToken || !milestoneId || !approvalCode) {
                return res.status(400).json({
                    success: false,
                    message: "trackingToken, milestoneId and approvalCode are required."
                });
            }

            const result = await escrowService.releaseGuestMilestone(trackingToken, milestoneId, approvalCode);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            console.error("Guest Approve Controller Error:", error);
            return res.status(error.statusCode || 500).json({ 
                success: false, 
                message: error.message || "Internal server error during milestone approval." 
            });
        }
    }

    async guestRejectMilestone(req, res) {
        try {
            const { trackingToken, milestoneId } = req.params;
            const { reason } = req.body;

            if (!trackingToken || !milestoneId || !reason) {
                return res.status(400).json({
                    success: false,
                    message: "trackingToken, milestoneId and reason are required."
                });
            }

            const result = await escrowService.rejectGuestMilestone(trackingToken, milestoneId, reason);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            console.error("Guest Reject Controller Error:", error);
            return res.status(error.statusCode || 500).json({ 
                success: false, 
                message: error.message || "Internal server error during milestone rejection." 
            });
        }
    }

    async requestApprovalCode(req, res) {
        try {
            const { trackingToken } = req.params;
            const result = await escrowService.sendApprovalCode(trackingToken);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Failed to send verification code."
            });
        }
    }
}