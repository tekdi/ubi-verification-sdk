const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const swagger = require('@fastify/swagger');
const swaggerUI = require('@fastify/swagger-ui');
const path = require('path');
const verificationService = require('./services/verificationService');
const validationService = require('./services/validationService');

// Define schemas
const userProfileSchema = {
  type: 'object',
  required: ['name', 'gender', 'age', 'dateOfBirth', 'caste', 'income'],
  properties: {
    name: { type: 'string', description: 'Full name of the user' },
    gender: { type: 'string', description: 'Gender of the user', enum: ['Male', 'Female'] },
    age: { type: 'number', description: 'Age of the user' },
    dateOfBirth: { type: 'string', format: 'date', description: 'Date of birth in YYYY-MM-DD format' },
    caste: { type: 'string', description: 'Caste category', enum: ['sc', 'st', 'obc', 'general'] },
    income: { type: 'number', description: 'Annual income in INR' }
  }
};

// Define eligibility rules schema
const eligibilityRulesSchema = {
  type: 'object',
  required: ['title'],
  properties: {
    'title': 'string'
  }
};

// Register plugins
fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
});

// Register Swagger
fastify.register(swagger, {
  mode: 'static',
  specification: {
    path: path.join(__dirname, 'config', 'swagger.yaml'),
    postProcessor: function(swaggerObject) {
      return swaggerObject;
    }
  },
  swagger: {
    allowUnionTypes: true
  }
});

// Register Swagger UI
fastify.register(swaggerUI, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  },
  staticCSP: true,
  transformStaticCSP: (header) => header
});

// Health check route
fastify.get('/health', {
  schema: {
    tags: ['System'],
    summary: 'Health check endpoint',
    description: 'Returns the health status of the API',
    response: {
      200: {
        type: 'object',
        properties: {
          status: { 
            type: 'string',
            enum: ['ok'],
            description: 'Health status'
          }
        }
      }
    }
  }
}, async (request, reply) => {
  return { status: 'ok' };
});

// Main eligibility check endpoint
fastify.post('/verification', {
  schema: {
    tags: ['verification'],
    summary: 'Verify benefitiary credentials',
    description: 'Verfify if beneficiary credentials are valid and check eligibility for benefits',
    body: {
      type: 'object',
      required: ['userProfile', 'credential'],
      properties: {
        userProfile: userProfileSchema,
        credential: {
          type: 'object'
        },
        eligibilityRules: {
          type: 'array',
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string' }
                }
              },
              description: 'List of eligibility rules to check against'
          }
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the verification was successful'
          },
          message: {
            type: 'string',
            description: 'Message indicating the result of the verification'
          },
          result: {
            type: 'object',
            properties: {
              checks: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { 
                      type: 'object',
                      description: 'Title of the performed check'
                    },
                    status: {
                      type: 'boolean',
                      description: 'Status of the check (true/false)'
                    }
                  }
                },
                description: 'List of checks performed during verification'
              }
            }
          },
          passed: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rule: { 
                  type: 'object',
                  description: 'ID or title of the eligible verification rule'
                }
              }
            },
            description: 'List of passed eligibility rules'
          },
          failed: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rule: { 
                  type: 'string',
                  description: 'ID or title of the eligible verification rule'
                }
              }
            },
            description: 'List of failed eligibility rules'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                error: { 
                  type: 'string',
                  description: 'Error message'
                }
              }
            },
            description: 'List of errors encountered during eligibility check'
          }
        }
      },
      400: {
        type: 'object',
        properties: {
          error: { 
            type: 'string',
            description: 'Error message'
          }
        }
      }
    }
  }
}, async (request, reply) => {
  try {
    const { userProfile, credential } = request.body;
    const eligibility_rules = request.body.eligibility_rules || {};
    const config = request.body.config || {};

    // Validate input
    if (!userProfile || !credential) {
      throw new Error('Missing required parameters');
    }

    // Validate user profile
    const userProfileValidation = validationService.validateUserProfile(userProfile, userProfileSchema);
    if (!userProfileValidation.isValid) {
      return reply.code(400).send({
        error: 'Invalid user profile',
        details: userProfileValidation.errors
      });
    }

    // Process eligibility
    const results = await verificationService.verify(
      userProfile,
      credential,
      config,
      eligibility_rules
    );

    return results;
  } catch (error) {
    fastify.log.error(error);
    reply.code(400).send({ error: error.message });
  }
});

// Start server
const start = async () => {
  try {
    await fastify.ready();
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info(`Server is running on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();