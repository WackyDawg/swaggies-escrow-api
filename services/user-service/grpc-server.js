import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import fs from 'fs';
import UserService from './services/user.service.js';

const userServiceInstance = new UserService();

const candidates = [
  new URL('../../shared/proto/user.proto', import.meta.url).pathname,
  new URL('./shared/proto/user.proto', import.meta.url).pathname
];
const PROTO_PATH = candidates.find((p) => fs.existsSync(p)) || candidates[0];
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition).user;

const server = new grpc.Server();

server.addService(protoDescriptor.UserService.service, {
  GetUserProfile: (call, callback) => {
    const { userId } = call.request;
    userServiceInstance.getProfile(userId)
      .then(user => {
        // Map service fields to proto fields
        callback(null, {
          userId: String(user.auth_account_id),
          name: user.name,
          email: user.email
        });
      })
      .catch(err => callback(err));
  },
  findUserByPocketId: (call, callback) => {
    const { swag_id } = call.request;
    userServiceInstance.getUserByPocketId(swag_id)
      .then(user => {
        callback(null, {
          swag_id: swag_id,
          name: user.name,
          email: user.email
        });
      })
      .catch(err => callback(err));
  },
  CreateUserProfile: (call, callback) => {
    userServiceInstance.createUserProfile(call.request)
      .then(res => callback(null, res))
      .catch(err => callback(err));
  },
  updateUserProfile: (call, callback) => {
    const { userId, profile } = call.request;
    userServiceInstance.updateProfile(userId, profile)
      .then(user => callback(null, {
        userId: userId,
        name: user.name,
        email: user.email
      }))
      .catch(err => callback(err));
  },
  changePin: (call, callback) => {
    const { userId, pin } = call.request;
    userServiceInstance.changePin(userId, pin)
      .then(res => callback(null, { 
        userId: userId, 
        name: "", // Map to match UserResponse if needed
        email: "" 
      }))
      .catch(err => callback(err));
  }
})

const PORT = process.env.GRPC_PORT || 5002;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) throw err;
  console.log(`User gRPC server running on port ${port}`);
  server.start();
});
