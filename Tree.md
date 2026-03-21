├── api-gateway
│   ├── .env
│   ├── Dockerfile
│   ├── package-lock.json
│   ├── package.json
│   ├── shared
│   └── src
│       ├── app.js
│       ├── clients
│       │   ├── auth.client.js
│       │   └── user.client.js
│       ├── config
│       ├── controllers
│       │   ├── auth.controller.js
│       │   └── user.controller.js
│       ├── errors
│       ├── logging
│       │   └── gateway.logger.js
│       ├── logs
│       │   ├── combined.log
│       │   └── error.log
│       ├── middlewares
│       ├── routes
│       │   ├── auth.routes.js
│       │   └── user.routes.js
│       ├── server.js
│       ├── utils
│       └── validators
├── docker-compose.yml
├── jsconfig.json
├── package-lock.json
├── package.json
├── README.md
├── services
│   ├── auth-service
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── .gitignore
│   │   ├── app.js
│   │   ├── controllers
│   │   │   └── auth.controller.js
│   │   ├── Dockerfile
│   │   ├── grpc-server.js
│   │   ├── logging
│   │   │   └── auth.logger.js
│   │   ├── logs
│   │   │   ├── combined.log
│   │   │   └── error.log
│   │   ├── middlewares
│   │   │   └── auth.middleware.js
│   │   ├── models
│   │   │   └── auth.model.js
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── routes
│   │   │   └── auth.routes.js
│   │   ├── server.js
│   │   ├── services
│   │   │   └── auth.service.js
│   │   ├── shared
│   │   ├── tests
│   │   └── utils
│   │       ├── db.util.js
│   │       ├── jwt.utils.js
│   │       ├── mails
│   │       │   ├── email.config.js
│   │       │   ├── emails.js
│   │       │   └── emailTemplates.js
│   │       └── verificationCode.util.js
│   ├── budget-service
│   │   ├── controllers
│   │   ├── Dockerfile
│   │   ├── health.js
│   │   ├── middlewares
│   │   ├── models
│   │   ├── package.json
│   │   ├── routes
│   │   ├── server.js
│   │   ├── tests
│   │   └── utils
│   ├── notification-service
│   │   ├── controllers
│   │   ├── Dockerfile
│   │   ├── health.js
│   │   ├── middlewares
│   │   ├── models
│   │   ├── package.json
│   │   ├── routes
│   │   ├── server.js
│   │   ├── tests
│   │   └── utils
│   ├── payment-service
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── .gitignore
│   │   ├── app.js
│   │   ├── controllers
│   │   ├── Dockerfile
│   │   ├── logging
│   │   ├── middlewares
│   │   ├── models
│   │   ├── package.json
│   │   ├── routes
│   │   ├── server.js
│   │   ├── services
│   │   └── utils
│   ├── user-service
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── .gitignore
│   │   ├── app.js
│   │   ├── controllers
│   │   │   └── user.controller.js
│   │   ├── Dockerfile
│   │   ├── grpc-server.js
│   │   ├── logging
│   │   │   └── user.logger.js
│   │   ├── logs
│   │   │   ├── combined.log
│   │   │   └── error.log
│   │   ├── middlewares
│   │   ├── models
│   │   │   └── user.model.js
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── routes
│   │   │   └── user.routes.js
│   │   ├── server.js
│   │   ├── services
│   │   │   └── user.service.js
│   │   ├── tests
│   │   └── utils
│   │       ├── db.util.js
│   │       ├── jwt.utils.js
│   │       └── verificationCode.util.js
│   └── wallet-service
│       ├── .env
│       ├── app.js
│       ├── client
│       │   └── moniffy.client.js
│       ├── controllers
│       │   └── wallet.controller.js
│       ├── Dockerfile
│       ├── grpc-server.js
│       ├── health.js
│       ├── logging
│       │   └── wallet.logger.js
│       ├── logs
│       ├── middlewares
│       ├── models
│       │   ├── wallet.model.js
│       │   └── wallet_transaction..model.js
│       ├── package.json
│       ├── routes
│       │   └── wallet.route.js
│       ├── server.js
│       ├── services
│       │   └── wallet.service.js
│       ├── tests
│       └── utils
│           └── db.utils.js
├── shared
│   ├── events
│   ├── index.js
│   ├── middleware
│   │   └── auth.middleware.js
│   ├── package.json
│   ├── proto
│   │   ├── auth.proto
│   │   ├── user.proto
│   │   └── wallet.proto
│   └── utils
├── test
├── test.js
└── Tree.md
