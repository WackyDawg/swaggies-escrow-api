import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import fs from 'fs';
import { walletService } from './services/wallet.service.js';

const walletServiceInstance = new walletService();

const candidates = [
  new URL('../../shared/proto/wallet.proto', import.meta.url).pathname,
  new URL('./shared/proto/wallet.proto', import.meta.url).pathname
];
const PROTO_PATH = candidates.find((p) => fs.existsSync(p)) || candidates[0];

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition).wallet;

const server = new grpc.Server();

server.addService(protoDescriptor.WalletService.service, {
  CreateWallet: async (call, callback) => {
    try {
      const { 
        userId, 
        reference, 
        walletName, 
        customer_firstname, 
        customer_lastname, 
        customer_email, 
        bvn, 
        customer_phone 
      } = call.request;

      const result = await walletServiceInstance.createWallet({
        userId,
        reference,
        walletName,
        customer_firstname,
        customer_lastname,
        customer_email,
        bvn,
        customer_phone
      });

      const wallet = result?.data?.wallet || null;
      const response = {
        success: !!result?.success || result?.code === 200,
        message: result?.message || '',
        data: wallet
          ? {
              walletId: String(wallet._id || ''),
              balance: Number(wallet.balance || 0),
              accounts: (wallet.account || []).map(a => ({
                accountNumber: String(a.accountNumber || ''),
                accountName: String(a.accountName || ''),
                bankCode: String(a.bankCode || ''),
                bankName: String(a.bankName || ''),
                created_at: String(a.created_at || '')
              }))
            }
          : undefined
      };
      callback(null, response);
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message || 'Internal' });
    }
  }
});

const PORT = process.env.GRPC_PORT || 5003;

server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) throw err;
  console.log(`[Wallet-Service] gRPC server running on port ${port}`);
  server.start();
});