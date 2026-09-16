// Swagger / OpenAPI 3.0 Documentation Specification
export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Task & Finance Management API',
    version: '1.0.0',
    description: 'RESTful API Documentation for Task and Finance Management System',
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server',
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
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'user@example.com' },
                  password: { type: 'string', example: 'Password123!' },
                  fullName: { type: 'string', example: 'John Doe' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'user@example.com' },
                  password: { type: 'string', example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful, returns JWT token' },
        },
      },
    },
    '/tasks': {
      get: {
        summary: 'Get all tasks for logged in user',
        tags: ['Tasks'],
        responses: {
          200: { description: 'List of tasks' },
        },
      },
      post: {
        summary: 'Create a new task',
        tags: ['Tasks'],
        responses: {
          201: { description: 'Task created' },
        },
      },
    },
    '/finance/transactions': {
      get: {
        summary: 'Get financial transactions',
        tags: ['Finance'],
        responses: {
          200: { description: 'List of transactions' },
        },
      },
    },
    '/finance/summary': {
      get: {
        summary: 'Get total income, expense, and balance summary',
        tags: ['Finance'],
        responses: {
          200: { description: 'Financial summary' },
        },
      },
    },
  },
};
