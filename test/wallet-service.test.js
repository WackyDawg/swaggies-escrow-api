import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { join } from 'path';

const PROTO_PATH = join(process.cwd(), '../shared/proto/wallet.proto');
const GRPC_HOST = process.env.WALLET_GRPC_HOST || 'localhost:5003';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const walletProto = grpc.loadPackageDefinition(packageDefinition).wallet;
const client = new walletProto.WalletService(GRPC_HOST, grpc.credentials.createInsecure());

function randomRef() {
  const s = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TEST-${Date.now()}-${s}`;
}

const req = {
  userId: '507f1f77bcf86cd799439011',
  reference: 'ref1684248425966',
  walletName: 'Staging Wallet - ref1684248425966',
  customer_name: 'John Doe',
  customer_email: 'jerry@example.com',
  bvn: '22222222226',
  dateOfBirth: '1994-09-07'
};

console.log('Calling WalletService.CreateWallet on', GRPC_HOST);
console.log('Request:', req);

client.CreateWallet(req, (err, res) => {
  if (err) {
    console.error('gRPC error:', {
      code: err.code,
      message: err.message
    });
    process.exit(1);
  }

  console.log('CreateWallet response:', res);

  if (!res?.success) {
    console.error('CreateWallet failed:', res?.message || 'Unknown error');
    process.exit(1);
  }

  const data = res.data || {};
  console.log('WalletId:', data.walletId || '(none)');
  console.log('Balance:', data.balance ?? '(none)');
  console.log('Accounts:', data.accounts || []);
  process.exit(0);
});