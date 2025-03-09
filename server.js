const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const http = require("http");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: true
}));
const path = require('path');
app.use("/", express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("todos.db", (err) => {
   if (err) {
       console.error(err.message);
   }
   console.log("Connected to the database.");
});

db.run(`CREATE TABLE IF NOT EXISTS todos (
   id TEXT PRIMARY KEY,
   name TEXT NOT NULL,
   completed BOOLEAN NOT NULL,
   date DATETIME NOT NULL
)`);

app.post("/todo/add", (req, res) => {
   const { name, date } = req.body;
   const id = "" + new Date().getTime();
   const completed = false;
   db.run("INSERT INTO todos (id, name, completed, date) VALUES (?, ?, ?, ?)", [id, name, completed, date], (err) => {
       if (err) {
           return res.json({ result: "Error", error: err.message });
       }
       res.json({ result: "Ok" });
   });
});

app.get("/todo", (req, res) => {
   db.all("SELECT * FROM todos", [], (err, rows) => {
       if (err) {
           return res.json({ result: "Error", error: err.message });
       }
       res.json({ todos: rows });
   });
});

app.put("/todo/complete", (req, res) => {
   const { id } = req.body;
   db.run("UPDATE todos SET completed = 1 WHERE id = ?", [id], (err) => {
       if (err) {
           return res.json({ result: "Error", error: err.message });
       }
       res.json({ result: "Ok" });
   });
});

app.delete("/todo/:id", (req, res) => {
   db.run("DELETE FROM todos WHERE id = ?", [req.params.id], (err) => {
       if (err) {
           return res.json({ result: "Error", error: err.message });
       }
       res.json({ result: "Ok" });
   });
});

const server = http.createServer(app);

server.listen(5500, () => {
  console.log("- server running");
});