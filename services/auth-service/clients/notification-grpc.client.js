import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { join } from 'path';

const PROTO_PATH = join(process.cwd(), 'shared/proto/notification.proto');
const GRPC_HOST = process.env.NOTIFICATION_GRPC_HOST || 'localhost:5004';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const notificationProto = grpc.loadPackageDefinition(packageDefinition).notification;

const notificationClient = new notificationProto.NotificationService(
  GRPC_HOST,
  grpc.credentials.createInsecure()
);

export default notificationClient;
