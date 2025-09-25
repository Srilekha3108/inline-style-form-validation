// server.js
// Tiny Express server with server-side validation and in-memory storage

const express = require("express");
const app = express();
const PORT = 3000;

// log when file starts
console.log(">>> server.js started <<<");

app.use(express.json()); // parse JSON bodies

// Allow CORS (so index.html can talk to the server)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Temporary in-memory storage
const submissions = [];
let nextId = 1;

// Validation function
function validateServer(body) {
  const errors = {};
  if (!body.name || typeof body.name !== "string" || body.name.trim().length < 2)
    errors.name = "Name must be at least 2 characters.";

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!body.email || !emailRe.test(body.email))
    errors.email = "Please enter a valid email.";

  const age = Number(body.age);
  if (!body.age || Number.isNaN(age) || age < 1 || age > 120)
    errors.age = "Age should be a number between 1 and 120.";

  if (!body.message || typeof body.message !== "string" || body.message.trim().length < 10)
    errors.message = "Message must have at least 10 characters.";

  return Object.keys(errors).length ? { valid: false, errors } : { valid: true };
}

// POST /submit → validate + save
app.post("/submit", (req, res) => {
  const body = req.body;
  console.log("Received submission:", body);

  const result = validateServer(body);
  if (!result.valid) {
    console.log("Validation failed:", result.errors);
    return res.status(400).json({ ok: false, errors: result.errors });
  }

  const saved = {
    id: nextId++,
    name: body.name.trim(),
    email: body.email.trim(),
    age: Number(body.age),
    message: body.message.trim(),
    time: new Date().toISOString(),
  };
  submissions.push(saved);

  console.log("Saved submission:", saved);
  res.json({ ok: true, message: "Saved", saved });
});

// GET /submissions → show all
app.get("/submissions", (req, res) => {
  res.json({ ok: true, submissions });
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Hello! The server is working.");
});

// Start server
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
