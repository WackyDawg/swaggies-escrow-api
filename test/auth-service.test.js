import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const protoPath = path.join(__dirname, '../shared/proto/auth.proto');

const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const proto = grpc.loadPackageDefinition(packageDefinition).auth;

const client = new proto.AuthService(
    'localhost:5001',
    grpc.credentials.createInsecure()
);

console.log(chalk.blue('==> Running gRPC tests against auth-service...\n'));

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
    await runTest(
        "Create User",
        "CreateUser",
        {
            email: "juden098@gmail.com",
            password: "P@ssword",
            name: "Julian Chibuike Nwadinobi",
            bvn: "22222222226",
            dateOfBirth: "1994-09-07"
        }
    );

    await runTest(
        "User Login",
        "LoginUser",
        {
            email: "juden098@gmail.com",
            password: "P@ssword"
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
