import { jest } from '@jest/globals';
import { walletService } from '../services/wallet.service.js';
import monnifyClient from '../client/moniffy.client.js';
import userClient from '../client/user-grpc.client.js';

// Mock dependencies
jest.mock('../client/moniffy.client.js');
jest.mock('../client/user-grpc.client.js');

describe('walletService', () => {
    let walletServiceInstance;
    let mockTransactionModel;
    let mockWalletModel;
    let mockAuthToken;

    beforeEach(() => {
        jest.clearAllMocks();


        mockTransactionModel = {
            create: jest.fn(),
        };

        mockWalletModel = {
            create: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
            db: {
                startSession: jest.fn().mockResolvedValue({
                    startTransaction: jest.fn(),
                    commitTransaction: jest.fn(),
                    abortTransaction: jest.fn(),
                    endSession: jest.fn(),
                }),
            },
        };

        mockAuthToken = jest.fn().mockResolvedValue('mock-monnify-token');
        walletServiceInstance = new walletService(mockTransactionModel, mockWalletModel, mockAuthToken);
    });

    describe('createWallet', () => {
        it('should successfully create a wallet using monnify', async () => {
            const walletData = {
                userId: 'user-123',
                reference: 'ref-123',
                walletName: 'Test Wallet',
                customer_name: 'John Doe',
                customer_email: 'john@example.com',
                bvn: '12345678901',
                dateOfBirth: '1990-01-01',
            };

            const mockMonnifyResponse = {
                data: {
                    responseBody: {
                        accountNumber: '0123456789',
                        accountName: 'John Doe',
                        walletReference: 'ref-123',
                        walletName: 'Test Wallet',
                    },
                },
            };

            monnifyClient.post.mockResolvedValue(mockMonnifyResponse);

            const mockWalletCreateResponse = {
                _id: 'wallet-doc-123',
                userId: walletData.userId,
                balance: 0,
                account: [{ accountNumber: '0123456789', accountName: 'John Doe' }],
            };
            mockWalletModel.create.mockResolvedValue(mockWalletCreateResponse);

            const result = await walletServiceInstance.createWallet(walletData);

            expect(mockAuthToken).toHaveBeenCalledTimes(1);
            expect(monnifyClient.post).toHaveBeenCalledTimes(1);
            expect(mockWalletModel.create).toHaveBeenCalledTimes(1);
            expect(result.success).toBe(true);
            expect(result.data.wallet._id).toEqual('wallet-doc-123');
        });

        it('should return error if monnify fails', async () => {
            const walletData = { userId: 'user-123' };

            monnifyClient.post.mockRejectedValue({
                response: { data: { responseMessage: 'Monnify error occurred' } },
            });

            const result = await walletServiceInstance.createWallet(walletData);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Monnify error occurred');
        });
    });

    describe('getBalance', () => {
        it('should fetch balance successfully', async () => {
            const accNumber = '0123456789';
            const mockMonnifyResponse = {
                data: {
                    requestSuccessful: true,
                    responseMessage: 'success',
                    responseBody: {
                        ledgerBalance: 5000,
                        availableBalance: 5000,
                    },
                },
            };

            monnifyClient.get.mockResolvedValue(mockMonnifyResponse);
            mockWalletModel.findOneAndUpdate.mockResolvedValue({
                account: [{ accountNumber: accNumber, updatedAt: new Date('2024-01-01') }],
            });

            const result = await walletServiceInstance.getBalance(accNumber);

            expect(monnifyClient.get).toHaveBeenCalledTimes(1);
            expect(mockWalletModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
            expect(result.code).toBe(200);
            expect(result.success).toBe(true);
            expect(result.data.balance).toBe(5000);
        });
    });

    describe('processWalletTransaction', () => {
        it('should successfully process a DEBIT transaction using a valid replica session', async () => {
            const transactionData = {
                userId: 'user-123',
                amount: 1000,
                type: 'DEBIT',
                category: 'TRANSFER_OUT',
                description: 'Paid bills',
                reference: 'txn-ref-123',
            };

            const mockSession = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn(),
            };
            
            mockWalletModel.db.startSession.mockResolvedValue(mockSession);

            const mockWallet = {
                userId: 'user-123',
                balance: 5000,
                account: [{ currency: 'NGN' }],
                save: jest.fn().mockResolvedValue(true),
            };

            mockWalletModel.findOne.mockReturnValue({
                session: jest.fn().mockResolvedValue(mockWallet),
            });

            mockTransactionModel.create.mockResolvedValue([{ _id: 'txn-doc-123' }]);

            const result = await walletServiceInstance.processWalletTransaction(transactionData);

            expect(mockWalletModel.db.startSession).toHaveBeenCalledTimes(1);
            expect(mockWalletModel.findOne).toHaveBeenCalledWith({ userId: 'user-123' });
            expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
            expect(mockSession.endSession).toHaveBeenCalledTimes(1);
            expect(result.success).toBe(true);
            expect(walletServiceInstance.Wallet.findOne().session).toHaveBeenCalledWith(mockSession);
            expect(mockWallet.balance).toBe(4000); // Balance adjusted correctly
        });

        it('should fail a DEBIT transaction if funds are insufficient', async () => {
            const transactionData = {
                userId: 'user-123',
                amount: 5000,
                type: 'DEBIT',
            };

            const mockSession = {
                startTransaction: jest.fn(),
                commitTransaction: jest.fn(),
                abortTransaction: jest.fn(),
                endSession: jest.fn(),
            };
            mockWalletModel.db.startSession.mockResolvedValue(mockSession);

            const mockWallet = {
                balance: 1000, // less than amount
            };
            mockWalletModel.findOne.mockReturnValue({
                session: jest.fn().mockResolvedValue(mockWallet),
            });

            const result = await walletServiceInstance.processWalletTransaction(transactionData);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Insufficient funds');
            expect(mockSession.abortTransaction).toHaveBeenCalledTimes(1);
            expect(mockSession.endSession).toHaveBeenCalledTimes(1);
        });
    });
});
