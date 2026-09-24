const express = require("express");
const app = express();
const port = 3000;
app.use(express.json());


const tasks = [
    { id: 1, title: "Push to Repository", done: false },
    { id: 2, title: "Do homework", done: false },
    { id: 3, title: "Study for exam", done: false }
];

app.post('/tasks', (req, res) => {
    if (!res.body)
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


app.get('/tasks', (req, res) => {
    res.send(JSON.stringify(tasks, null, 2));
});

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

app.get('/', (req, res) => {
    res.json({
        name: "Task API",
        version: "1.0",
        endpoints: ["/tasks"]
    })
});


app.get('/health', (req, res) => {
    res.json({
        status: "ok"
    })
});



app.listen(port, () => {
    console.log(`Example App is currently listening on ${port}`);
})