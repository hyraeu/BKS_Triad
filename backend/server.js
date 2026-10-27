import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const allowedOrigins = (
  process.env.WEB_ORIGIN ||
  "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim());
const allowedOriginSet = new Set(allowedOrigins);
const sessionCookieName = "bks_session";
const sessionDurationMs = 8 * 60 * 60 * 1000;
const sessions = new Map();

app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOriginSet.has(origin));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = process.env.USERS_FILE || path.join(__dirname, "users.json");
const AUDIT_FILE = process.env.AUDIT_FILE || path.join(__dirname, "audit.json");

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

function safeUser(user) {
  return {
    name: user.name,
    email: user.email,
    role: user.role === "admin" ? "admin" : "user",
  };
}

function getCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separator = cookie.indexOf("=");
        return [
          cookie.slice(0, separator),
          cookie.slice(separator + 1),
        ];
      }),
  );
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api",
    maxAge: sessionDurationMs,
  };
}

function createSession(res, user) {
  const now = Date.now();
  for (const [token, session] of sessions) {
    if (session.expiresAt <= now) sessions.delete(token);
  }

  const token = crypto.randomBytes(32).toString("base64url");
  const sessionId = crypto.randomUUID();
  sessions.set(token, {
    email: user.email.toLowerCase(),
    expiresAt: now + sessionDurationMs,
    sessionId,
  });
  res.cookie(sessionCookieName, token, cookieOptions());
  return sessionId;
}

function requireAuth(req, res, next) {
  const token = getCookies(req)[sessionCookieName];
  const session = token && sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    if (token) sessions.delete(token);
    return res.status(401).json({ error: "Authentication Required." });
  }

  const user = users.find(
    (entry) => entry.email.toLowerCase() === session.email,
  );
  if (!user) {
    sessions.delete(token);
    return res.status(401).json({ error: "Authentication Required." });
  }

  req.authToken = token;
  req.user = safeUser(user);
  return next();
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Administrator Access Required." });
  }
  return next();
}

function logEvent(event, email, sessionId) {
  const entry = { event, email, timestamp: new Date().toISOString() };
  if (sessionId) entry.sessionId = sessionId;
  auditLog.push(entry);
  saveJSON(AUDIT_FILE, auditLog);
  console.log(`[AUDIT] ${event} - ${email} - ${entry.timestamp}`);
}

function getSessionActivity() {
  const activityBySession = new Map();

  auditLog.forEach((entry, index) => {
    if (entry.event !== "LOGIN_SUCCESS" && entry.event !== "LOGOUT") return;

    const key = entry.sessionId || `legacy-${index}`;
    const activity = activityBySession.get(key) || {
      id: key,
      email: entry.email,
      loginAt: null,
      logoutAt: null,
    };

    if (entry.event === "LOGIN_SUCCESS") activity.loginAt = entry.timestamp;
    if (entry.event === "LOGOUT") activity.logoutAt = entry.timestamp;
    activityBySession.set(key, activity);
  });

  const namesByEmail = new Map(
    users.map((user) => [user.email.toLowerCase(), user.name]),
  );
  return [...activityBySession.values()]
    .map((activity) => ({
      ...activity,
      name: namesByEmail.get(activity.email.toLowerCase()) || activity.email,
    }))
    .sort((a, b) => (b.loginAt || b.logoutAt || "").localeCompare(a.loginAt || a.logoutAt || ""));
}

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too Many Login Attempts. Please Try Again Later." },
});

app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({ error: "All Fields Are Required." });
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ error: "Invalid Email Format." });
  }
  if (password.length < 8 || password.length > 16) {
    return res
      .status(400)
      .json({ error: "Password Must Be Between 8 And 16 Characters." });
  }
  if (
    normalizedName.length > 40 ||
    !/^[\p{L}\p{M}\s'‘’\-]+$/u.test(normalizedName)
  ) {
    return res.status(400).json({ error: "Invalid Name." });
  }

  const existing = users.find(
    (user) => user.email.toLowerCase() === normalizedEmail,
  );
  if (existing) {
    return res.status(409).json({ error: "Email Already Registered." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    name: normalizedName,
    email: normalizedEmail,
    passwordHash,
    role: "user",
  };
  users.push(newUser);
  saveJSON(USERS_FILE, users);

  const sessionId = createSession(res, newUser);
  logEvent("SIGNUP_SUCCESS", normalizedEmail);
  logEvent("LOGIN_SUCCESS", normalizedEmail, sessionId);
  return res
    .status(201)
    .json({ message: "Account Created Successfully.", user: safeUser(newUser) });
});

app.post("/api/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  const user = users.find(
    (entry) => entry.email.toLowerCase() === normalizedEmail,
  );
  if (!user || typeof password !== "string") {
    logEvent("LOGIN_FAILED", normalizedEmail);
    return res.status(401).json({ error: "Invalid Email Or Password." });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    logEvent("LOGIN_FAILED", normalizedEmail);
    return res.status(401).json({ error: "Invalid Email Or Password." });
  }

  const sessionId = createSession(res, user);
  logEvent("LOGIN_SUCCESS", normalizedEmail, sessionId);
  return res.status(200).json({
    message: "Login Successful.",
    user: safeUser(user),
  });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.put("/api/auth/me", requireAuth, (req, res) => {
  const { name, email } = req.body || {};
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    !name.trim() ||
    !email.trim()
  ) {
    return res.status(400).json({ error: "Name And Email Are Required." });
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  if (
    normalizedName.length > 40 ||
    !/^[\p{L}\p{M}\s'‘’\-]+$/u.test(normalizedName)
  ) {
    return res.status(400).json({ error: "Invalid Name." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ error: "Invalid Email Format." });
  }

  const user = users.find(
    (entry) => entry.email.toLowerCase() === req.user.email.toLowerCase(),
  );
  if (!user) {
    return res.status(404).json({ error: "Account Not Found." });
  }

  const duplicate = users.find(
    (entry) =>
      entry !== user && entry.email.toLowerCase() === normalizedEmail,
  );
  if (duplicate) {
    return res.status(409).json({ error: "Email Already Registered." });
  }

  const previousEmail = user.email.toLowerCase();
  user.name = normalizedName;
  user.email = normalizedEmail;
  saveJSON(USERS_FILE, users);

  for (const session of sessions.values()) {
    if (session.email === previousEmail) session.email = normalizedEmail;
  }

  logEvent("ACCOUNT_UPDATED", normalizedEmail);
  return res.json({ user: safeUser(user) });
});

app.post("/api/logout", (req, res) => {
  const token = getCookies(req)[sessionCookieName];
  const session = token && sessions.get(token);
  if (session && session.expiresAt > Date.now()) {
    logEvent("LOGOUT", session.email, session.sessionId);
  }
  if (token) sessions.delete(token);
  const clearOptions = cookieOptions();
  delete clearOptions.maxAge;
  res.clearCookie(sessionCookieName, clearOptions);
  return res.status(200).json({ message: "Logged Out." });
});

app.get("/api/audit-log", requireAuth, requireAdmin, (req, res) => {
  res.json(auditLog);
});

app.get("/api/users", requireAuth, requireAdmin, (req, res) => {
  const safeUsers = users.map(safeUser);
  res.json(safeUsers);
});

app.get("/api/admin/activity", requireAuth, requireAdmin, (req, res) => {
  res.json({ activity: getSessionActivity() });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () =>
  console.log(`Backend running on http://localhost:${port}`),
);
