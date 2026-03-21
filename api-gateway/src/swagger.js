import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Swaggies Unified API',
      version: '1.0.0',
      description: 'API Gateway documentation for all Swaggies microservices (Auth, Wallet, Escrow, User).',
      contact: {
        name: 'Julian Nwadinobi',
        url: 'https://github.com/wackydawg'
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Swaggies API Gateway',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            success: { type: 'boolean', example: false }
          }
        },
        UserSignupResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User created successfully' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    auth_account_id: { type: 'string', example: '69bef1f54102e6dfcf5097bf' },
                    email: { type: 'string', example: 'kaluilucak8@gmail.com' },
                    name: { type: 'string', example: 'Jane Doe' },
                    swag_id: { type: 'string', example: '@jane_doet' },
                    role: { type: 'string', example: 'user' },
                    createdAt: { type: 'string', example: '2026-03-21T19:31:01.442Z' }
                  }
                }
              }
            },
            statusCode: { type: 'integer', example: 201 }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/api/v1/auth/auth-register': {
        post: {
          summary: 'Register a new Freelancer',
          tags: ['Auth Service'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password', 'bvn', 'swag_id', 'dateOfBirth', 'phone_number'],
                  properties: {
                    name: { type: 'string', example: 'Jane Doe' },
                    email: { type: 'string', example: 'janedoe@swaggies.co' },
                    password: { type: 'string', example: 'securepass123' },
                    bvn: { type: 'string', example: '22222222226' },
                    swag_id: { type: 'string', example: '@jane_doe' },
                    dateOfBirth: { type: 'string', example: '1990-01-01' },
                    phone_number: { type: 'string', example: '08012345678' },
                  }
                }
              }
            }
          },
          responses: { 
            201: { 
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UserSignupResponse' }
                }
              }
            }, 
            400: { $ref: '#/components/schemas/Error' } 
          }
        }
      },
      '/api/v1/auth/auth-verify': {
        post: {
          summary: 'Verify user account',
          tags: ['Auth Service'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    code: { type: 'string', example: '123456' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Verification successful' } }
        }
      },
      '/api/v1/auth/auth-login': {
        post: {
          summary: 'User login',
          tags: ['Auth Service'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', example: 'jules@swaggies.co' },
                    password: { type: 'string', example: 'securepass123' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Login successful' } }
        }
      },

      // --- User Service ---
      '/api/v1/users/auth-account': {
        get: {
          summary: 'Get current user profile',
          tags: ['User Service'],
          responses: { 200: { description: 'Profile data retrieved' } }
        }
      },

      // --- Wallet & Escrow Service ---
      '/api/v1/wallet/wallet-balance/{accountNumber}': {
        get: {
          summary: 'Get wallet balance',
          tags: ['Wallet Service'],
          parameters: [
            { name: 'accountNumber', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: { 200: { description: 'Balance retrieved' } }
        }
      },
      '/api/v1/wallet/escrow/create': {
        post: {
          summary: 'Create an Escrow transaction',
          tags: ['Escrow Service'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    clientEmail: { type: 'string', example: 'client@company.com' },
                    amount: { type: 'number', example: 150000 },
                    title: { type: 'string', example: 'Web App Development' },
                    milestones: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          title: { type: 'string', example: 'Phase 1' },
                          amount: { type: 'number', example: 75000 }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Escrow created' } }
        }
      },
      '/api/v1/wallet/escrow/invoice/generate': {
        post: {
          summary: 'Generate a new Escrow Invoice link',
          tags: ['Escrow Service'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    clientEmail: { type: 'string', example: 'client@company.com' },
                    amount: { type: 'number', example: 150000 },
                    title: { type: 'string', example: 'SEO Optimization' },
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Success' } }
        }
      },
      '/api/v1/wallet/escrow/invoice/{token}': {
        get: {
          summary: 'View public invoice (Guest)',
          tags: ['Escrow Service'],
          security: [],
          parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Invoice data retrieved' } }
        }
      },
      '/api/v1/wallet/escrow/tracking/{token}': {
        get: {
          summary: 'View tracking details (Client)',
          tags: ['Escrow Service'],
          security: [],
          parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Tracking data retrieved' } }
        }
      },
      '/api/v1/wallet/escrow/request-approval-code/{token}': {
        post: {
          summary: 'Request OTP for fund release (Client)',
          tags: ['Escrow Service'],
          security: [],
          parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'OTP sent' } }
        }
      },
      '/api/v1/wallet/escrow/guest-release/{token}/milestones/{milestoneId}': {
        post: {
          summary: 'Approve and release milestone (Client OTP Required)',
          tags: ['Escrow Service'],
          security: [],
          parameters: [
            { name: 'token', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'milestoneId', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { approvalCode: { type: 'string', example: '123456' } } } } }
          },
          responses: { 200: { description: 'Milestone released' } }
        }
      },
      '/api/v1/wallet/escrow/guest-reject/{token}/milestones/{milestoneId}': {
        post: {
          summary: 'Reject/Dispute milestone submission (Client)',
          tags: ['Escrow Service'],
          security: [],
          parameters: [
            { name: 'token', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'milestoneId', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { reason: { type: 'string', example: 'Code quality does not meet standards' } } } } }
          },
          responses: { 200: { description: 'Milestone disputed' } }
        }
      },
      '/api/v1/wallet/vault/convert': {
        post: {
          summary: 'Convert NGN to USD (FX Vault)',
          tags: ['Wallet Service'],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { amountInNgn: { type: 'number', example: 50000 } } } } }
          },
          responses: { 200: { description: 'Conversion successful' } }
        }
      },

      // --- Webhooks ---
      '/api/v1/webhooks/flw-webhook': {
        post: {
          summary: 'Flutterwave Payment Webhook',
          tags: ['Webhooks'],
          security: [],
          responses: { 200: { description: 'Processed' } }
        }
      },

      // --- Static/Public Pages ---
      '/invoice': {
        get: {
          summary: 'Serve Payment Page',
          tags: ['Public Pages'],
          security: [],
          responses: { 200: { description: 'HTML page served' } }
        }
      },
      '/tracking': {
        get: {
          summary: 'Serve Tracking Page',
          tags: ['Public Pages'],
          security: [],
          responses: { 200: { description: 'HTML page served' } }
        }
      }
    }
  },
  apis: [], 
};

export const swaggerSpecs = swaggerJsdoc(options);