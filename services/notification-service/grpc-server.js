import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { NotificationController } from "./controllers/notification.controller.js";
import fs from 'fs';

const notificationControllerInstance = new NotificationController();

const candidates = [
    new URL('../../shared/proto/notification.proto', import.meta.url).pathname,
    new URL('./shared/proto/notification.proto', import.meta.url).pathname
];

const PROTO_PATH = candidates.find((p) => fs.existsSync(p)) || candidates[0];

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition).notification;
const server = new grpc.Server();

server.addService(protoDescriptor.NotificationService.service, {
  SendEmail: async (call, callback) => {
    try {
      const { to, subject, template, variables } = call.request;
      const result = await notificationControllerInstance.notificationService.sendEmail(to, subject, template, variables);
      callback(null, result);
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  },
});

const PORT = process.env.GRPC_PORT || 5004;

server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) throw err;
  console.log(`[Notification-Service] gRPC server running on port ${port}`);
});