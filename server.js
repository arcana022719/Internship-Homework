const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const app = express();
const port = 3000;
app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "Task API",
            version: "1.0.0",
            description: "A simple CRUD Task API"
        },

        servers: [
            {
                url: "http://localhost:3000"
            }
        ],

        components: {
            schemas: {
                Task: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer",
                            example: 1
                        },
                        title: {
                            type: "string",
                            example: "Buy milk"
                        },
                        done: {
                            type: "boolean",
                            example: false
                        }
                    }
                }
            }
        }
    },
    apis: ["./server.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const tasks = [
    { id: 1, title: "Push to Repository", done: false },
    { id: 2, title: "Do homework", done: false },
    { id: 3, title: "Study for exam", done: false }
];

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 */
app.delete('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = tasks.findIndex(task => task.id === id);
    if (index === -1)
        return res.status(404).json({
            message: "Task not found"
        });
    const deletedTask = tasks.splice(index, 1);

    res.sendStatus(204);
})

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - done
 *             properties:
 *               title:
 *                 type: string
 *                 example: Bought milk
 *               done:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Task updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Empty request body
 *       404:
 *         description: Task not found
 */
app.put('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    if (!req.body) {
        return res.status(400).json({
            message: "Empty content"
        });
    }

    task.title = req.body.title;
    task.done = req.body.done;

    res.status(200).json(task);
});

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Buy milk
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Empty request body
 */
app.post('/tasks', (req, res) => {
    if (!req.body)
        return res.status(400).json({
            message: "Empty content"
        });

    const newTask = {
        id: tasks.length + 1,
        title: req.body.title,
        done: false
    }

    tasks.push(newTask);
    res.status(201).json(newTask);
});


/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     responses:
 *       200:
 *         description: List of all tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
app.get('/tasks', (req, res) => {
    res.send(JSON.stringify(tasks, null, 2));
});

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Task found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
app.get('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const task = tasks.find(task => task.id === id)

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    res.json(task);
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get API information
 *     responses:
 *       200:
 *         description: API information
 */
app.get('/', (req, res) => {
    res.json({
        name: "Task API",
        version: "1.0",
        endpoints: ["/tasks"]
    })
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API health
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get('/health', (req, res) => {
    res.json({
        status: "ok"
    })
});



app.listen(port, () => {
    console.log(`Example App is currently listening on ${port}`);
})