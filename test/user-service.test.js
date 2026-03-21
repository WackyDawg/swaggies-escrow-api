import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const protoPath = path.join(__dirname, '../shared/proto/user.proto');

const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const proto = grpc.loadPackageDefinition(packageDefinition).user;

const client = new proto.UserService(
    'localhost:5002',
    grpc.credentials.createInsecure()
);

console.log(chalk.blue('==> Running gRPC tests against user-service...\n'));

let testResults = {
    passed: 0,
    failed: 0,
    failures: []
};

async function runTest(name, method, payload) {
    return new Promise((resolve) => {
        client[method](payload, (err, response) => {
            if (err) {
                testResults.failed++;
                testResults.failures.push({
                    test: name,
                    error: err.message || err
                });

                console.log(chalk.red(`TEST FAILED: ${name}`));
                console.log(chalk.red(`${err.message}\n`));
                return resolve();
            }

            testResults.passed++;
            console.log(chalk.green(`✔ TEST PASSED: ${name}`));
            console.log(chalk.gray(JSON.stringify(response, null, 2)));
            console.log();
            resolve();
        });
    });
}

async function runAllTests() {
    // 1. Create User Profile
    await runTest(
        "Create User Profile",
        "CreateUserProfile",
        {
            authId: "test-auth-id-user-123",
            name: "Test User",
            email: "testuser@example.com",
            swag_id: "testswag123"
        }
    );

    // 2. Get User Profile
    await runTest(
        "Get User Profile",
        "GetUserProfile",
        {
            userId: "test-auth-id-user-123"
        }
    );

    // 3. Find User by Swag ID
    await runTest(
        "Find User by Swag ID",
        "findUserByPocketId",
        {
            swag_id: "testswag123"
        }
    );

    // 4. Update User Profile
    await runTest(
        "Update User Profile",
        "updateUserProfile",
        {
            userId: "test-auth-id-user-123"
            // The proto for updateUserProfile takes a UserRequest (which only has userId currently)
            // But let's check the proto again to see if it supports other fields
        }
    );

    console.log(chalk.yellow("\n===== TEST SUMMARY ====="));
    console.log(chalk.green(`Passed: ${testResults.passed}`));
    console.log(chalk.red(`Failed: ${testResults.failed}\n`));

    if (testResults.failed > 0) {
        console.log(chalk.red("Failed Test Details:"));
        testResults.failures.forEach((f, i) => {
            console.log(chalk.red(`${i + 1}. ${f.test}`));
            console.log(chalk.gray(`   Error: ${f.error}\n`));
        });
    }

    console.log(
        testResults.failed === 0
            ? chalk.green("All tests completed successfully!\n")
            : chalk.red("Some tests failed. Please review the errors above.\n")
    );
}

runAllTests();
