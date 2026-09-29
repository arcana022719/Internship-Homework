const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const Database = require('better-sqlite3');
const app = express();
const port = 3000;
app.use(express.json());

const seedTasks = [
    { id: 1, title: "Push to Repository", done: false },
    { id: 2, title: "Do homework", done: false },
    { id: 3, title: "Study for exam", done: false }
];

const db = new Database('tasks.db');

db.exec(`CREATE TABLE IF NOT EXISTS tasks(
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        done BOOLEAN NOT NULL DEFAULT FALSE
    )
`);

const count = db.prepare('SELECT COUNT(*) AS count from tasks;').get();
if (count.count === 0) {
    //console.log("Count is: ", count.count)
    const insert = db.prepare(`
        INSERT into tasks (title,done)
        VALUES(?, ?)
        `);
    for (const task of seedTasks) {
        insert.run(task.title, task.done ? 1 : 0)
    }
}

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
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid ID"
        });
    }
    const deleteTask = db.prepare(`DELETE FROM tasks WHERE id = ?`).run(id);
    if (deleteTask.changes === 0) {
        return res.status(404).json({
            message: "ID not found"
        });
    }

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
    if (!req.body) {
        return res.status(400).json({
            message: "Empty content"
        });
    }
    if (typeof req.body.title !== 'string' || req.body.title.trim() === '') {
        return res.status(400).json({
            message: "Invalid title"
        })
    }
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid ID"
        })
    }
    //const task = tasks.find(task => task.id === id);
    if (typeof req.body.done !== 'boolean') {
        return res.status(400).json({
            message: "Invalid data type for 'done'"
        })
    }
    const done = req.body.done ? 1 : 0;
    const updateTask = db.prepare(`
        UPDATE tasks
        SET title = ?, done = ?
        WHERE id = ?
        `)

    const result = updateTask.run(req.body.title, done, id);
    if (result.changes === 0) {
        return res.status(404).json({
            message: "ID not found"
        })
    }

    //task.title = req.body.title;
    //task.done = req.body.done;

    res.status(200).json(result);
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

    /*const newTask = {
        id: tasks.length + 1,
        title: req.body.title,
        done: false
    }*/

    const newTask = db.prepare(`
            INSERT INTO tasks (title)
            VALUES(?)
        `)
    const result = newTask.run(req.body.title);


    //tasks.push(newTask);
    res.status(201).json({
        id: result.lastInsertRowid,
        title: req.body.title,
        done: false
    });
});


/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks or search tasks
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Search tasks by title
 *         example: milk
 *     responses:
 *       200:
 *         description: List of matching tasks
 */
app.get('/tasks', (req, res) => {
    const task = db.prepare(`SELECT * from tasks`).all();
    res.json(task);
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
    //console.log("/tasks/:id was called");
    const id = Number(req.params.id);
    //console.log("ID is: ", id);
    const task = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(id);
    //console.log("Task: ", task);
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