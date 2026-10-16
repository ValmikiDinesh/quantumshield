export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'QuantumShield REST API',
    version: '1.0.0',
    description:
      'QuantumShield Post-Quantum Security Readiness Platform API by Valmiki Softwares. Discovers cryptographic usage, assesses quantum-vulnerability migration risks, and outputs actionable PQC readiness reports aligning with NIST FIPS 203, FIPS 204, and FIPS 205.',
    contact: {
      name: 'Valmiki Softwares Engineering',
      url: 'https://valmikisoftwares.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:5001/api',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check endpoint',
        responses: {
          '200': {
            description: 'Service is healthy',
          },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register new user and organization',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  organizationName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User registered successfully' },
          '400': { description: 'Validation error or email already in use' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Authenticated successfully with JWT' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/projects': {
      get: {
        summary: 'List projects for current organization',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Array of projects' },
        },
      },
      post: {
        summary: 'Create a new project',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  projectType: {
                    type: 'string',
                    enum: ['web', 'api', 'mobile', 'library', 'infrastructure', 'other'],
                  },
                  tags: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Project created' },
          '403': { description: 'Plan project limit reached' },
        },
      },
    },
    '/projects/{id}': {
      get: {
        summary: 'Get project details by ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Project details' },
          '404': { description: 'Project not found' },
        },
      },
      delete: {
        summary: 'Delete project and all associated scans',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Project deleted' },
        },
      },
    },
    '/projects/{projectId}/scans': {
      post: {
        summary: 'Upload ZIP archive and initiate cryptographic scan',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Scan completed successfully with findings' },
          '400': { description: 'Malformed archive or security limit exceeded' },
        },
      },
    },
    '/projects/{projectId}/quick-scan-demo': {
      post: {
        summary: 'Run a one-click scan using sample test repository fixtures',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  demoType: {
                    type: 'string',
                    enum: ['classical-vulnerable', 'hybrid-pqc', 'clean-app'],
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Demo scan completed' },
        },
      },
    },
    '/scans/{scanId}': {
      get: {
        summary: 'Get scan details and findings',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'scanId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Scan findings and readiness assessment' },
        },
      },
    },
    '/scans/{scanId}/report/json': {
      get: {
        summary: 'Download structured JSON readiness report',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'scanId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'JSON report file stream' },
        },
      },
    },
    '/scans/{scanId}/report/pdf': {
      get: {
        summary: 'Download executive PDF readiness report',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'scanId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'PDF report binary stream' },
        },
      },
    },
    '/scans/{scanId}/findings/{findingId}/ai-explain': {
      post: {
        summary: 'Generate plain-English AI remediation explanation for finding',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'scanId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'findingId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'AI guidance explanation with checklist' },
        },
      },
    },
    '/dashboard/stats': {
      get: {
        summary: 'Get organization dashboard metrics and severity charts',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Aggregated dashboard statistics' },
        },
      },
    },
  },
};
