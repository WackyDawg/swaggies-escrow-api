import flwClient from "../client/flw.client.js";
import userClient from "../client/user-grpc.client.js";
import notificationClient from "../client/notification-grpc.client.js";

export class PaymentService {
    constructor() {
        this.flwClient = flwClient;
        this.userClient = userClient;
        this.notificationClient = notificationClient;
    }

    async payUtilityBill(userId, walletId, amount, billerCode, itemCode, customerIdentifier) {
        const session = await this.Wallet.db.startSession();
        try {
            session.startTransaction();
            
            const wallet = await this.Wallet.findById(walletId).session(session);
            if (!wallet || wallet.balance < amount * 100) {
                throw new Error("Insufficient funds for this bill payment.");
            }

            wallet.balance -= (amount * 100);
            await wallet.save({ session });

            const flwPayload = {
                country: "NG",
                customer_id: customerIdentifier,
                amount: amount,
                recurrence: "ONCE",
                type: billerCode,
                reference: generateP2PReference(),
                
            }
            //https://api.flutterwave.com/v3/billers/{biller_code}/items/{item_code}/payment
            const flwResponse = await this.flwClient.post(`/v3/billers/${billerCode}/items/${itemCode}/payment`, flwPayload);

            if (flwResponse.data.status !== 'success') {
                throw new Error("Biller rejected the payment.")
            }

            await this.Transaction.create([{
                userId: userId,
                walletId,
                transactionRef: flwPayload.reference,
                amount: amount * 100,
                type: "DEBIT",
                category: 'BILL_PAYMENT',
                description: `Paid ₦${amount} for ${billerCode} (${customerIdentifier})`,
                status: 'COMPLETED'
            }], { session });

            await session.commitTransaction();

            

            return { success: true, message: "Bill payment successfull", data: flwResponse.data.data }
            
        } catch (error) {
            await session.abortTransaction();
            console.error("Bill payment failed:", error);
            return { success: false, message: "Bill payment failed", data: null }
        } finally {
            session.endSession();
        }
    }
}