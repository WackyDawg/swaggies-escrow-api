import axios from 'axios';
import walletTransactionModel from '../models/wallet_transaction.model.js';
import walletModelInstance from '../models/wallet.model.js';
import monnifyClient from '../client/moniffy.client.js';
import { monnifyAuth } from '../utils/monnify.auth.js';
import flwClient from '../client/flw.client.js';
import userClient from '../client/user-grpc.client.js';
import { generateP2PReference, generateDisburseReference } from '../utils/referenceGen.utils.js'


export class walletService {
    constructor(Transaction = walletTransactionModel, Wallet = walletModelInstance, authToken = monnifyAuth) {
        this.Transaction = Transaction,
            this.Wallet = Wallet,
            this.authToken = authToken
    }

    async createWallet(walletData) {
        try {
            const { reference, walletName, customer_firstname, customer_lastname, customer_email, bvn, customer_phone } = walletData;

            const walletRes = await flwClient.post(
                '/v3/virtual-account-numbers',
                {
                    email: customer_email,
                    currency: 'NGN',
                    firstname: customer_firstname,
                    lastname: customer_lastname, 
                    tx_ref: reference,
                    is_permanent: true,
                    narration: walletName || 'Swaggies Wallet',
                    phonenumber: customer_phone,
                    bvn: bvn
                }
            );

            const flwData = walletRes.data.data;
            //console.log('FLW Response:', flwData);

            let finalAccountNumber = flwData.account_number;
            let finalBankName = flwData.bank_name;

            if (flwData.account_number === '0067100155' || flwData.bank_name === 'Mock Bank') {
                console.log('🚧 [SANDBOX] Intercepting static FLW account. Generating unique NUBAN...');
                finalAccountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
                finalBankName = "Swaggies Sandbox Bank";
            }

            const wallet = await this.Wallet.create({
                userId: walletData.userId,
                balance: 0,
                account: [
                    {
                        accountNumber: finalAccountNumber,
                        accountName: `${customer_firstname} ${customer_lastname}`, 
                        bankName: finalBankName,
                        currency: 'NGN',
                        walletReference: reference,
                        walletName: walletName || 'Main Wallet',
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    }
                ]
            });

            return {
                success: true,
                message: "Wallet created successfully",
                code: 200,
                data: { wallet }
            };

        } catch (error) {
            console.error("Wallet Creation Error:", error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || error.message,
                data: null,
                code: error.response?.status || 500
            };
        }
    }

    async getWallet(walletId) {
        try {
            const walletRes = await monnifyClient.get(`/api/v1/disbursements/wallet/${walletId}`);
            const data = walletRes.data;
            return {
                data: {
                    data
                },
                code: 200,
                message: 'Wallet retrieved successfully'
            }
        } catch (error) {
            throw new Error({ message: error.message })
        }
    }

