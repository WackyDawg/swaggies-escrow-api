import express from 'express';
import { walletController } from '../controllers/wallet.controller.js';

const walletControllerInstance = new walletController();

const walletRouter = express.Router();

walletRouter.get('/wallet-balance/:accountNumber', async (req, res) => {
    try { 
        const result = await walletControllerInstance.getWalletBalance(req.params.accountNumber, req.headers.authorization);
        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

walletRouter.get('/wallet-transactions/:accountNumber', async (req, res) => {
    try {
        const result = await walletControllerInstance.getWalletTransactions(req.params.accountNumber, req.headers.authorization);
        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

walletRouter.post('/transfer', async (req, res) => {
    try {
        console.log("Auth header", req.headers.authorization)
        const result = await walletControllerInstance.transferFunds(req.body, req.headers.authorization);
        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

walletRouter.post('/escrow/create', async (req, res) => {
    try {
        const result = await walletControllerInstance.createEscrow(req.body, req.headers.authorization);
        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

walletRouter.post('/escrow/fund/:escrowId', async (req, res) => {
    try {
        const result = await walletControllerInstance.fundEscrow(req.params.escrowId, req.headers.authorization);
        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

walletRouter.post('/escrow/release/:escrowId', async (req, res) => {
    try {
        const result = await walletControllerInstance.releaseEscrow(req.params.escrowId, req.headers.authorization);
        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

walletRouter.post('/escrow/invoice/generate', async (req, res) => {
    try {
        const result = await walletControllerInstance.generateInvoiceLink(req.body, req.headers.authorization);
        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

walletRouter.get('/escrow/invoice/:token', async (req, res) => {
    try {
        const result = await walletControllerInstance.viewPublicInvoice(req.params.token);
        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

walletRouter.get('/escrow/tracking/:token', async (req, res) => {
    try {
        const result = await walletControllerInstance.viewTrackingInvoice(req.params.token);
        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

walletRouter.post('/escrow/request-approval-code/:token', async (req, res) => {
    try {
        const result = await walletControllerInstance.requestApprovalCode(req.params.token);
        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

walletRouter.post('/escrow/:escrowId/milestones/:milestoneId/submit', async (req, res) => {
    try {
        const result = await walletControllerInstance.submitMilestone(
            req.params.escrowId,
            req.params.milestoneId,
            req.body.submissionDetails,
            req.headers.authorization
        );
        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

walletRouter.post('/escrow/guest-release/:token/milestones/:milestoneId', async (req, res) => {
    try {
        const result = await walletControllerInstance.guestApproveMilestone(
            req.params.token,
            req.params.milestoneId,
            req.body.approvalCode,
            req.headers.authorization
        );
        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

walletRouter.post('/escrow/guest-reject/:token/milestones/:milestoneId', async (req, res) => {
    try {
        const result = await walletControllerInstance.guestRejectMilestone(
            req.params.token,
            req.params.milestoneId,
            req.body.reason
        );
        res.status(result.statusCode).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});

export default walletRouter;