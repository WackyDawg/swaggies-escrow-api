import express from 'express';
import { EscrowController } from '../controllers/escrow.controller.js';
import { AuthMiddleware } from '@pocket/shared';

const escrowRouter = express.Router();
const escrowController = new EscrowController();
const auth = new AuthMiddleware();

escrowRouter.get('/invoice/:paymentToken', escrowController.viewPaymentInvoice.bind(escrowController));
escrowRouter.get('/tracking/:trackingToken', escrowController.viewTrackingInvoice.bind(escrowController));
escrowRouter.post('/request-approval-code/:trackingToken', escrowController.requestApprovalCode.bind(escrowController));
escrowRouter.post('/guest-release/:trackingToken/milestones/:milestoneId', escrowController.guestApproveMilestone.bind(escrowController));
escrowRouter.post('/guest-reject/:trackingToken/milestones/:milestoneId', escrowController.guestRejectMilestone.bind(escrowController));

escrowRouter.use((req, res, next) => auth.verifyToken(req, res, next));
escrowRouter.post('/invoice/generate', escrowController.generateInvoiceLink.bind(escrowController));
escrowRouter.post('/create', escrowController.createEscrow.bind(escrowController));
escrowRouter.post('/:escrowId/fund', escrowController.fundEscrow.bind(escrowController));
escrowRouter.post('/:escrowId/release', escrowController.releaseEscrow.bind(escrowController));
escrowRouter.post('/:escrowId/milestones/:milestoneId/submit', escrowController.submitMilestone.bind(escrowController));

export default escrowRouter;