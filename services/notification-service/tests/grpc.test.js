import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROTO_PATH = join(__dirname, '../../../shared/proto/notification.proto');
const GRPC_HOST = process.env.GRPC_HOST || 'localhost:5004';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const notificationProto = grpc.loadPackageDefinition(packageDefinition).notification;
const client = new notificationProto.NotificationService(
  GRPC_HOST,
  grpc.credentials.createInsecure()
);

async function testSendEmail() {
  return new Promise((resolve, reject) => {
    const request = {
      to: 'juden098@gmail.com',
      subject: 'Test Email',
      template: 'verification',
      variables: {
        verificationToken: 'test-token'
      }
    };

    client.SendEmail(request, (error, response) => {
      if (error) {
        console.error('SendEmail failed:', error.message);
        reject(error);
      } else {
        console.log('SendEmail success:', response);
        resolve(response);
      }
    });
  });
}

async function runTests() {
  console.log('Starting Notification Service gRPC Tests...\n');

  try {
    await testSendEmail();
    console.log('\nAll tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\nTests failed:', error);
    process.exit(1);
  }
}

runTests();
