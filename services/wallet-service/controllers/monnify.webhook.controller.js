import crypto from 'crypto';
import { walletService } from '../services/wallet.service.js'; 

const walletServiceInstance = new walletService();

export const handleMonnifyWebhook = async (req, res) => {
    try {
        const monnifySignature = req.headers['monnify-signature'];
        const monnifyIP = '35.242.133.146';
        const incomingIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        if (!incomingIP.includes(monnifyIP)) {
            console.warn(`[SECURITY] Blocked unauthorized webhook attempt from IP: ${incomingIP}`);
            return res.status(403).send('Forbidden');
        }   
        
        const expectedSignature = crypto
            .createHmac('sha512', process.env.MONNIFY_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (expectedSignature !== monnifySignature) {
            console.error('[SECURITY] Monnify Webhook Signature Mismatch!');
            return res.status(200).json({ message: 'Webhook Received' }); 
        }

        res.status(200).json({ message: 'Webhook received successfully' });

        const { eventType, eventData } = req.body;

        if (eventType === 'SUCCESSFUL_TRANSACTION') {
            
            const amountInKobo = Math.round(parseFloat(eventData.amountPaid) * 100);

            const wallet = await walletServiceInstance.Wallet.findOne({ 
                'account.accountNumber': eventData.destinationAccountInformation.accountNumber 
            });

            if (!wallet) {
                console.error(`[Webhook Error] Wallet not found for account: ${eventData.destinationAccountInformation.accountNumber}`);
                return;
            }

            const result = await walletServiceInstance.processWalletTransaction({
                userId: wallet.userId,
                amount: amountInKobo, 
                type: 'CREDIT',
                category: 'WALLET_FUNDING',
                description: `Wallet funding via ${eventData.paymentMethod}`,
                reference: eventData.transactionReference, 
                metadata: {
                    senderName: eventData.customer.name,
                    senderEmail: eventData.customer.email,
                    settlementAmount: eventData.settlementAmount
                }
            });

            if (result.success) {
                console.log(`[Webhook Success] Funded wallet for user ${wallet.userId} with ${eventData.amountPaid} NGN`);
            } else {
                console.error(`[Webhook Failed] ${result.message}`);
            }
        }

    } catch (error) {
        console.error('[Webhook System Error]:', error.message);
    }
};