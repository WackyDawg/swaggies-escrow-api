import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { authController } from "./controllers/auth.controller.js";
import fs from 'fs';
 
const authControllerInstance = new authController(); 

const candidates = [
  new URL('../../shared/proto/auth.proto', import.meta.url).pathname,
  new URL('./shared/proto/auth.proto', import.meta.url).pathname
];
const PROTO_PATH = candidates.find((p) => fs.existsSync(p)) || candidates[0];

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition).auth;

const server = new grpc.Server();

server.addService(protoDescriptor.AuthService.service, {
  CreateUser: async (call, callback) => {
    try {
      const { email, password, name, bvn, dateOfBirth } = call.request;
      const req = { body: { email, password, name, bvn, dateOfBirth }, headers: { 'x-forwarded-for': '127.0.0.1' } };
      let statusCode = 200;
      let payload;
      const res = {
        cookie: () => res,
        status: (code) => { statusCode = code; return res; },
        json: (data) => { payload = data; }
      };
      await authControllerInstance.createUser(req, res);
      if (!payload || statusCode >= 400) {
        const err = Object.assign(new Error((payload && payload.message) || 'CreateUser failed'), { code: grpc.status.INVALID_ARGUMENT });
        return callback(err);
      }
      const u = payload.data?.user || {};
      return callback(null, { id: String(u.auth_account_id || ''), email: u.email || '', name: u.name || '' });
    } catch (err) {
      const e = Object.assign(new Error(err.message || 'Internal'), { code: grpc.status.INTERNAL });
      callback(e);
    }
  },
  VerifyUser: async (call, callback) => {
    const { token } = call.request;
    const user = await authControllerInstance.verifyUser({ token });
    callback(null, user);
  },
  LoginUser: async (call, callback) => {
    try {
      const { email, password } = call.request;
      const req = { body: { email, password } };
      let statusCode = 200;
      let payload;
      const res = {
        cookie: () => res,
        status: (code) => { statusCode = code; return res; },
        json: (data) => { payload = data; }
      };
      await authControllerInstance.loginUser(req, res);
      if (!payload || statusCode >= 400) {
        const err = Object.assign(new Error((payload && payload.message) || 'LoginUser failed'), { code: grpc.status.UNAUTHENTICATED });
        return callback(err);
      }
      const u = payload.user || {};
      return callback(null, { accessToken: u.token || '', refreshToken: u.refreshToken || '', userId: String(u.id || '') });
    } catch (err) {
      const e = Object.assign(new Error(err.message || 'Internal'), { code: grpc.status.INTERNAL });
      callback(e);
    }
  },
  ForgotPassword: async (call, callback) => {
    const { email } = call.request;
    const user = await authControllerInstance.forgotPassword({ email });
    callback(null, user);
  },
  ResetPassword: async (call, callback) => {
    const { token, password } = call.request;
    const user = await authControllerInstance.resetPassword({ token, password });
    callback(null, user);
  },
  ChangePassword: async (call, callback) => {
    const { token, password } = call.request;
    const user = await authControllerInstance.changePassword({ token, password });
    callback(null, user);
  },
  Logout: async (call, callback) => {
    const { token } = call.request;
    const user = await authControllerInstance.Logout({ token });
    callback(null, user);
  },
});

const PORT = process.env.GRPC_PORT || 5001;

server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) throw err;
  console.log(`[Auth-Service] gRPC server running on port ${port}`);
  server.start();
});
 