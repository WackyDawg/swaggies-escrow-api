import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { join } from 'path';

const PROTO_PATH = join(process.cwd(), 'shared/proto/user.proto');
const GRPC_HOST = process.env.USER_GRPC_HOST || 'localhost:5002';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true, 
    oneofs: true
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user;

const userClient = new userProto.UserService(
    GRPC_HOST,
    grpc.credentials.createInsecure()
);

export default userClient;