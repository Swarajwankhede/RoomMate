// Demo-grade, browser-only auth. Accounts live in localStorage and passwords
// are salted + SHA-256 hashed (never stored in plain text). This is fine for a
// course project; a production app would authenticate against a real server.
const USERS_KEY = "rm-users";
const SESSION_KEY = "rm-session";

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}
function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

const toHex = (bytes) => Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(new Uint8Array(digest));
}

function randomSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

export async function registerUser({ name, email, password }) {
  const users = readUsers();
  const normalized = email.trim().toLowerCase();
  if (users.some((u) => u.email === normalized)) {
    throw new Error("An account with this email already exists.");
  }
  const salt = randomSalt();
  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalized,
    salt,
    passHash: await hashPassword(password, salt),
    createdAt: Date.now(),
  };
  writeUsers([...users, user]);
  return publicUser(user);
}

export async function loginUser({ email, password }) {
  const normalized = email.trim().toLowerCase();
  const user = readUsers().find((u) => u.email === normalized);
  const fail = new Error("Incorrect email or password.");
  if (!user) throw fail;
  const hash = await hashPassword(password, user.salt);
  if (hash !== user.passHash) throw fail;
  return publicUser(user);
}

export function getSessionUser() {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  const user = readUsers().find((u) => u.id === id);
  return user ? publicUser(user) : null;
}
export const saveSession = (id) => localStorage.setItem(SESSION_KEY, id);
export const clearSession = () => localStorage.removeItem(SESSION_KEY);
