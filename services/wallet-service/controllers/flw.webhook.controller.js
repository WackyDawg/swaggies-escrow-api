import { walletService } from "../services/wallet.service.js";
import { EscrowService } from "../services/escrow.service.js";
import Escrow from "../models/escrow.model.js";

const walletServiceInstance = new walletService();
const escrowService = new EscrowService();

export const handleFlutterwaveWebhook = async (req, res) => {
    try {
        const secretHash = process.env.FLW_SECRET_HASH;
        const signature = req.headers['verif-hash'];

        if (!signature || signature !== secretHash) {
            console.warn('[SECURITY] Blocked unauthorized or missing verif-hash header');
            return res.status(200).json({ message: 'Webhook Received' });
        }

        res.status(200).json({ message: 'Webhook Received' });

        const payload = req.body;
        
        if (payload.status === 'successful') {
            
            const txRef = payload.txRef || payload.tx_ref; 
            const flwRef = payload.flwRef || payload.flw_ref;
            const amount = payload.amount;
            const id = payload.id;
            const customer = payload.customer;
            const currency = payload.currency;

            if (currency !== 'NGN') {
                console.warn(`[Webhook Warning] Unsupported currency received: ${currency}`);
                return;
            }

            if (!txRef) {
                console.error('[Webhook Error] Transaction reference is missing from payload.');
                return;
            }

            if (txRef.startsWith('ESC_GUEST_')) {
                console.log(`Processing Escrow Payment. Ref: ${txRef}`);
                
                const token = txRef.split('_')[2]; 

                await escrowService.handleEscrowPayment(token);
                
                return; 
            }

            const transactionReference = `FLW_FUND_${id}`;

            const existingTx = await walletServiceInstance.Transaction.findOne({ 
                transactionRef: transactionReference 
            });

            if (existingTx) {
                console.info(`[Webhook Notice] Transaction ${transactionReference} already processed. Skipping...`);
                return;
            }

            const wallet = await walletServiceInstance.Wallet.findOne({ 
                account: { $elemMatch: { walletReference: txRef } }
            });

            if (!wallet) {
                console.error(`[Webhook Error] No wallet found mapped to txRef: ${txRef}`);
                return;
            }

            const amountInKobo = Math.round(parseFloat(amount) * 100);

            const result = await walletServiceInstance.processWalletTransaction({
                userId: wallet.userId,
                amount: amountInKobo, 
                type: 'CREDIT',
                category: 'WALLET_FUNDING',
                description: 'Virtual Account Deposit via Bank Transfer/Card',
                reference: transactionReference,
                metadata: {
                    senderName: customer.fullName || 'External Bank Transfer',
                    senderEmail: customer.email,
                    flutterwaveRef: flwRef,
                    externalProvider: 'flutterwave'
                }
            });

            if (result.success) {
                console.log(`[Webhook Success] Funded wallet of User ${wallet.userId} with ${amount} NGN. Ref: ${transactionReference}`);
            } else {
                console.error(`[Webhook Process Error] Failed to fund user ${wallet.userId} wallet: ${result.message}`);
            }
            
        } else {
            console.info(`[Webhook Notice] Unhandled event or unsuccessful payment. Event: ${payload['event.type']}, Status: ${payload.status}`);
        }

    } catch (error) {
        console.error('[CRITICAL] Flutterwave Webhook System Error:', error);
    }
};