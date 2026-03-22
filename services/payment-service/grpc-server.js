import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.join(__dirname, "../proto/payment.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    long: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const paymentProto = grpc.loadPackageDefinition(packageDefinition).payment;

const server = new grpc.Server();

server.addService(paymentProto.PaymentService.service, {
    PayUtilityBill: (call, callback) => {
        const { userId, walletId, amount, billerCode, itemCode, customerIdentifier } = call.request;
        paymentServiceInstance.payUtilityBill(userId, walletId, amount, billerCode, itemCode, customerIdentifier)
            .then(result => {
                callback(null, result);
            })
            .catch(error => {
                callback(error, null);
            });
    },
});

server.bindAsync(
    `[IP_ADDRESS]:${process.env.GRPC_PORT || 5005}`,
    grpc.ServerCredentials.createSsl(),
    (error, port) => {
        if (error) {
            logger.error('Failed to bind gRPC server:', error);
            return;
        }
        logger.info(`[Payment-Service] gRPC server running on port ${port}`);
        console.log(`[Payment-Service] gRPC server running on port ${port}`);
    }
);

export default server;