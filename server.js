const express = require("express");
const app = express();
const port = 3000;



const tasks = [
    { id: 1, title: "Push to Repository", done: false },
    { id: 2, title: "Do homework", done: false },
    { id: 3, title: "Study for exam", done: false }
];

app.get('/tasks', (req, res) => {
    res.send(JSON.stringify(task, null, 2));
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