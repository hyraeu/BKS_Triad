import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ADMIN_EMAIL = "admin123@gmail.com";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFile = process.env.USERS_FILE || path.join(__dirname, "users.json");

if (!fs.existsSync(usersFile)) {
  console.error(`No account found for ${ADMIN_EMAIL}. Sign up with this address first.`);
  process.exitCode = 1;
} else {
  const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
  const admin = users.find(
    (user) => user.email.toLowerCase() === ADMIN_EMAIL,
  );

  if (!admin) {
    console.error(`No account found for ${ADMIN_EMAIL}. Sign up with this address first.`);
    process.exitCode = 1;
  } else if (admin.role === "admin") {
    console.log(`${ADMIN_EMAIL} already has the admin role.`);
  } else {
    admin.role = "admin";
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    console.log(`Admin role granted to ${ADMIN_EMAIL}.`);
  }
}
