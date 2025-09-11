import * as FileSystem from 'expo-file-system';

// File locations inside the app sandbox
const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
const USERS_FILE = baseDir + 'users.json';
const TEAMS_FILE = baseDir + 'teams.json';
const SESSION_FILE = baseDir + 'session.json';
const AUTH_LOG = baseDir + 'auth.log';

export type LogUser = {
  id: string;
  name: string;
  email: string;
  password: string; // NOTE: For demo purposes. Do NOT store cleartext passwords in production.
  role: 'student' | 'staff' | 'coach' | 'admin';
  sportsPreferences: string[];
  pastParticipation?: string;
  achievements?: string;
  approvedByCoach: boolean;
  approvedByAdmin: boolean;
  blocked?: boolean;
  sportsExpertise?: string;
  teamManagement?: string;
  availability?: string;
};

export type LogTeam = {
  id: string;
  name: string;
  blocked?: boolean;
};

type Session = { userId: string } | null;

async function ensureFile(path: string, defaultContent: string) {
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    await FileSystem.writeAsStringAsync(path, defaultContent, { encoding: FileSystem.EncodingType.UTF8 });
  }
}

export async function initDb() {
  await ensureFile(USERS_FILE, '[]');
  await ensureFile(TEAMS_FILE, '[]');
  await ensureFile(SESSION_FILE, 'null');
  await ensureFile(AUTH_LOG, '');
}

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const data = await FileSystem.readAsStringAsync(path, { encoding: FileSystem.EncodingType.UTF8 });
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(path: string, value: T): Promise<void> {
  await FileSystem.writeAsStringAsync(path, JSON.stringify(value), { encoding: FileSystem.EncodingType.UTF8 });
}

export async function appendAuthLog(event: string, payload?: Record<string, any>) {
  const time = new Date().toISOString();
  const line = JSON.stringify({ time, event, ...payload }) + '\n';
  try {
    const existing = await FileSystem.readAsStringAsync(AUTH_LOG, { encoding: FileSystem.EncodingType.UTF8 });
    await FileSystem.writeAsStringAsync(AUTH_LOG, existing + line, { encoding: FileSystem.EncodingType.UTF8 });
  } catch {
    await FileSystem.writeAsStringAsync(AUTH_LOG, line, { encoding: FileSystem.EncodingType.UTF8 });
  }
  // Also persist to the external demo DB (db.log) via event: { type: 'auth', payload: {...} }
  postEvent({ type: 'auth', payload: { event, ...payload } }).catch(() => {});
}

// Primary I/O: use the local log server (db.log). Fallback to in-app files if server unreachable.
export async function listUsers(): Promise<LogUser[]> {
  await initDb();
  const db = await getDbFromServer();
  if (db) return db.users as LogUser[];
  return readJson<LogUser[]>(USERS_FILE, []);
}

export async function saveUsers(users: LogUser[]): Promise<void> {
  const ok = await postEvent({ type: 'saveUsers', payload: { users } });
  if (!ok) await writeJson(USERS_FILE, users);
}

export async function listTeams(): Promise<LogTeam[]> {
  await initDb();
  const db = await getDbFromServer();
  if (db) return db.teams as LogTeam[];
  return readJson<LogTeam[]>(TEAMS_FILE, []);
}

export async function saveTeams(teams: LogTeam[]): Promise<void> {
  const ok = await postEvent({ type: 'saveTeams', payload: { teams } });
  if (!ok) await writeJson(TEAMS_FILE, teams);
}

export async function getSession(): Promise<Session> {
  await initDb();
  return readJson<Session>(SESSION_FILE, null);
}

export async function setSession(session: Session): Promise<void> {
  await writeJson(SESSION_FILE, session);
}

export function id(): string {
  return Math.random().toString(36).slice(2);
}

// ---- Server helpers ----
type DemoDb = { users: LogUser[]; teams: LogTeam[] };
const LOG_SERVER_URLS = [
  'http://127.0.0.1:5555', // web / iOS sim
  'http://10.0.2.2:5555',  // Android emulator
];

async function getDbFromServer(): Promise<DemoDb | null> {
  for (const base of LOG_SERVER_URLS) {
    try {
      const res = await fetch(base + '/db');
      if (res.ok) {
        const json = await res.json();
        if (json && json.ok) return { users: json.users || [], teams: json.teams || [] };
      }
    } catch {}
  }
  return null;
}

async function postEvent(event: { type: string; payload?: any }): Promise<boolean> {
  for (const base of LOG_SERVER_URLS) {
    try {
      const res = await fetch(base + '/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (res.ok) return true;
    } catch {}
  }
  return false;
}