    async getBalance(accNumber) {
        try {
            // Check local DB first for the account
            const walletDoc = await this.Wallet.findOne({ 'account.accountNumber': accNumber });
            const account = walletDoc?.account?.find(a => a.accountNumber === accNumber);

            // If it's a sandbox account, return the local balance immediately
            if (account && account.bankName === "Swaggies Sandbox Bank") {
                return {
                    code: 200,
                    success: true,
                    message: "Sandbox Balance retrieved successfully",
                    data: {
                        "balance": walletDoc.balance,
                        "currency": "NGN",
                        "ledgerBalance": walletDoc.balance,
                        "availableBalance": walletDoc.balance,
                        "lastUpdated": new Date(account.updatedAt || walletDoc.updatedAt).toISOString()
                    }
                };
            }

            const token = await this.authToken(); const walletRes = await monnifyClient.get(
                '/api/v1/disbursements/wallet/balance',
                {
                    params: {
                        accountNumber: accNumber
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const apiData = walletRes.data;

            let lastUpdated = new Date();
            try {
                const walletDoc = await this.Wallet.findOneAndUpdate(
                    { 'account.accountNumber': accNumber },
                    {
                        $set: {
                            balance: apiData.responseBody.ledgerBalance,
                            'account.$.updatedAt': new Date()
                        }
                    },
                    { new: true }
                );
                const account = walletDoc?.account?.find(a => a.accountNumber === accNumber);
                lastUpdated = account?.updatedAt || walletDoc?.updatedAt || lastUpdated;
            } catch (e) {
            }

            return {
                code: 200,
                success: apiData.requestSuccessful,
                message: apiData.responseMessage,
                data: {
                    "balance": apiData.responseBody.ledgerBalance,
                    "currency": "NGN",
                    "ledgerBalance": apiData.responseBody.ledgerBalance,
                    "availableBalance": apiData.responseBody.availableBalance,
                    //"pendingBalance": 5000.00,
                    "lastUpdated": new Date(lastUpdated).toISOString()
                }
            };

        } catch (error) {
            // If Monnify fails but we have the account locally, fallback to DB data
            const walletDoc = await this.Wallet.findOne({ 'account.accountNumber': accNumber });
            if (walletDoc) {
                const account = walletDoc.account.find(a => a.accountNumber === accNumber);
                return {
                    code: 200,
                    success: true,
                    message: "Balance retrieved from local cache (Provider sync failed)",
                    data: {
                        "balance": walletDoc.balance,
                        "currency": "NGN",
                        "ledgerBalance": walletDoc.balance,
                        "availableBalance": walletDoc.balance,
                        "lastUpdated": new Date(account.updatedAt || walletDoc.updatedAt).toISOString()
                    }
                };
            }

            return {
                "success": false,
                "message": "Failed to fetch wallet balance",
                "error": {
                    "code": "BALANCE_FETCH_FAILED",
                    "details": "Failed to fetch wallet balance please try again later",
                },
                "timestamp": Date.now(),
                code: error.response?.status || 500
            };
        }
    }

    async getTransactions(accNumber, page = 1) {
        try {
            // Check local DB first for the account
            const walletDoc = await this.Wallet.findOne({ 'account.accountNumber': accNumber });
            const account = walletDoc?.account?.find(a => a.accountNumber === accNumber);

            // If it's a sandbox account, return local transactions
            if (account && account.bankName === "Swaggies Sandbox Bank") {
                const transactions = await this.Transaction.find({ walletId: walletDoc._id })
                    .sort({ createdAt: -1 })
                    .limit(50);

                return {
                    success: true,
                    message: "Sandbox transactions retrieved",
                    code: 200,
                    data: transactions.map(tx => ({
                        tx_ref: tx.transactionRef,
                        monnify_ref: tx.metadata?.flutterwaveRef || "N/A",
                        amount: tx.amount,
                        transaction_date: tx.createdAt,
                        transaction_type: tx.type,
                        status: tx.status,
                        narration: tx.description,
                        balance_before: tx.balanceBefore,
                        balance_after: tx.balanceAfter
                    })),
                    pagination: {
                        page: 0,
                        pageSize: 50,
                        totalPages: 1,
                        totalElements: transactions.length,
                        isFirst: true,
                        isLast: true
                    }
                };
            }

            const walletRes = await monnifyClient.get(`/api/v1/disbursements/wallet/transactions`,
                {
                    params: {
                        accountNumber: accNumber,
                        pageSize: 6,
                        pageNo: page
                    }
                }
            );

            const responseData = walletRes.data;
            const transactions = responseData.responseBody.content;

            return {
                success: responseData.requestSuccessful,
                message: responseData.responseMessage,
                code: 200,
                data: transactions.map(tx => ({
                    tx_ref: tx.walletTransactionReference,
                    monnify_ref: tx.monnifyTransactionReference,
                    amount: tx.amount,
                    transaction_date: tx.transactionDate,
                    transaction_type: tx.transactionType,
                    status: tx.status,
                    narration: tx.narration,
                    balance_before: tx.availableBalanceBefore,
                    balance_after: tx.availableBalanceAfter
                })),
                pagination: {
                    page: responseData.responseBody.number,
                    pageSize: responseData.responseBody.size,
                    totalPages: responseData.responseBody.totalPages,
                    totalElements: responseData.responseBody.totalElements,
                    isFirst: responseData.responseBody.first,
                    isLast: responseData.responseBody.last
                }
            };
        } catch (error) {
            // Fallback to local transactions if provider fails
            const walletDoc = await this.Wallet.findOne({ 'account.accountNumber': accNumber });
            if (walletDoc) {
                const transactions = await this.Transaction.find({ walletId: walletDoc._id })
                    .sort({ createdAt: -1 })
                    .limit(50);

                return {
                    success: true,
                    message: "Transactions retrieved from local cache (Provider sync failed)",
                    code: 200,
                    data: transactions.map(tx => ({
                        tx_ref: tx.transactionRef,
                        monnify_ref: "N/A",
                        amount: tx.amount,
                        transaction_date: tx.createdAt,
                        transaction_type: tx.type,
                        status: tx.status,
                        narration: tx.description,
                        balance_before: tx.balanceBefore,
                        balance_after: tx.balanceAfter
                    })),
                    pagination: null
                };
            }

            return {
                success: false,
                message: error.response?.data?.responseMessage || error.message,
                data: [],
                pagination: null,
                code: error.response?.status || 500
            };
        }
    }

    async p2pTransfer(senderId, receiverAccountNumber, amountInKobo, description) {
        const session = await this.Wallet.db.startSession();

        try {
            session.startTransaction();

            const senderWallet = await this.Wallet.findOne({ userId: senderId }).session(session);
            if (!senderWallet) throw new Error("Sender wallet not found.");
            if (senderWallet.balance < amountInKobo) throw new Error("Insufficient funds.");

            const receiverWallet = await this.Wallet.findOne({ 'account.accountNumber': receiverAccountNumber }).session(session);
            if (!receiverWallet) throw new Error("Recipient account not found.");
            if (String(senderWallet._id) === String(receiverWallet._id)) throw new Error("Cannot transfer to yourself.");

            const trxRefOut = generateP2PReference('OUT');
            const trxRefIn = generateP2PReference('IN');

            const senderBalanceBefore = senderWallet.balance;
            senderWallet.balance -= amountInKobo;
            await senderWallet.save({ session });

            const receiverBalanceBefore = receiverWallet.balance;
            receiverWallet.balance += amountInKobo;
            await receiverWallet.save({ session });

            await this.Transaction.create([{
                userId: senderWallet.userId,
                walletId: senderWallet._id,
                transactionRef: trxRefOut,
                amount: amountInKobo,
                type: 'DEBIT',
                category: 'TRANSFER_OUT',
                status: 'COMPLETED',
                description: description || `Transfer to ${receiverWallet.account[0].accountName}`,
                balanceBefore: senderBalanceBefore,
                balanceAfter: senderWallet.balance,
                recipient: {
                    accountNumber: receiverWallet.account[0].accountNumber,
                    accountName: receiverWallet.account[0].accountName,
                    bankName: "Swaggies Internal"
                }
            }], { session });

            await this.Transaction.create([{
                userId: receiverWallet.userId,
                walletId: receiverWallet._id,
                transactionRef: trxRefIn,
                amount: amountInKobo,
                type: 'CREDIT',
                category: 'TRANSFER_IN',
                status: 'COMPLETED',
                description: `Transfer from ${senderWallet.account[0].accountName}`,
                balanceBefore: receiverBalanceBefore,
                balanceAfter: receiverWallet.balance,
                recipient: {
                    accountNumber: senderWallet.account[0].accountNumber,
                    accountName: senderWallet.account[0].accountName,
                    bankName: "Swaggies Internal"
                }
            }], { session });

            await session.commitTransaction();

            return {
                success: true,
                message: "Transfer successful",
                responseCode: 0,
                status: "success",
                data: {
                    amount: amountInKobo / 100,
                    reference: trxRefOut,
                    //newBalance: senderWallet.balance / 100,
                    senderInfo: {
                        sourceAccountNumber: senderWallet.account[0].accountNumber,
                        sourceAccountName: senderWallet.account[0].accountName,
                    },
                    recipientInfo: {
                        destinationAccountName: receiverWallet.account[0].accountName,
                        destinationBankName: "Swaggies Internal",
                        destinationAccountNumber: receiverWallet.account[0].accountNumber,
                    }
                }
            };

        } catch (error) {
            await session.abortTransaction();
            console.error("P2P Transfer Error:", error.message);
            
            return {
                success: false,
                message: error.message
            };
        } finally {
            session.endSession();
        }
    }

    async disburseTransfer(senderId, destinationBankCode, destinationAccountNumber, amountInKobo, description) {
        const session = await this.Wallet.db.startSession();
        try {
            session.startTransaction();

            const senderWallet = await this.Wallet.findOne({ userId: senderId }).session(session);
            if (!senderWallet) throw new Error("Sender wallet not found.");
            if (senderWallet.balance < amountInKobo) throw new Error("Insufficient funds.");

            const balanceBefore = senderWallet.balance;
            senderWallet.balance -= amountInKobo;
            await senderWallet.save({ session });
            
            const trxRef = generateDisburseReference();

            const flwPayload = {
                account_bank: destinationBankCode,
                account_number: destinationAccountNumber,
                amount: amountInKobo / 100, 
                narration: description || "Swaggies Withdrawal",
                currency: "NGN",
                reference: trxRef
            };

            const flwResponse = await flwClient.post('/v3/transfers', flwPayload);
            const responseData = flwResponse.data;

            if (responseData.status !== 'success') {
                throw new Error(responseData.message || "Transfer rejected by provider.");
            }

            await this.Transaction.create([{
                userId: senderWallet.userId,
                walletId: senderWallet._id,
                transactionRef: trxRef,
                amount: amountInKobo,
                type: 'DEBIT',
                category: 'WALLET_WITHDRAWAL', 
                status: 'COMPLETED',
                description: description || "Swaggies Withdrawal",
                balanceBefore: balanceBefore,
                balanceAfter: senderWallet.balance,
                recipient: {
                    accountNumber: destinationAccountNumber,
                    bankCode: destinationBankCode,
                    bankName: responseData.data?.bank_name || "External Bank",
                    accountName: responseData.data?.full_name || "External Account"
                },
                metadata: {
                    flwTransferId: responseData.data?.id
                }
            }], { session });

            await session.commitTransaction();
            
            return {
                success: true,
                message: "Withdrawal initiated successfully",
                data: {
                    transactionRef: trxRef,
                    amount: amountInKobo / 100,
                    narration: description || "Swaggies Withdrawal",
                    recipient: {
                        accountNumber: destinationAccountNumber,
                        accountName: responseData.data?.full_name || "External Account",
                        bankName: responseData.data?.bank_name || "External Bank"
                    }
                }
            };
            
        } catch (error) {
            await session.abortTransaction();
            console.error("Disbursement Error:", error.response?.data || error.message);
            
            return { 
                success: false, 
                message: error.response?.data?.message || error.message 
            };
        } finally {
            session.endSession();
        }
    }

    //To Do: USD Vault
    async convertNgntoUsd(userId, amountInNgn) {
        const exchangeRate = await axios.get(`https://api.exchangerate.host/live?access_key=${process.env.EXCHANGE_RATE_API_KEY}&symbols=USD`)
        const EXCHANGE_RATE = exchangeRate.data.quotes.USDNGN;
        const amountInKobo = Math.round(amountInNgn * 100);

        const amountInCents = Math.round((amountInNgn / EXCHANGE_RATE) * 100);
        const session = await this.Wallet.db.startSession();
        try {
            session.startTransaction();

            const wallet = await this.Wallet.findOne({ userId }).session(session);
            if (!wallet) throw new Error("Wallet not found");

            if (wallet.balance < amountInKobo) {
                throw new Error("Insufficient NGN balance for conversion.");
            }

            wallet.balance -= amountInKobo;
            wallet.usdBalance += amountInCents;

            await wallet.save({ session });

            await this.Transaction.create([{
                userId,
                walletId: wallet._id,
                transactionRef: `FX_OUT_${Date.now()}`,
                amount: amountInKobo,
                type: 'DEBIT',
                category: 'FX_CONVERSION',
                currency: 'NGN',
                description: `Converted ₦${amountInNgn.toLocaleString()} to USD`,
                status: 'COMPLETED'
            }], { session });

            await this.Transaction.create([{
                userId,
                walletId: wallet._id,
                transactionRef: `FX_IN_${Date.now()}`,
                amount: amountInCents,
                type: 'CREDIT',
                category: 'FX_CONVERSION',
                currency: 'USD',
                description: `Received $${(amountInCents / 100).toFixed(2)} from NGN swap`,
                status: 'COMPLETED',
                metadata: { currency: 'USD' }
            }], { session });

            await session.commitTransaction();

            return {
                success: true,
                message: `Successfully secured $${(amountInCents / 100).toFixed(2)} in your USD Vault.`,
                data: {
                    ngnBalance: (wallet.balance / 100).toFixed(2),
                    usdBalance: (wallet.usdBalance / 100).toFixed(2),
                    exchangeRate: EXCHANGE_RATE
                }
            }
            
        } catch (error) {
            await session.abortTransaction();
            console.error("FX Conversion Error:", error);
            return {
                success: false,
                message: error.message || "Failed to convert NGN to USD."
            }
        } finally {
            session.endSession();
        }
    }

    //Verification functions
    async resolveBankAcc(verifyData) {
        try {
            const verify = await monnifyClient.get(`/api/v1/disbursements/account/validate`,
                {
                    params: {
                        accountNumber: verifyData.accountNumber,
                        bankCode: verifyData.bankCode
                    }
                }
            )
            const data = verify.response.data;
            return {
                "success": true,
                "message": "success",
                "data": {
                    "accountNumber": data.responseBody.accountNumber,
                    "accountName": data.responseBody.accountName,
                    "bankCode": data.responseBody.bankCode,
                },
                "timestamp": Date.now(),
            }
        } catch (error) {
            return {
                "success": false,
                "message": "Account resolution failed",
                "error": {
                    "code": "ACCOUNT_NOT_FOUND",
                    "details": "Could not find account with the provided details"
                },
                "timestamp": "2024-12-13T10:30:00.000Z"
            }
        }
    }

    async verifyBvn(bvnData) {
        try {
            const data = {
                bvn: bvnData.bvn,
                name: bvnData.full_name,
                dateOfBirth: bvnData.dateOfBirth, //should be in this format dd-m-yyyy 
                mobileNo: bvnData.mobileNo
            }
            const bvnData = await monnifyClient.post('/api/v1/vas/bvn-details-match',
                data
            )
            const resData = bvnData.response.data;
            return {
                success: true,
                message: 'successfull',
                details: {
                    bvn_no: resData.responseBody.bvn,
                    assoc_name: {
                        matchStatus: resData.responseBody.name.matchStatus,
                        matchPercentage: resData.responseBody.name.matchPercentage
                    }
                }
            }
        } catch (error) {
            return {
                success: false,
                message: 'unsucessfull',
                data: null
            }
        }
    }

    async bvnAccountNameMatch(reqData) {
        try {
            const data = {
                bankCode: reqData.bankCode,
                accountNumber: reqData.accountNumber,
                bvn: reqData.bvn_number
            }

            const verifyResult = await monnifyClient.post(`/api/v1/vas/bvn-account-match`, data);
            const resData = verifyResult.response.data;
            return {
                success: true,
                message: 'successfull',
                details: {
                    bvn_no: resData.responseBody.bvn,
                    assoc_name: {
                        accountName: resData.responseBody.accountName,
                        accountNumber: resData.responseBody.accountNumber,
                        matchStatus: resData.responseBody.matchStatus,
                        matchPercentage: resData.responseBody.matchPercentage
                    }
                }
            }
        } catch (error) {
            return {
                success: false,
                message: 'unsucessfull',
                data: null
            }
        }
    }

    async processWalletTransaction(transactionData) {
        const session = await this.Wallet.db.startSession();
        try {
            session.startTransaction();
            const {
                userId,
                amount,
                type,
                category,
                description,
                reference,
                metadata = {}
            } = transactionData;

            const wallet = await this.Wallet.findOne({ userId }).session(session);

            if (!wallet) {
                throw new Error('Wallet not found for this user');
            }

            const balanceBefore = wallet.balance;
            let balanceAfter;

            if (type === 'DEBIT') {
                if (wallet.balance < amount) {
                    throw new Error('Insufficient funds');
                }
                balanceAfter = wallet.balance - amount;
            } else if (type === 'CREDIT') {
                balanceAfter = wallet.balance + amount;
            } else {
                throw new Error('Invalid transaction type. Must be CREDIT or DEBIT.');
            }

            const [newTransaction] = await this.Transaction.create([{
                userId: wallet.userId,
                walletId: wallet._id,
                transactionRef: reference,
                amount,
                currency: wallet.account[0]?.currency || 'NGN',
                type,
                category,
                status: 'COMPLETED',
                description,
                balanceBefore,
                balanceAfter,
                metadata
            }], { session });

            wallet.balance = balanceAfter;
            
            if (wallet.account && wallet.account.length > 0) {
                wallet.account[0].updatedAt = Date.now();
            }
            
            await wallet.save({ session });
            await session.commitTransaction();

            return {
                success: true,
                message: 'Transaction processed successfully',
                data: newTransaction
            };

        } catch (error) {
            await session.abortTransaction();
            
            return {
                success: false,
                message: error.message || 'Failed to process transaction',
                data: null
            };
        } finally {
            session.endSession();
        }
    }
}