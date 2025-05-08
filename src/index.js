const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const swagger = require('@fastify/swagger');
const swaggerUI = require('@fastify/swagger-ui');
const path = require('path');
const verificationService = require('./services/verificationService');
const validationService = require('./services/validationService');

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
    summary: 'Verify beneficiary credentials',
    description: 'Verify if beneficiary credentials are valid and check eligibility for benefits',
    body: {
      type: 'object',
      required: ['credential'], // Removed 'userProfile' from required fields
      properties: {
        credential: {
          type: 'object',
          description: 'The credential JSON to be verified'
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
          success: { type: 'boolean', description: 'Indicates if the verification was successful' },
          message: { type: 'string', description: 'Message indicating the result of the verification' },
          result: {
            type: 'object',
            properties: {
              checks: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', description: 'Title of the performed check' },
                    status: { type: 'boolean', description: 'Status of the check (true/false)' }
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
                rule: { type: 'string', description: 'ID or title of the eligible verification rule' }
              }
            },
            description: 'List of passed eligibility rules'
          },
          failed: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rule: { type: 'string', description: 'ID or title of the eligible verification rule' }
              }
            },
            description: 'List of failed eligibility rules'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                error: { type: 'string', description: 'Error message' }
              }
            },
            description: 'List of errors encountered during eligibility check'
          }
        }
      },
      400: {
        type: 'object',
        properties: {
          error: { type: 'string', description: 'Error message' }
        }
      }
    }
  }
}, async (request, reply) => {
  try {
    const { credential } = request.body;
    const eligibility_rules = request.body.eligibility_rules || {};
    const config = request.body.config || {};

    // Validate input
    if (!credential) {
      throw new Error('Missing required parameters');
    }

    // Process eligibility
    const results = await verificationService.verify(
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