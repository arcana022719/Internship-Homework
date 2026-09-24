const express = require('express');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// In-memory data store for tasks
let tasks = [
  {
    id: 1,
    title: 'Complete internship onboarding',
    description: 'Set up local development environment and read through requirements.',
    completed: true,
    createdAt: new Date('2026-09-01T08:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-01T09:30:00.000Z').toISOString()
  },
  {
    id: 2,
    title: 'Implement Task CRUD API',
    description: 'Build in-memory CRUD endpoints with validation and Swagger documentation.',
    completed: false,
    createdAt: new Date('2026-09-02T10:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-09-02T10:00:00.000Z').toISOString()
  }
];

let nextId = 3;

// Helper: Parse and validate numeric ID
function parseTaskId(paramId) {
  const id = parseInt(paramId, 10);
  if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

// ==================== OpenAPI / Swagger Specification ====================
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Task Management API',
    version: '1.0.0',
    description: 'A full CRUD Task Management API using ExpressJS with an in-memory data store.'
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Local server'
    }
  ],
  paths: {
    '/': {
      get: {
        summary: 'Root Welcome Endpoint',
        description: 'Returns API metadata and documentation link.',
        responses: {
          200: {
            description: 'API information',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Welcome to the Task Management API' },
                    documentation: { type: 'string', example: '/api-docs' },
                    healthCheck: { type: 'string', example: '/health' },
                    tasksEndpoint: { type: 'string', example: '/tasks' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/health': {
      get: {
        summary: 'Health Check',
        description: 'Checks if the server is healthy and reports uptime.',
        responses: {
          200: {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    uptime: { type: 'number', example: 42.12 },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/tasks': {
      get: {
        summary: 'Get all tasks / Search tasks',
        description: 'Retrieves all tasks or filters tasks by keyword in title or description.',
        parameters: [
          {
            name: 'search',
            in: 'query',
            required: false,
            description: 'Keyword to search inside task title or description',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          200: {
            description: 'List of tasks',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'integer', example: 2 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Task' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new task',
        description: 'Creates a new task in the in-memory store.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTaskInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Task created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task created successfully' },
                    data: { $ref: '#/components/schemas/Task' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Validation Error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/tasks/{id}': {
      get: {
        summary: 'Get task by ID',
        description: 'Retrieves a single task using its unique numeric ID.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Task ID',
            schema: { type: 'integer', example: 1 }
          }
        ],
        responses: {
          200: {
            description: 'Task retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Task' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Invalid ID provided',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          404: {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      put: {
        summary: 'Update task by ID',
        description: 'Updates one or more fields of an existing task.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Task ID',
            schema: { type: 'integer', example: 1 }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTaskInput' }
            }
          }
        },
        responses: {
          200: {
            description: 'Task updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task updated successfully' },
                    data: { $ref: '#/components/schemas/Task' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Validation error or invalid ID',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          404: {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      delete: {
        summary: 'Delete task by ID',
        description: 'Removes a task from the in-memory store by ID.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Task ID',
            schema: { type: 'integer', example: 1 }
          }
        ],
        responses: {
          200: {
            description: 'Task deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task deleted successfully' },
                    data: { $ref: '#/components/schemas/Task' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Invalid ID provided',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          404: {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Task: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Sample Task' },
          description: { type: 'string', example: 'Detailed description of the task' },
          completed: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateTaskInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: {
            type: 'string',
            example: 'Write unit tests'
          },
          description: {
            type: 'string',
            example: 'Write tests for the CRUD API endpoints'
          },
          completed: {
            type: 'boolean',
            default: false,
            example: false
          }
        }
      },
      UpdateTaskInput: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            example: 'Updated task title'
          },
          description: {
            type: 'string',
            example: 'Updated task description'
          },
          completed: {
            type: 'boolean',
            example: true
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Resource not found or validation error description' }
        }
      }
    }
  }
};

// Swagger UI Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ==================== Endpoints ====================

// Root Endpoint - "/"
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Task Management API',
    documentation: '/api-docs',
    healthCheck: '/health',
    tasksEndpoint: '/tasks'
  });
});

// Health Endpoint - "/health"
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Get all tasks / Search tasks - "/tasks" and "/tasks?search="
app.get('/tasks', (req, res) => {
  const { search } = req.query;

  if (typeof search === 'string' && search.trim() !== '') {
    const keyword = search.trim().toLowerCase();
    const filteredTasks = tasks.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(keyword);
      const descMatch = task.description ? task.description.toLowerCase().includes(keyword) : false;
      return titleMatch || descMatch;
    });

    return res.status(200).json({
      success: true,
      count: filteredTasks.length,
      data: filteredTasks
    });
  }

  return res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

// Create task - POST "/tasks"
app.post('/tasks', (req, res) => {
  const { title, description, completed } = req.body;

  // Validation: title is required and must be non-empty string
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed: "title" is required and must be a non-empty string.'
    });
  }

  // Validation: description, if provided, must be a string
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed: "description" must be a string if provided.'
    });
  }

  // Validation: completed, if provided, must be a boolean
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed: "completed" must be a boolean if provided.'
    });
  }

  const now = new Date().toISOString();
  const newTask = {
    id: nextId++,
    title: title.trim(),
    description: description ? description.trim() : '',
    completed: typeof completed === 'boolean' ? completed : false,
    createdAt: now,
    updatedAt: now
  };

  tasks.push(newTask);

  return res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: newTask
  });
});

// Get task by ID - GET "/tasks/:id"
app.get('/tasks/:id', (req, res) => {
  const taskId = parseTaskId(req.params.id);
  if (taskId === null) {
    return res.status(400).json({
      success: false,
      error: 'Invalid task ID. ID must be a positive integer.'
    });
  }

  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      error: `Task with ID ${taskId} not found.`
    });
  }

  return res.status(200).json({
    success: true,
    data: task
  });
});

// Update task by ID - PUT "/tasks/:id"
app.put('/tasks/:id', (req, res) => {
  const taskId = parseTaskId(req.params.id);
  if (taskId === null) {
    return res.status(400).json({
      success: false,
      error: 'Invalid task ID. ID must be a positive integer.'
    });
  }

  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      error: `Task with ID ${taskId} not found.`
    });
  }

  const { title, description, completed } = req.body;

  if (title === undefined && description === undefined && completed === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed: At least one field ("title", "description", or "completed") must be provided for update.'
    });
  }

  // Validate title if present
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: "title" must be a non-empty string.'
      });
    }
  }

  // Validate description if present
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed: "description" must be a string.'
    });
  }

  // Validate completed if present
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed: "completed" must be a boolean.'
    });
  }

  const existingTask = tasks[taskIndex];
  const updatedTask = {
    ...existingTask,
    title: title !== undefined ? title.trim() : existingTask.title,
    description: description !== undefined ? description.trim() : existingTask.description,
    completed: completed !== undefined ? completed : existingTask.completed,
    updatedAt: new Date().toISOString()
  };

  tasks[taskIndex] = updatedTask;

  return res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: updatedTask
  });
});

// Delete task by ID - DELETE "/tasks/:id"
app.delete('/tasks/:id', (req, res) => {
  const taskId = parseTaskId(req.params.id);
  if (taskId === null) {
    return res.status(400).json({
      success: false,
      error: 'Invalid task ID. ID must be a positive integer.'
    });
  }

  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      error: `Task with ID ${taskId} not found.`
    });
  }

  const [deletedTask] = tasks.splice(taskIndex, 1);

  return res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    data: deletedTask
  });
});

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Malformed JSON payload.'
    });
  }
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

// Start the server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Swagger UI documentation available at http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
