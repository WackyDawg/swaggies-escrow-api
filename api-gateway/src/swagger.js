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
                    email: { type: 'string', example: 'jules@swaggies.co' },
                    name: { type: 'string', example: 'Julian Nwadinobi' },
                    swag_id: { type: 'string', example: '@jules' },
                    role: { type: 'string', example: 'user' },
                    createdAt: { type: 'string', example: '2026-03-21T19:31:01.442Z' }
                  }
                }
              }
            },
            statusCode: { type: 'integer', example: 201 }
          }
        },
        AuthVerifyResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User verified and wallet created successfully' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: '69bef1f54102e6dfcf5097bf' },
                    email: { type: 'string', example: 'jules@swaggies.co' },
                    name: { type: 'string', example: 'Julian Nwadinobi' },
                    role: { type: 'string', example: 'user' },
                    createdAt: { type: 'string', example: '2026-03-21T19:31:01.442Z' }
                  }
                }
              }
            },
            statusCode: { type: 'integer', example: 200 }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'User logged in successfully' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '69bef1f54102e6dfcf5097bf' },
                email: { type: 'string', example: 'jules@swaggies.co' },
                name: { type: 'string', example: 'Julian Nwadinobi' },
                role: { type: 'string', example: 'user' },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiI...' },
                refreshToken: { type: 'string', example: 'def456...' }
              }
            },
            statusCode: { type: 'integer', example: 200 }
          }
        },
        UserProfileResponse: {
          type: 'object',
          properties: {
            auth_account_id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            date_of_birth: { type: 'string' },
            phone_number: { type: 'string' },
            is_mfa_enabled: { type: 'boolean' },
            is_kyc_verified: { type: 'boolean' },
            mfa_type: { type: 'string' },
            locale: { type: 'string' },
            gender: { type: 'string' },
            created_at_unix: { type: 'string' },
            statusCode: { type: 'integer', example: 200 }
          }
        },
        WalletBalanceResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 200 },
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Success' },
            data: {
              type: 'object',
              properties: {
                balance: { type: 'number', example: 500000 },
                currency: { type: 'string', example: 'NGN' },
                ledgerBalance: { type: 'number', example: 500000 },
                availableBalance: { type: 'number', example: 500000 },
                lastUpdated: { type: 'string', example: '2026-03-22T04:44:24.000Z' }
              }
            }
          }
        },
        EscrowResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Success' },
            data: { type: 'object' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/api/v1/auth/auth-register': {
        post: {
          summary: 'Register a new user',
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
                    name: { type: 'string', example: 'Julian Nwadinobi' },
                    email: { type: 'string', example: 'jules@swaggies.co' },
                    password: { type: 'string', example: 'securepass123' },
                    bvn: { type: 'string', example: '22222222226' },
                    swag_id: { type: 'string', example: '@jules' },
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
                  required: ['code'],
                  properties: {
                    code: { type: 'string', example: '123456' }
                  }
                }
              }
            }
          },
          responses: { 
            200: { 
              description: 'Verification successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthVerifyResponse' }
                }
              }
            },
            400: { $ref: '#/components/schemas/Error' }
          }
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
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'jules@swaggies.co' },
                    password: { type: 'string', example: 'securepass123' }
                  }
                }
              }
            }
          },
          responses: { 
            200: { 
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/LoginResponse' }
                }
              }
            },
            401: { $ref: '#/components/schemas/Error' }
          }
        }
      },

      // --- User Service ---
      '/api/v1/users/auth-account': {
        get: {
          summary: 'Get current user profile',
          tags: ['User Service'],
          responses: { 
            200: { 
              description: 'Profile data retrieved',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UserProfileResponse' }
                }
              }
            } 
          }
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
          responses: { 
            200: { 
              description: 'Balance retrieved',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/WalletBalanceResponse' }
                }
              }
            } 
          }
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
                  required: ['freelancerId', 'amount', 'title'],
                  properties: {
                    freelancerId: { type: 'string', example: '69bef1f54102e6dfcf5097bf' },
                    amount: { type: 'number', example: 1500 },
                    title: { type: 'string', example: 'Web App Development' },
                    description: { type: 'string', example: 'Build a premium microservices-based app' }
                  }
                }
              }
            }
          },
          responses: { 
            201: { 
              description: 'Escrow created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/EscrowResponse' }
                }
              }
            } 
          }
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
                  required: ['clientEmail', 'amount', 'title'],
                  properties: {
                    clientEmail: { type: 'string', example: 'client@company.com' },
                    amount: { type: 'number', example: 1500 },
                    title: { type: 'string', example: 'SEO Optimization' },
                    description: { type: 'string', example: 'Monthly SEO maintenance' },
                    milestones: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          title: { type: 'string', example: 'Phase 1' },
                          amount: { type: 'number', example: 750 }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: { 
            201: { 
              description: 'Invoice link generated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: {
                        type: 'object',
                        properties: {
                          invoiceDetails: { type: 'object' },
                          paymentLink: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            } 
          }
        }
      },
      '/api/v1/wallet/escrow/invoice/{token}': {
        get: {
          summary: 'View public invoice (Guest)',
          tags: ['Escrow Service'],
          security: [],
          parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 
            200: { 
              description: 'Invoice data retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          title: { type: 'string' },
                          description: { type: 'string' },
                          amountInNaira: { type: 'number' },
                          status: { type: 'string' },
                          isTrackingLink: { type: 'boolean' },
                          freelancer: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              email: { type: 'string' }
                            }
                          },
                          clientEmail: { type: 'string' },
                          milestones: { type: 'array', items: { type: 'object' } }
                        }
                      }
                    }
                  }
                }
              }
            } 
          }
        }
      },
      '/api/v1/wallet/escrow/tracking/{token}': {
        get: {
          summary: 'View tracking details (Client)',
          tags: ['Escrow Service'],
          security: [],
          parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 
            200: { 
              description: 'Tracking data retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          title: { type: 'string' },
                          description: { type: 'string' },
                          amountInNaira: { type: 'number' },
                          status: { type: 'string' },
                          isTrackingLink: { type: 'boolean' },
                          freelancer: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              email: { type: 'string' }
                            }
                          },
                          clientEmail: { type: 'string' },
                          milestones: { type: 'array', items: { type: 'object' } }
                        }
                      }
                    }
                  }
                }
              }
            } 
          }
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
            content: { 'application/json': { schema: { type: 'object', required: ['approvalCode'], properties: { approvalCode: { type: 'string', example: '123456' } } } } }
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
            content: { 'application/json': { schema: { type: 'object', required: ['reason'], properties: { reason: { type: 'string', example: 'Code quality does not meet standards' } } } } }
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
            content: { 'application/json': { schema: { type: 'object', required: ['amountInNgn'], properties: { amountInNgn: { type: 'number', example: 50000 } } } } }
          },
          responses: { 
            200: { 
              description: 'Conversion successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: {
                        type: 'object',
                        properties: {
                          ngnBalance: { type: 'string' },
                          usdBalance: { type: 'string' },
                          exchangeRate: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            } 
          }
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