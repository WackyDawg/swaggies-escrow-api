import { walletService } from '../services/wallet.service.js';

const walletServiceInstance = new walletService();

export default class walletController {
    constructor(walletService = walletServiceInstance) {
        this.walletService = walletService
    }

    async createWallet(req, res) {
        try {
            const walletRes = await this.walletService.createWallet(req.body);
            res.status(walletRes.code).json(walletRes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getWallet(req, res) {
        try {
            const walletRes = await this.walletService.getWallet(req.params.walletId);
            res.status(walletRes.code).json(walletRes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getWalletBal(req, res) {
        try {
            const walletBal = await this.walletService.getBalance(req.params.accountNumber);
            res.status(walletBal.code).json(walletBal);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getWalletTrans(req, res) {
        try {
            const walletTrans = await this.walletService.getTransactions(req.params.accountNumber);
            res.status(walletTrans.code || 200).json(walletTrans);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async initiateTransfer(req, res) {
        try {
            const senderId = req.user.userId;
            const { transfer_type, amount, description } = req.body;

            if (!transfer_type || !['p2p', 'disburse'].includes(transfer_type)) {
                return res.status(400).json({ success: false, message: "Invalid transfer_type. Must be 'p2p' or 'disburse'." });
            }

            if (!amount || amount <= 0) {
                return res.status(400).json({ success: false, message: "Valid amount is required." });
            }

            const amountInKobo = Math.round(parseFloat(amount) * 100);
            let result;

            if (transfer_type === 'p2p') {
                const { receiverAccountNumber } = req.body;
                
                if (!receiverAccountNumber) {
                    return res.status(400).json({ success: false, message: "Receiver Account Number is required for P2P transfers." });
                }
                
                result = await this.walletService.p2pTransfer(senderId, receiverAccountNumber, amountInKobo, description);
                
            } else if (transfer_type === 'disburse') {
                const { account_number, bank_code } = req.body;
                
                if (!account_number || !bank_code) {
                    return res.status(400).json({ success: false, message: "Account number and bank code are required for disburse transfers." });
                }
                
                result = await this.walletService.disburseTransfer(senderId, bank_code, account_number, amountInKobo, description);
            }

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                return res.status(result.code || 400).json({
                    success: false,
                    message: result.message,
                    error: result.error || null
                });
            }
            
        } catch (error) {
            console.error("Transfer Controller Error:", error);
            return res.status(500).json({ 
                success: false, 
                message: error.message || "Internal server error during transfer processing." 
            });
        }
    }

    async convertToUsd(req, res) {
        try {
           const userId = req.user.userId;
           const { amountInNgn } = req.body;

           if (!amountInNgn || amountInNgn <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid NGN amount to convert.'
            })
           }

           const result = await walletServiceInstance.convertNgntoUsd(userId, amountInNgn);
           return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            console.error("Convert to USD Controller Error:", error);
            return res.status(500).json({ 
                success: false, 
                message: error.message || "Internal server error during USD conversion."
            });
        }
    }
}
