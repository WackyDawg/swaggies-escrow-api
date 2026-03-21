import axios from 'axios';

const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL || 'http://127.0.0.1:3003'

export class walletClient {
    constructor() { }

    async getWalletBalance(accountNumber, authorization) {
        try {
            const response = await axios.get(`${WALLET_SERVICE_URL}/api/v1/wallet/balance/${accountNumber}`,
                {
                    headers: {
                        'Authorization': `${authorization}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const statusCode = response.data?.statusCode ?? response.status;
            return { ...response.data, statusCode };
        } catch (error) {
            throw {
                message: error.response?.data?.message || error.message || 'Request failed',
                statusCode: error.response?.status
            };
        }
    }

    async getWalletTransactions(accountNumber, authorization) {
        try {
            const response = await axios.get(`${WALLET_SERVICE_URL}/api/v1/wallet/wallet-transactions/${accountNumber}`,
                {
                    headers: {
                        'Authorization': `${authorization}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const statusCode = response.data?.statusCode ?? response.status;
            return { ...response.data, statusCode };
        } catch (error) {
            throw {
                message: error.response?.data?.message || error.message || 'Request failed',
                statusCode: error.response?.status
            };
        }
    }
    
    async initiateTransfer(transferData, authorization) {
        try {
          const transferRes = await axios.post(`${WALLET_SERVICE_URL}/api/v1/wallet/initiate-transfer`,
            transferData,
            {
                headers: {
                    'Authorization': `${authorization}`,
                    'Content-Type': 'application/json'
                }
            }
          )
          const statusCode = transferRes.data?.statusCode ?? transferRes.status;
          return { ...transferRes.data, statusCode }
        } catch (error) {
          throw {
            message: error.response?.data?.message || error.message || 'Failed to initiate transfer'
          }
        }
    }

    async createEscrow(escrowData, authorization) {
        try {
            const response = await axios.post(`${WALLET_SERVICE_URL}/api/v1/escrow/create`, escrowData, {
                headers: {
                    'Authorization': authorization,
                    'Content-Type': 'application/json'
                }
            });
            const statusCode = response.data?.statusCode ?? response.status;
            return { ...response.data, statusCode };
        } catch (error) {
            throw {
                message: error.response?.data?.message || error.message || 'Escrow creation failed',
                statusCode: error.response?.status
            };
        }
    }

    async fundEscrow(escrowId, authorization) {
        try {
            const response = await axios.post(`${WALLET_SERVICE_URL}/api/v1/escrow/${escrowId}/fund`, {}, {
                headers: {
                    'Authorization': authorization,
                    'Content-Type': 'application/json'
                }
            });
            const statusCode = response.data?.statusCode ?? response.status;
            return { ...response.data, statusCode };
        } catch (error) {
            throw {
                message: error.response?.data?.message || error.message || 'Escrow funding failed',
                statusCode: error.response?.status
            };
        }
    }

    async releaseEscrow(escrowId, authorization) {
        try {
            const response = await axios.post(`${WALLET_SERVICE_URL}/api/v1/escrow/${escrowId}/release`, {}, {
                headers: {
                    'Authorization': authorization,
                    'Content-Type': 'application/json'
                }
            });
            const statusCode = response.data?.statusCode ?? response.status;
            return { ...response.data, statusCode };
        } catch (error) {
            throw {
                message: error.response?.data?.message || error.message || 'Escrow release failed',
                statusCode: error.response?.status
            };
        }
    }

    async generateInvoiceLink(escrowData, authorization) {
        try {
            const response = await axios.post(`${WALLET_SERVICE_URL}/api/v1/escrow/invoice/generate`, escrowData, {
                headers: {
                    'Authorization': authorization,
                    'Content-Type': 'application/json'
                }
            });
            const statusCode = response.data?.statusCode ?? response.status;
            return { ...response.data, statusCode };
        } catch (error) {
            throw {
                message: error.response?.data?.message || error.message || 'Invoice generation failed',
                statusCode: error.response?.status
            };
        }
    }

    async viewPublicInvoice(token) {
        try {
            const response = await axios.get(`${WALLET_SERVICE_URL}/api/v1/escrow/invoice/${token}`);
            const statusCode = response.data?.statusCode ?? response.status;
            return { ...response.data, statusCode };
        } catch (error) {
            throw {
                message: error.response?.data?.message || error.message || 'Failed to fetch invoice',
                statusCode: error.response?.status
            };
        }
    }

    async viewTrackingInvoice(token) {
        try {
            const response = await axios.get(`${WALLET_SERVICE_URL}/api/v1/escrow/tracking/${token}`);
            const statusCode = response.data?.statusCode ?? response.status;
            return { ...response.data, statusCode };
        } catch (error) {
            throw {
                message: error.response?.data?.message || error.message || 'Failed to fetch tracking details',
                statusCode: error.response?.status
            };
        }
    }

    async requestApprovalCode(token) {
        try {
            const response = await axios.post(`${WALLET_SERVICE_URL}/api/v1/escrow/request-approval-code/${token}`);
            const statusCode = response.data?.statusCode ?? response.status;
            return { ...response.data, statusCode };
        } catch (error) {
            throw {
                message: error.response?.data?.message || error.message || 'Failed to request approval code',
                statusCode: error.response?.status
            };
        }
    }

    async submitMilestone(escrowId, milestoneId, submissionDetails, authorization) {
        try {
            const response = await axios.post(`${WALLET_SERVICE_URL}/api/v1/escrow/${escrowId}/milestones/${milestoneId}/submit`, { submissionDetails }, {
                headers: {
                    'Authorization': authorization,
                    'Content-Type': 'application/json'
                }
            });
            const statusCode = response.data?.statusCode ?? response.status;
            return { ...response.data, statusCode };
        } catch (error) {
            throw {
                message: error.response?.data?.message || error.message || 'Milestone submission failed',
                statusCode: error.response?.status
            };
        }
    }

    async rejectMilestone(token, milestoneId, reason) {
        try {
            const response = await axios.post(`${WALLET_SERVICE_URL}/api/v1/escrow/guest-reject/${token}/milestones/${milestoneId}`, { reason });
            const statusCode = response.data?.statusCode ?? response.status;
            return { ...response.data, statusCode };
        } catch (error) {
            throw {
                message: error.response?.data?.message || error.message || 'Milestone rejection failed',
                statusCode: error.response?.status
            };
        }
    }

    async guestApproveMilestone(token, milestoneId, approvalCode, authorization) {
        try {
            const response = await axios.post(`${WALLET_SERVICE_URL}/api/v1/escrow/guest-release/${token}/milestones/${milestoneId}`, { approvalCode }, {
                headers: {
                    'Authorization': authorization,
                    'Content-Type': 'application/json'
                }
            });
            const statusCode = response.data?.statusCode ?? response.status;
            return { ...response.data, statusCode };
        } catch (error) {
            throw {
                message: error.response?.data?.message || error.message || 'Guest milestone approval failed',
                statusCode: error.response?.status
            };
        }
    }

    async handleFlwWebhook(webhookData) {
        try {
            const response = await axios.post(`${WALLET_SERVICE_URL}/api/v1/wallet/webhooks-flutterwave`, webhookData);
            const statusCode = response.data?.statusCode ?? response.status;
            
            // Safe handling if data is just a string (not an object)
            if (typeof response.data !== 'object' || response.data === null) {
                return { message: response.data, statusCode };
            }
            
            return { ...response.data, statusCode };
        } catch (error) {
            throw {
                message: error.response?.data?.message || error.message || 'Failed to handle FLW webhook',
                statusCode: error.response?.status
            };
        }
    }

    async handleMonnifyWebhook(webhookData) {
        try {
            const response = await axios.post(`${WALLET_SERVICE_URL}/api/v1/wallet/webhooks-monnify`, webhookData);
            const statusCode = response.data?.statusCode ?? response.status;
            
            if (typeof response.data !== 'object' || response.data === null) {
                return { message: response.data, statusCode };
            }

            return { ...response.data, statusCode };
        } catch (error) {
            throw {
                message: error.response?.data?.message || error.message || 'Failed to handle Monnify webhook',
                statusCode: error.response?.status
            };
        }
    }
}
