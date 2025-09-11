import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import {
  initDb,
  listUsers as dbListUsers,
  saveUsers as dbSaveUsers,
  listTeams as dbListTeams,
  saveTeams as dbSaveTeams,
  getSession,
  setSession,
  appendAuthLog,
  id as dbId,
  type LogUser,
  type LogTeam,
} from '@/lib/logDb';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'coach' | 'admin';
  sportsPreferences: string[];
  pastParticipation?: string;
  achievements?: string;
  // Approval flags
  approvedByCoach: boolean; // For participants (student/staff)
  approvedByAdmin: boolean; // For coaches
  blocked?: boolean; // Admin can block any user
  // Coach-specific fields
  sportsExpertise?: string;
  teamManagement?: string;
  availability?: string;
};

export type Team = {
  id: string;
  name: string;
  blocked?: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  register: (data: Omit<User, 'id' | 'approvedByCoach' | 'approvedByAdmin'> & { password: string }) => Promise<{ success: boolean; message?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<Omit<User, 'id' | 'email'>>) => Promise<void>;
  // Demo helper: simulate coach approval for the current user
  approveMeForDemo: () => void;
  approveByEmailForDemo: (email: string) => void;
  // Admin helpers
  listUsers: () => User[];
  listTeams: () => Team[];
  adminApproveUser: (userId: string) => void; // approve coach or participant accordingly
  adminBlockUser: (userId: string, blocked: boolean) => void;
  adminDeleteUser: (userId: string) => void;
  adminUpdateUser: (userId: string, updates: Partial<Omit<User, 'id' | 'email'>>) => void;
  adminAddTeam: (name: string) => void;
  adminDeleteTeam: (teamId: string) => void;
  adminBlockTeam: (teamId: string, blocked: boolean) => void;
  // Coach helper
  coachApproveUser: (userId: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local caches come from file-based JSON "DB"

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [usersCache, setUsersCache] = useState<User[]>([]);
  const [teamsCache, setTeamsCache] = useState<Team[]>([]);

  const isAuthenticated = !!user;

  // Initialize local DB, hydrate session, and load caches
  useEffect(() => {
    (async () => {
      await initDb();
      // Load caches
      const rawUsers = await dbListUsers();
      const users: User[] = rawUsers.map(toUser);
      // Seed default admin if none exists
      if (!users.some((u) => u.role === 'admin')) {
        const adminUser: User = {
          id: dbId(),
          name: 'System Admin',
          email: 'admin@vu.local',
          role: 'admin',
          sportsPreferences: [],
          approvedByCoach: true,
          approvedByAdmin: true,
          blocked: false,
        } as User;
        const adminLog = toLogUser(adminUser, 'admin123');
        await dbSaveUsers([...rawUsers, adminLog]);
        await appendAuthLog('seed_admin', { email: adminUser.email, id: adminUser.id });
        const refreshed = await dbListUsers();
        setUsersCache(refreshed.map(toUser));
      } else {
        setUsersCache(users);
      }
      const rawTeams = await dbListTeams();
      const teams: Team[] = rawTeams.map((t) => ({ id: t.id, name: t.name, blocked: t.blocked }));
      setTeamsCache(teams);

      // Hydrate session
      const session = await getSession();
      if (session && session.userId) {
        const me = users.find((u) => u.id === session.userId) || null;
        setUser(me ?? null);
      } else {
        setUser(null);
      }
    })();
  }, []);

  // Helpers to translate between LogUser and User
  const toUser = (lu: LogUser): User => ({
    id: lu.id,
    name: lu.name,
    email: lu.email,
    role: lu.role,
    sportsPreferences: lu.sportsPreferences || [],
    pastParticipation: lu.pastParticipation,
    achievements: lu.achievements,
    approvedByCoach: !!lu.approvedByCoach,
    approvedByAdmin: !!lu.approvedByAdmin,
    blocked: !!lu.blocked,
    sportsExpertise: lu.sportsExpertise,
    teamManagement: lu.teamManagement,
    availability: lu.availability,
  });

  const toLogUser = (u: User, password: string): LogUser => ({
    id: u.id,
    name: u.name,
    email: u.email,
    password,
    role: u.role,
    sportsPreferences: u.sportsPreferences || [],
    pastParticipation: u.pastParticipation,
    achievements: u.achievements,
    approvedByCoach: !!u.approvedByCoach,
    approvedByAdmin: !!u.approvedByAdmin,
    blocked: !!u.blocked,
    sportsExpertise: u.sportsExpertise,
    teamManagement: u.teamManagement,
    availability: u.availability,
  });

  const register: AuthContextType['register'] = async (data) => {
    try {
      const usersRaw = await dbListUsers();
      const exists = usersRaw.some((u) => u.email.toLowerCase() === data.email.toLowerCase());
      if (exists) return { success: false, message: 'Email already registered' };
      const uid = dbId();
      const profile: User = {
        id: uid,
        name: data.name,
        email: data.email,
        role: data.role,
        sportsPreferences: data.sportsPreferences || [],
        pastParticipation: data.pastParticipation,
        achievements: data.achievements,
        sportsExpertise: data.role === 'coach' ? data.sportsExpertise : undefined,
        teamManagement: data.role === 'coach' ? data.teamManagement : undefined,
        availability: data.role === 'coach' ? data.availability : undefined,
        approvedByCoach: false,
        approvedByAdmin: false,
        blocked: false,
      };
      const newLogUser = toLogUser(profile, data.password);
      await dbSaveUsers([...usersRaw, newLogUser]);
      await appendAuthLog('register', { email: data.email, role: data.role, id: uid });
      // Refresh caches
      const updated = await dbListUsers();
      setUsersCache(updated.map(toUser));
      const pendingMsg = profile.role === 'coach' ? 'Your account is pending admin approval.' : 'Your account is pending coach approval.';
      Alert.alert('Registration submitted', pendingMsg);
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Registration failed' };
    }
  };

  const login: AuthContextType['login'] = async (email, password) => {
    try {
      const usersRaw = await dbListUsers();
      const lu = usersRaw.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!lu) return { success: false, message: 'Invalid credentials' };
      const profile = toUser(lu);
      if (profile.blocked) return { success: false, message: 'Your account is blocked by admin.' };
      if (profile.role === 'coach') {
        if (!profile.approvedByAdmin) return { success: false, message: 'Your account is pending admin approval.' };
      } else if (profile.role === 'student' || profile.role === 'staff') {
        if (!profile.approvedByCoach) return { success: false, message: 'Your account is pending coach approval.' };
      }
      setUser(profile);
      await setSession({ userId: profile.id });
      await appendAuthLog('login', { email: profile.email, id: profile.id });
      return { success: true };
    } catch (e: any) {
      return { success: false, message: 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setSession(null);
    appendAuthLog('logout').catch(() => {});
  };

  const updateProfile: AuthContextType['updateProfile'] = async (updates) => {
    if (!user) return;
    const all = await dbListUsers();
    const idx = all.findIndex((u) => u.id === user.id);
    if (idx < 0) return;
    const merged: LogUser = { ...all[idx], ...updates } as LogUser;
    all[idx] = merged;
    await dbSaveUsers(all);
    const newProfile = toUser(merged);
    setUser(newProfile);
    setUsersCache(all.map(toUser));
    await appendAuthLog('update_profile', { id: newProfile.id });
  };

  const approveMeForDemo = async () => {
    if (!user) return;
    const all = await dbListUsers();
    const idx = all.findIndex((u) => u.id === user.id);
    if (idx < 0) return;
    const updates = user.role === 'coach' ? { approvedByAdmin: true } : { approvedByCoach: true };
    const merged: LogUser = { ...all[idx], ...updates } as LogUser;
    all[idx] = merged;
    await dbSaveUsers(all);
    setUser(toUser(merged));
    setUsersCache(all.map(toUser));
  };

  const approveByEmailForDemo = async (email: string) => {
    const all = await dbListUsers();
    const idx = all.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    if (idx < 0) return Alert.alert('Demo', `No user found for ${email}`);
    const target = toUser(all[idx]);
    const updates = target.role === 'coach' ? { approvedByAdmin: true } : { approvedByCoach: true };
    const merged: LogUser = { ...all[idx], ...updates } as LogUser;
    all[idx] = merged;
    await dbSaveUsers(all);
    setUsersCache(all.map(toUser));
    if (user && user.id === merged.id) setUser(toUser(merged));
    Alert.alert('Demo', `Approved ${email}`);
  };

  // Admin methods
  const listUsers = () => [...usersCache];
  const listTeams = () => [...teamsCache];
  const adminApproveUser = async (userId: string) => {
    const all = await dbListUsers();
    const idx = all.findIndex((u) => u.id === userId);
    if (idx < 0) return;
    const target = toUser(all[idx]);
    const updates = target.role === 'coach' ? { approvedByAdmin: true } : { approvedByCoach: true };
    const merged: LogUser = { ...all[idx], ...updates } as LogUser;
    all[idx] = merged;
    await dbSaveUsers(all);
    setUsersCache(all.map(toUser));
    if (user && user.id === merged.id) setUser(toUser(merged));
  };
  const adminBlockUser = async (userId: string, blocked: boolean) => {
    const all = await dbListUsers();
    const idx = all.findIndex((u) => u.id === userId);
    if (idx < 0) return;
    all[idx] = { ...all[idx], blocked } as LogUser;
    await dbSaveUsers(all);
    setUsersCache(all.map(toUser));
    if (user && user.id === userId) setUser(toUser(all[idx]));
  };
  const adminDeleteUser = async (userId: string) => {
    const all = await dbListUsers();
    const filtered = all.filter((u) => u.id !== userId);
    await dbSaveUsers(filtered);
    setUsersCache(filtered.map(toUser));
    if (user && user.id === userId) logout();
  };
  const adminUpdateUser = async (userId: string, updates: Partial<Omit<User, 'id' | 'email'>>) => {
    const all = await dbListUsers();
    const idx = all.findIndex((u) => u.id === userId);
    if (idx < 0) return;
    const merged: LogUser = { ...all[idx], ...updates } as LogUser;
    all[idx] = merged;
    await dbSaveUsers(all);
    setUsersCache(all.map(toUser));
    if (user && user.id === userId) setUser(toUser(merged));
  };
  const adminAddTeam = async (name: string) => {
    const all = await dbListTeams();
    const newTeam: LogTeam = { id: dbId(), name, blocked: false };
    const updated = [...all, newTeam];
    await dbSaveTeams(updated);
    setTeamsCache(updated.map((t) => ({ id: t.id, name: t.name, blocked: t.blocked })));
  };
  const adminDeleteTeam = async (teamId: string) => {
    const all = await dbListTeams();
    const updated = all.filter((t) => t.id !== teamId);
    await dbSaveTeams(updated);
    setTeamsCache(updated.map((t) => ({ id: t.id, name: t.name, blocked: t.blocked })));
  };
  const adminBlockTeam = async (teamId: string, blocked: boolean) => {
    const all = await dbListTeams();
    const idx = all.findIndex((t) => t.id === teamId);
    if (idx < 0) return;
    all[idx] = { ...all[idx], blocked } as LogTeam;
    await dbSaveTeams(all);
    setTeamsCache(all.map((t) => ({ id: t.id, name: t.name, blocked: t.blocked })));
  };

  // Coach can approve participants (student/staff) only
  const coachApproveUser = async (userId: string) => {
    if (!user || user.role !== 'coach') return; // Only coaches can call this
    const all = await dbListUsers();
    const idx = all.findIndex((u) => u.id === userId);
    if (idx < 0) return;
    const target = toUser(all[idx]);
    // Only allow approving non-coach, non-admin
    if (target.role === 'student' || target.role === 'staff') {
      const merged: LogUser = { ...all[idx], approvedByCoach: true } as LogUser;
      all[idx] = merged;
      await dbSaveUsers(all);
      setUsersCache(all.map(toUser));
      if (user && user.id === merged.id) setUser(toUser(merged));
      await appendAuthLog('coach_approve_user', { coachId: user.id, userId });
    }
  };

  const cryptoRandom = () => Math.random().toString(36).slice(2);

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    approveMeForDemo,
    approveByEmailForDemo,
    listUsers,
    listTeams,
    adminApproveUser,
    adminBlockUser,
    adminDeleteUser,
    adminUpdateUser,
    adminAddTeam,
    adminDeleteTeam,
    adminBlockTeam,
    coachApproveUser,
  }), [user, usersCache, teamsCache]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
