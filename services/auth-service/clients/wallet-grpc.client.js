import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { join } from 'path';

const PROTO_PATH = join(process.cwd(), 'shared/proto/wallet.proto');
const GRPC_HOST = process.env.WALLET_GRPC_HOST || 'localhost:5003';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true, 
    oneofs: true
});

const walletProto = grpc.loadPackageDefinition(packageDefinition).wallet;

const walletClient = new walletProto.WalletService(
    GRPC_HOST,
    grpc.credentials.createInsecure()
);

export default walletClient;