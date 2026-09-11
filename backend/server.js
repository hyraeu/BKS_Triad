import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, "users.json");
const AUDIT_FILE = path.join(__dirname, "audit.json");

function loadJSON(filePath) {
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  }
  return [];
}

function saveJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

let users = loadJSON(USERS_FILE);
let auditLog = loadJSON(AUDIT_FILE);

function logEvent(event, email) {
  const entry = { event, email, timestamp: new Date().toISOString() };
  auditLog.push(entry);
  saveJSON(AUDIT_FILE, auditLog);
  console.log(`[AUDIT] ${event} - ${email} - ${entry.timestamp}`);
}

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts. Please try again later." },
});

app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({ error: "Email already registered." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = { name, email, passwordHash };
  users.push(newUser);
  saveJSON(USERS_FILE, users);

  logEvent("SIGNUP_SUCCESS", email);
  res.status(201).json({ message: "Account created successfully." });
});

app.post("/api/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    logEvent("LOGIN_FAILED_NO_USER", email);
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    logEvent("LOGIN_FAILED_WRONG_PASSWORD", email);
    return res.status(401).json({ error: "Invalid email or password." });
  }

  logEvent("LOGIN_SUCCESS", email);
  res.status(200).json({ message: "Login successful.", name: user.name, email: user.email });
});

app.get("/api/audit-log", (req, res) => {
  res.json(auditLog);
});

app.get("/api/users", (req, res) => {
  const safeUsers = users.map(({ name, email }) => ({ name, email }));
  res.json(safeUsers);
});

app.listen(4000, () => console.log("Backend running on http://localhost:4000"));