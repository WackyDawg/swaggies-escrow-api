import { PaymentService } from "../services/payment.service.js";

const paymentServiceInstance = new PaymentService();

export class PaymentController {
    async payUtilityBill(req, res) {
        try {
            const { userId, walletId, amount, billerCode, itemCode, customerIdentifier } = req.body;
            const result = await paymentServiceInstance.payUtilityBill(userId, walletId, amount, billerCode, itemCode, customerIdentifier);
            return res.status(200).json(result);
        } catch (error) {
            console.error("Error in bill payment:", error);
            return res.status(500).json({ success: false, message: "Bill payment failed", data: null });
        }
    }
}