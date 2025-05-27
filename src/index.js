const fastify = require('fastify')({ logger: true, bodyLimit: 50 * 1024 * 1024 }); // 50 MB
const cors = require('@fastify/cors');
const swagger = require('@fastify/swagger');
const swaggerUI = require('@fastify/swagger-ui');
const path = require('path');
const verificationService = require('./services/verificationService');
require('dotenv').config();
const PORT = process.env.PORT || 3010;
const HOST = process.env.HOST || '0.0.0.0';

// Register plugins
fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
});

fastify.register(swagger, {
  mode: 'static',
  specification: {
    path: path.join(__dirname, 'config', 'swagger.yaml'),
    postProcessor: function (swaggerObject) {
      return swaggerObject;
    }
  },
  swagger: {
    allowUnionTypes: true
  }
});

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

// Main verification endpoint
fastify.post('/verification', {
  schema: {
    tags: ['Verification'],
    summary: 'Verify beneficiary credentials',
    description: 'Verify if beneficiary credentials are valid and check eligibility for benefits',
    body: {
      type: 'object',
      required: ['credential'],
      properties: {
        credential: {
          type: 'object',
          description: 'The credential JSON to be verified'
        },
        config: {
          type: 'object',
          description: 'Verification configuration',
          properties: {
            method: { type: 'string', description: 'Verification method (e.g. online)' },
            apiEndpoint: { type: 'string', description: 'The API endpoint to use for verification' }
          }
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          result: {
            type: 'object',
            properties: {
              checks: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    status: { type: 'boolean' }
                  }
                }
              }
            }
          },
          passed: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rule: { type: 'string' }
              }
            }
          },
          failed: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rule: { type: 'string' }
              }
            }
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                error: { type: 'string' }
              }
            }
          }
        }
      },
      400: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  try {
    const payload = request.body;

    if (!payload.credential) {
      throw new Error('Missing required parameter: credential');
    }

    const results = await verificationService.verify(payload);
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
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`Server is running on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
