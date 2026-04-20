import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { api, getToken, setToken, clearToken, checkApiAvailable } from './api';
import {
  initialUsers, initialGroups, initialPosts, initialPrayers, initialPastors,
  loadFromStorage, saveToStorage,
} from './mockData';

// ============================================================
// Types  (unchanged – kept for all downstream imports)
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'pastor';
  pastorId?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  pincode?: string;
}

export interface Group {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  type: 'public' | 'private';
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: string;
  members: string[];
  avatar?: string;
  joinRequests?: string[];
  contentManagers?: string[];
}

export interface Post {
  id: string;
  groupId: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  imageUrls?: string[];
  fileUrl?: string;
  fileName?: string;
  commentsEnabled: boolean;
  createdAt: string;
  likes: string[];
  reactions: { [key: string]: string[] };
  comments: Comment[];
  meeting?: { title: string; date: string; time: string; endTime?: string; meetLink: string };
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Prayer {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  endTime?: string;
  category?: 'personal' | 'family' | 'community' | 'gratitude' | 'intercession';
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  imageUrl?: string;
  meetLink?: string;
  groupId?: string;
  postId?: string;
  createdAt: string;
}

export interface PastorContent {
  id: string;
  type: 'photo' | 'writing' | 'video';
  title?: string;
  content?: string;
  url?: string;
  thumbnail?: string;
  description?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  _isNew?: boolean;
}

export interface PastorBook {
  id: string;
  title: string;
  description: string;
  price: number;
  coverImage?: string;
  pageCount?: number;
  publishedDate?: string;
  category?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  _isNew?: boolean;
  coverFile?: File;
}

export interface Pastor {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  email?: string;
  phone?: string;
  church?: string;
  photo?: string;
  address?: string;
  pincode?: string;
  locationLink?: string;
  specialties?: string[];
  yearsOfService?: number;
  donationLink?: string;
  content?: PastorContent[];
  books?: PastorBook[];
  createdAt: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  groups: Group[];
  posts: Post[];
  prayers: Prayer[];
  pastors: Pastor[];
  login: (email: string, password: string) => boolean | Promise<boolean>;
  signup: (data: { name: string; email?: string; password: string; phone: string; address?: string; pincode: string }) => boolean | Promise<boolean>;
  logout: () => void;
  createGroup: (group: Omit<Group, 'id' | 'status' | 'createdAt' | 'members'>, avatarFile?: File) => void;
  updateGroup: (groupId: string, updates: Partial<Group>, avatarFile?: File) => void;
  leaveGroup: (groupId: string) => void;
  joinGroup: (groupId: string) => void;
  requestJoinGroup: (groupId: string) => void;
  approveJoinRequest: (groupId: string, userId: string) => void;
  rejectJoinRequest: (groupId: string, userId: string) => void;
  addContentManager: (groupId: string, userId: string) => void;
  removeContentManager: (groupId: string, userId: string) => void;
  approveGroup: (groupId: string) => void;
  rejectGroup: (groupId: string) => void;
  canPostInGroup: (groupId: string) => boolean;
  createPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'reactions' | 'comments'>, imageFile?: File, attachmentFile?: File) => void;
  updatePost: (postId: string, updates: Partial<Pick<Post, 'content' | 'imageUrl' | 'meeting'>>) => void;
  deletePost: (postId: string) => void;
  likePost: (postId: string) => void;
  addReaction: (postId: string, reaction: string) => void;
  addComment: (postId: string, content: string) => void;
  getUserById: (userId: string) => User | undefined;
  getGroupById: (groupId: string) => Group | undefined;
  getUserGroups: () => Group[];
  createPrayer: (prayer: Omit<Prayer, 'id' | 'createdAt' | 'userId'>) => void;
  updatePrayer: (prayerId: string, updates: Partial<Omit<Prayer, 'id' | 'userId' | 'createdAt'>>) => void;
  deletePrayer: (prayerId: string) => void;
  getPrayersByDate: (date: string) => Prayer[];
  getUserPrayers: () => Prayer[];
  createAdminUser: (userData: { name: string; email: string }) => boolean;
  updateAdminUser: (userId: string, userData: { name: string; email: string }) => void;
  deleteAdminUser: (userId: string) => boolean;
  createPastor: (pastorData: any) => void;
  updatePastor: (pastorId: string, updates: any) => void;
  deletePastor: (pastorId: string) => void;
  getPastorById: (pastorId: string) => Pastor | undefined;
  getPastorByUserId: (userId: string) => Pastor | undefined;
  approvePastorContent: (pastorId: string, contentId: string) => void;
  rejectPastorContent: (pastorId: string, contentId: string) => void;
  approvePastorBook: (pastorId: string, bookId: string) => void;
  rejectPastorBook: (pastorId: string, bookId: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================================
// API → frontend normalizers
// ============================================================

function normalizeUser(u: any): User {
  return { id: u.id, name: u.name, email: u.email, role: u.role, pastorId: u.pastor_id || u.pastorId, avatar: u.avatar, phone: u.phone, address: u.address, pincode: u.pincode };
}
function normalizeGroup(g: any): Group {
  return { id: g.id, name: g.name, subtitle: g.subtitle, description: g.description, type: g.type, status: g.status, createdBy: g.created_by || g.createdBy, createdAt: g.created_at || g.createdAt, members: g.members || [], avatar: g.avatar, joinRequests: g.join_requests || g.joinRequests || [], contentManagers: g.content_managers || g.contentManagers || [] };
}
function normalizePost(p: any): Post {
  return { id: p.id, groupId: p.groupId || p.group_id, authorId: p.authorId || p.author_id, content: p.content, imageUrl: p.imageUrl || p.image_url, imageUrls: p.imageUrls || p.image_urls || [], fileUrl: p.fileUrl || p.file_url, fileName: p.fileName || p.file_name, commentsEnabled: p.commentsEnabled ?? p.comments_enabled ?? true, createdAt: p.createdAt || p.created_at, likes: p.likes || [], reactions: p.reactions || {}, comments: (p.comments || []).map((c: any) => ({ id: c.id, postId: c.postId || c.post_id, authorId: c.authorId || c.author_id, content: c.content, createdAt: c.createdAt || c.created_at })), meeting: p.meeting ? { title: p.meeting.title, date: p.meeting.date, time: p.meeting.time, endTime: p.meeting.endTime || p.meeting.end_time, meetLink: p.meeting.meetLink || p.meeting.meet_link } : undefined };
}
function normalizePrayer(p: any): Prayer {
  const et = p.endTime || p.end_time;
  return { id: p.id, userId: p.userId || p.user_id, title: p.title, description: p.description, date: typeof p.date === 'string' ? p.date.substring(0, 10) : p.date, time: typeof p.time === 'string' ? p.time.substring(0, 5) : p.time, endTime: et ? (typeof et === 'string' ? et.substring(0, 5) : et) : undefined, category: p.category, isRecurring: p.isRecurring ?? p.is_recurring ?? false, recurringPattern: p.recurringPattern || p.recurring_pattern, imageUrl: p.imageUrl || p.image_url, meetLink: p.meetLink || p.meet_link, groupId: p.groupId || p.group_id, postId: p.postId || p.post_id, createdAt: p.createdAt || p.created_at };
}
function normalizePastor(p: any): Pastor {
  return { id: p.id, name: p.name, title: p.title, bio: p.bio, email: p.email, phone: p.phone, church: p.church, photo: p.photo, address: p.address, pincode: p.pincode, locationLink: p.locationLink || p.location_link, specialties: p.specialties || [], yearsOfService: p.yearsOfService ?? p.years_of_service, donationLink: p.donationLink || p.donation_link, content: (p.content || []).map((c: any) => ({ id: c.id, type: c.type, title: c.title, content: c.content, url: c.url, thumbnail: c.thumbnail, description: c.description, approvalStatus: c.approvalStatus || c.approval_status || 'approved', createdAt: c.createdAt || c.created_at })), books: (p.books || []).map((b: any) => ({ id: b.id, title: b.title, description: b.description, price: typeof b.price === 'string' ? parseFloat(b.price) : (b.price || 0), coverImage: b.coverImage || b.cover_image, pageCount: b.pageCount ?? b.page_count, publishedDate: b.publishedDate || b.published_date, category: b.category, approvalStatus: b.approvalStatus || b.approval_status || 'approved', createdAt: b.createdAt || b.created_at })), createdAt: p.createdAt || p.created_at };
}

// ============================================================
// Provider  —  Hybrid: API-first, localStorage fallback
// ============================================================

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [prayers, setPrayers] = useState<Prayer[]>(initialPrayers);
  const [pastors, setPastors] = useState<Pastor[]>(initialPastors);

  // offline = true  → localStorage mode  (original behaviour)
  // offline = false → API mode
  const offlineRef = useRef(true); // start offline, switch to online if probe succeeds

  // ---- localStorage save (offline mode only) ----

  const save = useCallback(() => {
    if (!offlineRef.current) return;
    // Defer to next tick so state updates have flushed
    setTimeout(() => {
      saveToStorage({ currentUser, users, groups, posts, prayers, pastors });
    }, 0);
  }, [currentUser, users, groups, posts, prayers, pastors]);

  // Persist to localStorage whenever state changes (offline mode only)
  useEffect(() => { save(); }, [save]);

  // ---- Online-mode refresh helpers ----

  const refreshGroups = useCallback(async () => { try { setGroups((await api.getGroups()).map(normalizeGroup)); } catch (e) { console.error('groups', e); } }, []);
  const refreshPosts = useCallback(async () => { try { setPosts((await api.getFeed()).map(normalizePost)); } catch (e) { console.error('posts', e); } }, []);
  const refreshPrayers = useCallback(async () => { try { setPrayers((await api.getPrayers()).map(normalizePrayer)); } catch (e) { console.error('prayers', e); } }, []);
  const refreshPastors = useCallback(async () => { try { setPastors((await api.getPastors()).map(normalizePastor)); } catch (e) { console.error('pastors', e); } }, []);
  const refreshUsers = useCallback(async () => { try { setUsers((await api.getUsers()).map(normalizeUser)); } catch { /* non-admin */ } }, []);

  // ---- Init: probe API, fallback to localStorage ----

  useEffect(() => {
    const init = async () => {
      const online = await checkApiAvailable();

      if (online) {
        offlineRef.current = false;
        console.log('[MissionSagacity] Running in ONLINE mode (API connected)');

        await Promise.all([refreshGroups(), refreshPastors()]);

        const token = getToken();
        if (token) {
          try {
            const me = await api.getMe();
            setCurrentUser(normalizeUser(me));
            await Promise.all([refreshPosts(), refreshPrayers(), refreshUsers()]);
          } catch {
            clearToken();
            try { setPosts((await api.getFeed()).map(normalizePost)); } catch { /* ok */ }
          }
        } else {
          try { setPosts((await api.getFeed()).map(normalizePost)); } catch { /* ok */ }
        }
      } else {
        offlineRef.current = true;
        console.log('[MissionSagacity] Running in OFFLINE mode (localStorage mock data)');

        // Load saved state or use fresh defaults
        const saved = loadFromStorage();
        if (saved) {
          setCurrentUser(saved.currentUser);
          setUsers(saved.users || initialUsers);
          setGroups(saved.groups || initialGroups);
          setPosts(saved.posts || initialPosts);
          setPrayers(saved.prayers || initialPrayers);
          setPastors(saved.pastors || initialPastors);
        }
        // else keep the initial* defaults already in state
      }
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ================================================================
  // AUTH
  // ================================================================

  const login = async (email: string, password: string): Promise<boolean> => {
    if (offlineRef.current) {
      // Offline: simple mock auth by email match
      const user = users.find((u) => u.email === email);
      if (user) { setCurrentUser(user); return true; }
      return false;
    }
    try {
      const { token, user } = await api.login(email, password);
      setToken(token);
      setCurrentUser(normalizeUser(user));
      await Promise.all([refreshGroups(), refreshPosts(), refreshPrayers(), refreshUsers()]);
      return true;
    } catch (e) { console.error('Login failed:', e); return false; }
  };

  const signup = async (data: { name: string; email?: string; password: string; phone: string; address?: string; pincode: string }): Promise<boolean> => {
    if (offlineRef.current) {
      if (users.find((u) => u.phone === data.phone)) return false;
      if (data.email && users.find((u) => u.email === data.email)) return false;
      const newUser: User = { id: `user-${Date.now()}`, name: data.name, email: data.email || `${data.phone}@missionsagacity.app`, role: 'user', phone: data.phone, address: data.address || '', pincode: data.pincode };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      return true;
    }
    try {
      const { token, user } = await api.signup(data);
      setToken(token);
      setCurrentUser(normalizeUser(user));
      await Promise.all([refreshGroups(), refreshPosts(), refreshPrayers()]);
      return true;
    } catch (e) { console.error('Signup failed:', e); return false; }
  };

  const logout = () => {
    clearToken();
    setCurrentUser(null);
    if (!offlineRef.current) {
      refreshGroups();
      api.getFeed().then(d => setPosts(d.map(normalizePost))).catch(() => {});
      setPrayers([]); setUsers([]);
    }
  };

  // ================================================================
  // ADMIN USERS
  // ================================================================

  const createAdminUser = (userData: { name: string; email: string }) => {
    if (offlineRef.current) {
      if (users.find((u) => u.email === userData.email)) return false;
      const nu: User = { id: `user-${Date.now()}`, name: userData.name, email: userData.email, role: 'admin' };
      setUsers((prev) => [...prev, nu]);
      return true;
    }
    api.createUser(userData).then(() => refreshUsers()).catch(e => console.error(e));
    return true;
  };

  const updateAdminUser = (userId: string, userData: { name: string; email: string }) => {
    if (offlineRef.current) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ...userData } : u));
      return;
    }
    api.updateUser(userId, userData).then(() => refreshUsers()).catch(e => console.error(e));
  };

  const deleteAdminUser = (userId: string) => {
    if (userId === currentUser?.id) return false;
    if (offlineRef.current) {
      const admins = users.filter((u) => u.role === 'admin');
      if (admins.length <= 1) return false;
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      return true;
    }
    api.deleteUser(userId).then(() => refreshUsers()).catch(e => console.error(e));
    return true;
  };

  // ================================================================
  // GROUPS (Flocks)
  // ================================================================

  const createGroup = (group: Omit<Group, 'id' | 'createdAt' | 'status' | 'members'>) => {
    if (offlineRef.current) {
      if (!currentUser) return;
      const ng: Group = { ...group, id: `group-${Date.now()}`, createdAt: new Date().toISOString(), status: 'pending', members: [currentUser.id], joinRequests: [], contentManagers: [currentUser.id] };
      setGroups((prev) => [...prev, ng]);
      return;
    }
    api.createGroup({ name: group.name, subtitle: group.subtitle, description: group.description, type: group.type, avatar: group.avatar }).then(() => refreshGroups()).catch(e => console.error(e));
  };

  const joinGroup = (groupId: string) => {
    if (offlineRef.current) {
      if (!currentUser) return;
      setGroups((prev) => prev.map((g) => g.id === groupId && !g.members.includes(currentUser.id) ? { ...g, members: [...g.members, currentUser.id] } : g));
      return;
    }
    api.joinGroup(groupId).then(() => refreshGroups()).catch(e => console.error(e));
  };

  const requestJoinGroup = (groupId: string) => {
    if (offlineRef.current) {
      if (!currentUser) return;
      setGroups((prev) => prev.map((g) => {
        if (g.id !== groupId || g.members.includes(currentUser.id)) return g;
        const existing = g.joinRequests || [];
        if (existing.includes(currentUser.id)) return g;
        return { ...g, joinRequests: [...existing, currentUser.id] };
      }));
      return;
    }
    api.requestJoinGroup(groupId).then(() => refreshGroups()).catch(e => console.error(e));
  };

  const approveJoinRequest = (groupId: string, userId: string) => {
    if (offlineRef.current) {
      setGroups((prev) => prev.map((g) => {
        if (g.id !== groupId) return g;
        return { ...g, members: g.members.includes(userId) ? g.members : [...g.members, userId], joinRequests: (g.joinRequests || []).filter((id) => id !== userId) };
      }));
      return;
    }
    api.approveJoinRequest(groupId, userId).then(() => refreshGroups()).catch(e => console.error(e));
  };

  const rejectJoinRequest = (groupId: string, userId: string) => {
    if (offlineRef.current) {
      setGroups((prev) => prev.map((g) => g.id !== groupId ? g : { ...g, joinRequests: (g.joinRequests || []).filter((id) => id !== userId) }));
      return;
    }
    api.rejectJoinRequest(groupId, userId).then(() => refreshGroups()).catch(e => console.error(e));
  };

  const addContentManager = (groupId: string, userId: string) => {
    if (offlineRef.current) {
      setGroups((prev) => prev.map((g) => {
        if (g.id !== groupId) return g;
        const m = g.contentManagers || [];
        if (m.includes(userId)) return g;
        return { ...g, contentManagers: [...m, userId] };
      }));
      return;
    }
    api.addContentManager(groupId, userId).then(() => refreshGroups()).catch(e => console.error(e));
  };

  const removeContentManager = (groupId: string, userId: string) => {
    if (offlineRef.current) {
      setGroups((prev) => prev.map((g) => g.id !== groupId ? g : { ...g, contentManagers: (g.contentManagers || []).filter((id) => id !== userId) }));
      return;
    }
    api.removeContentManager(groupId, userId).then(() => refreshGroups()).catch(e => console.error(e));
  };

  const leaveGroup = (groupId: string) => {
    if (offlineRef.current) {
      if (!currentUser) return;
      setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, members: (g.members || []).filter((id) => id !== currentUser.id), contentManagers: (g.contentManagers || []).filter((id) => id !== currentUser.id) } : g));
      return;
    }
    api.leaveGroup(groupId).then(() => refreshGroups()).catch(e => console.error(e));
  };

  const approveGroup = (groupId: string) => {
    if (offlineRef.current) { setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, status: 'approved' } : g)); return; }
    api.approveGroup(groupId).then(() => refreshGroups()).catch(e => console.error(e));
  };

  const rejectGroup = (groupId: string) => {
    if (offlineRef.current) { setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, status: 'rejected' } : g)); return; }
    api.rejectGroup(groupId).then(() => refreshGroups()).catch(e => console.error(e));
  };

  const updateGroup = async (groupId: string, updates: Partial<Group>, avatarFile?: File) => {
    if (offlineRef.current) { setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, ...updates } : g)); return; }
    try {
      const formData = new FormData();
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id') {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await api.updateGroup(groupId, formData);
      refreshGroups();
    } catch (err) {
      console.error('Failed to update group:', err);
    }
  };

  const canPostInGroup = (groupId: string): boolean => {
    if (!currentUser) return false;
    const group = groups.find((g) => g.id === groupId);
    if (!group) return false;
    if (currentUser.role === 'admin') return true;
    if (group.createdBy === currentUser.id) return true;
    if ((group.contentManagers || []).includes(currentUser.id)) return true;
    return false;
  };

  // ================================================================
  // POSTS
  // ================================================================

  const createPost = (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'reactions' | 'comments'>, imageFile?: File, attachmentFile?: File) => {
    if (offlineRef.current) {
      const np: Post = { ...post, id: `post-${Date.now()}`, commentsEnabled: post.commentsEnabled !== undefined ? post.commentsEnabled : true, createdAt: new Date().toISOString(), likes: [], reactions: {}, comments: [] };
      setPosts((prev) => [np, ...prev]);
      return;
    }
    
    const formData = new FormData();
    formData.append('groupId', post.groupId);
    formData.append('content', post.content);
    formData.append('commentsEnabled', String(post.commentsEnabled));
    if (post.meeting) {
      formData.append('meeting', JSON.stringify(post.meeting));
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (attachmentFile) {
      formData.append('file', attachmentFile);
    }

    api.createPost(formData).then(() => refreshPosts()).catch(e => console.error(e));
  };

  const updatePost = (postId: string, updates: Partial<Pick<Post, 'content' | 'imageUrl' | 'meeting'>>) => {
    if (offlineRef.current) { setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, ...updates } : p)); return; }
    api.updatePost(postId, updates).then(() => refreshPosts()).catch(e => console.error(e));
  };

  const deletePost = (postId: string) => {
    if (offlineRef.current) { setPosts((prev) => prev.filter((p) => p.id !== postId)); return; }
    api.deletePost(postId).then(() => refreshPosts()).catch(e => console.error(e));
  };

  const likePost = (postId: string) => {
    if (!currentUser) return;
    setPosts((prev) => prev.map((p) => {
      if (p.id !== postId) return p;
      const liked = p.likes.includes(currentUser.id);
      return { ...p, likes: liked ? p.likes.filter((id) => id !== currentUser.id) : [...p.likes, currentUser.id] };
    }));
    if (!offlineRef.current) api.likePost(postId).catch(() => refreshPosts());
  };

  const addReaction = (postId: string, reaction: string) => {
    if (!currentUser) return;
    setPosts((prev) => prev.map((p) => {
      if (p.id !== postId) return p;
      const reactions = { ...p.reactions };
      if (reactions[reaction]) {
        if (reactions[reaction].includes(currentUser.id)) {
          reactions[reaction] = reactions[reaction].filter((id) => id !== currentUser.id);
          if (reactions[reaction].length === 0) delete reactions[reaction];
        } else { reactions[reaction] = [...reactions[reaction], currentUser.id]; }
      } else { reactions[reaction] = [currentUser.id]; }
      return { ...p, reactions };
    }));
    if (!offlineRef.current) api.reactToPost(postId, reaction).catch(() => refreshPosts());
  };

  const addComment = (postId: string, content: string) => {
    if (!currentUser) return;
    const nc: Comment = { id: `comment-${Date.now()}`, postId, authorId: currentUser.id, content, createdAt: new Date().toISOString() };
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, comments: [...p.comments, nc] } : p));
    if (!offlineRef.current) api.addComment(postId, content).catch(() => refreshPosts());
  };

  // ---- Lookups ----

  const getUserById = (userId: string) => users.find((u) => u.id === userId);
  const getGroupById = (groupId: string) => groups.find((g) => g.id === groupId);
  const getUserGroups = () => { if (!currentUser) return []; return groups.filter((g) => g.members.includes(currentUser.id) && g.status === 'approved'); };

  // ================================================================
  // PRAYERS (Gatherings)
  // ================================================================

  const createPrayer = (prayer: Omit<Prayer, 'id' | 'createdAt' | 'userId'>) => {
    if (offlineRef.current) {
      if (!currentUser) return;
      const np: Prayer = { ...prayer, id: `prayer-${Date.now()}`, createdAt: new Date().toISOString(), userId: currentUser.id };
      setPrayers((prev) => [np, ...prev]);

      // Auto-create announcement post if linked to a group
      if (np.groupId) {
        const group = groups.find((g) => g.id === np.groupId);
        if (group) {
          const fd = new Date(np.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          let pc = `\u{1F64F} Join us in prayer!\n\n"${np.title}"\n\n`;
          if (np.description) pc += `${np.description}\n\n`;
          pc += `\u{1F4C5} ${fd}\n\u{23F0} ${np.time}\n`;
          if (np.isRecurring) pc += `\u{1F504} Repeats ${np.recurringPattern}\n`;
          pc += `\nLet's come together in prayer and support! \u{1F54A}\uFE0F`;
          const newPost: Post = { id: `post-${Date.now()}`, groupId: np.groupId, authorId: currentUser.id, content: pc, imageUrl: np.imageUrl, commentsEnabled: true, createdAt: new Date().toISOString(), likes: [], reactions: {}, comments: [], meeting: np.meetLink ? { title: np.title, date: np.date, time: np.time, meetLink: np.meetLink } : undefined };
          setPosts((prev) => [newPost, ...prev]);
          np.postId = newPost.id;
        }
      }
      return;
    }
    api.createPrayer({ title: prayer.title, description: prayer.description, date: prayer.date, time: prayer.time, endTime: prayer.endTime, category: prayer.category, isRecurring: prayer.isRecurring, recurringPattern: prayer.recurringPattern, imageUrl: prayer.imageUrl, meetLink: prayer.meetLink, groupId: prayer.groupId })
      .then(() => { refreshPrayers(); if (prayer.groupId) refreshPosts(); })
      .catch(e => console.error(e));
  };

  const updatePrayer = (prayerId: string, updates: Partial<Omit<Prayer, 'id' | 'userId' | 'createdAt'>>) => {
    if (offlineRef.current) {
      setPrayers((prev) => prev.map((p) => p.id === prayerId ? { ...p, ...updates } : p));
      return;
    }
    api.updatePrayer(prayerId, updates).then(() => { refreshPrayers(); refreshPosts(); }).catch(e => console.error(e));
  };

  const deletePrayer = (prayerId: string) => {
    if (offlineRef.current) { setPrayers((prev) => prev.filter((p) => p.id !== prayerId)); return; }
    api.deletePrayer(prayerId).then(() => refreshPrayers()).catch(e => console.error(e));
  };

  const getPrayersByDate = (date: string) => prayers.filter((p) => (typeof p.date === 'string' ? p.date.substring(0, 10) : p.date) === date);
  const getUserPrayers = () => { if (!currentUser) return []; return prayers.filter((p) => p.userId === currentUser.id); };

  // ================================================================
  // PASTORS (Sages)
  // ================================================================

  const createPastor = (pastorData: any) => {
    if (offlineRef.current) {
      const pastorId = `pastor-${Date.now()}`;
      const np: Pastor = {
        id: pastorId, name: pastorData.name || '', title: pastorData.title || '', bio: pastorData.bio || '', email: pastorData.email || '', phone: pastorData.phone || '', church: pastorData.church || '', photo: pastorData.photo || '',
        specialties: typeof pastorData.specialties === 'string' ? pastorData.specialties.split(',').map((s: string) => s.trim()).filter(Boolean) : Array.isArray(pastorData.specialties) ? pastorData.specialties : [],
        yearsOfService: pastorData.yearsOfService ? Number(pastorData.yearsOfService) : undefined, address: pastorData.address || '', pincode: pastorData.pincode || '', locationLink: pastorData.locationLink || '', donationLink: pastorData.donationLink || '',
        content: Array.isArray(pastorData.content) ? pastorData.content.map((c: any) => ({ id: `content-${Date.now()}-${c.type}`, type: c.type, title: c.title || '', content: c.content || '', url: c.url || '', description: c.description || '', createdAt: new Date().toISOString() })) : [],
        books: Array.isArray(pastorData.books) ? pastorData.books.map((b: any) => ({ id: `book-${Date.now()}-${b.title}`, title: b.title || '', description: b.description || '', price: b.price ? Number(b.price) : 0, coverImage: b.coverImage || '', pageCount: b.pageCount ? Number(b.pageCount) : undefined, publishedDate: b.publishedDate || '', category: b.category || '', createdAt: new Date().toISOString() })) : [],
        createdAt: new Date().toISOString(),
      };
      // Also create a corresponding User so the sage can log in
      const sageUser: User = {
        id: `user-sage-${Date.now()}`,
        name: pastorData.name || '',
        email: pastorData.email || '',
        role: 'pastor',
        pastorId: pastorId,
        avatar: pastorData.photo || '',
        phone: pastorData.phone || '',
        address: pastorData.address || '',
        pincode: pastorData.pincode || '',
      };
      setPastors((prev) => [np, ...prev]);
      setUsers((prev) => [...prev, sageUser]);
      return;
    }
    api.createPastor({ name: pastorData.name || '', title: pastorData.title || '', bio: pastorData.bio || '', email: pastorData.email || '', phone: pastorData.phone || '', church: pastorData.church || '', photo: pastorData.photo || '', address: pastorData.address || '', pincode: pastorData.pincode || '', locationLink: pastorData.locationLink || '', specialties: typeof pastorData.specialties === 'string' ? pastorData.specialties.split(',').map((s: string) => s.trim()).filter(Boolean) : Array.isArray(pastorData.specialties) ? pastorData.specialties : [], yearsOfService: pastorData.yearsOfService ? Number(pastorData.yearsOfService) : 0, donationLink: pastorData.donationLink || '', password: pastorData.password || '' }).then(() => { refreshPastors(); refreshUsers(); }).catch(e => console.error(e));
  };

  const updatePastor = (pastorId: string, updates: any) => {
    if (offlineRef.current) {
      const pastor = pastors.find((p) => p.id === pastorId);
      if (!pastor) return;
      const processed: Partial<Pastor> = {
        ...updates,
        specialties: typeof updates.specialties === 'string' ? updates.specialties.split(',').map((s: string) => s.trim()).filter(Boolean) : Array.isArray(updates.specialties) ? updates.specialties : pastor.specialties,
        yearsOfService: updates.yearsOfService ? Number(updates.yearsOfService) : pastor.yearsOfService,
        donationLink: updates.donationLink || pastor.donationLink,
        content: Array.isArray(updates.content) ? updates.content.map((c: any) => ({ id: c.id || `content-${Date.now()}-${c.type}`, type: c.type, title: c.title || '', content: c.content || '', url: c.url || '', thumbnail: c.thumbnail || '', description: c.description || '', approvalStatus: c.approvalStatus || 'approved', createdAt: c.createdAt || new Date().toISOString() })) : pastor.content,
        books: Array.isArray(updates.books) ? updates.books.map((b: any) => ({ id: b.id || `book-${Date.now()}-${b.title}`, title: b.title || '', description: b.description || '', price: b.price ? Number(b.price) : 0, coverImage: b.coverImage || '', pageCount: b.pageCount ? Number(b.pageCount) : undefined, publishedDate: b.publishedDate || '', category: b.category || '', approvalStatus: b.approvalStatus || 'approved', createdAt: b.createdAt || new Date().toISOString() })) : pastor.books,
      };
      setPastors((prev) => prev.map((p) => p.id === pastorId ? { ...p, ...processed } : p));
      return;
    }

    const processedUpdates = { ...updates, specialties: typeof updates.specialties === 'string' ? updates.specialties.split(',').map((s: string) => s.trim()).filter(Boolean) : Array.isArray(updates.specialties) ? updates.specialties : undefined, yearsOfService: updates.yearsOfService ? Number(updates.yearsOfService) : undefined };
    const contentToAdd = (updates.content || []).filter((c: any) => c._isNew);
    const booksToAdd = (updates.books || []).filter((b: any) => b._isNew);
    delete processedUpdates.content;
    delete processedUpdates.books;
    const promises: Promise<any>[] = [api.updatePastor(pastorId, processedUpdates)];
    contentToAdd.forEach((c: any) => { 
      promises.push(api.addPastorContent(pastorId, { type: c.type, title: c.title, content: c.content, url: c.url, thumbnail: c.thumbnail, description: c.description })); 
    });
    booksToAdd.forEach((b: any) => { 
      if (b.coverFile) {
        const bookData = new FormData();
        bookData.append('title', b.title);
        bookData.append('description', b.description);
        bookData.append('price', String(b.price));
        bookData.append('category', b.category || '');
        bookData.append('cover', b.coverFile);
        if (b.pageCount) bookData.append('pageCount', String(b.pageCount));
        if (b.publishedDate) bookData.append('publishedDate', b.publishedDate);
        
        promises.push(api.addPastorBook(pastorId, bookData));
      } else {
        // Fallback or handle as JSON if no file (though backend expects FormData now)
        const bookData = new FormData();
        bookData.append('title', b.title);
        bookData.append('description', b.description);
        bookData.append('price', String(b.price));
        bookData.append('category', b.category || '');
        promises.push(api.addPastorBook(pastorId, bookData));
      }
    });
    Promise.all(promises).then(() => refreshPastors()).catch(e => console.error(e));
  };

  const deletePastor = (pastorId: string) => {
    if (offlineRef.current) {
      setPastors((prev) => prev.filter((p) => p.id !== pastorId));
      // Also remove the linked user
      setUsers((prev) => prev.filter((u) => u.pastorId !== pastorId));
      return;
    }
    api.deletePastor(pastorId).then(() => { refreshPastors(); refreshUsers(); }).catch(e => console.error(e));
  };

  const getPastorById = (pastorId: string) => pastors.find((p) => p.id === pastorId);

  const getPastorByUserId = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user?.pastorId) return pastors.find((p) => p.id === user.pastorId);
    if (currentUser?.id === userId && currentUser?.pastorId) return pastors.find((p) => p.id === currentUser.pastorId);
    return undefined;
  };

  // ---- Content / Book Approval ----

  const approvePastorContent = (pastorId: string, contentId: string) => {
    setPastors((prev) => prev.map((p) => p.id !== pastorId ? p : { ...p, content: p.content?.map((c) => c.id === contentId ? { ...c, approvalStatus: 'approved' as const } : c) }));
    if (!offlineRef.current) api.approvePastorContent(pastorId, contentId).then(() => refreshPastors()).catch(() => refreshPastors());
  };

  const rejectPastorContent = (pastorId: string, contentId: string) => {
    setPastors((prev) => prev.map((p) => p.id !== pastorId ? p : { ...p, content: p.content?.map((c) => c.id === contentId ? { ...c, approvalStatus: 'rejected' as const } : c) }));
    if (!offlineRef.current) api.rejectPastorContent(pastorId, contentId).then(() => refreshPastors()).catch(() => refreshPastors());
  };

  const approvePastorBook = (pastorId: string, bookId: string) => {
    setPastors((prev) => prev.map((p) => p.id !== pastorId ? p : { ...p, books: p.books?.map((b) => b.id === bookId ? { ...b, approvalStatus: 'approved' as const } : b) }));
    if (!offlineRef.current) api.approvePastorBook(pastorId, bookId).then(() => refreshPastors()).catch(() => refreshPastors());
  };

  const rejectPastorBook = (pastorId: string, bookId: string) => {
    setPastors((prev) => prev.map((p) => p.id !== pastorId ? p : { ...p, books: p.books?.map((b) => b.id === bookId ? { ...b, approvalStatus: 'rejected' as const } : b) }));
    if (!offlineRef.current) api.rejectPastorBook(pastorId, bookId).then(() => refreshPastors()).catch(() => refreshPastors());
  };

  // ================================================================

  const value: AppContextType = {
    currentUser, users, groups, posts, prayers, pastors,
    login, signup, logout,
    createAdminUser, updateAdminUser, deleteAdminUser,
    createGroup, joinGroup, leaveGroup, requestJoinGroup, approveJoinRequest, rejectJoinRequest, addContentManager, removeContentManager, canPostInGroup, approveGroup, rejectGroup, updateGroup,
    createPost, updatePost, deletePost, likePost, addReaction, addComment,
    getUserById, getGroupById, getUserGroups,
    createPrayer, updatePrayer, deletePrayer, getPrayersByDate, getUserPrayers,
    createPastor, updatePastor, deletePastor, getPastorById, getPastorByUserId,
    approvePastorContent, rejectPastorContent, approvePastorBook, rejectPastorBook,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================================
// Fallback context (HMR safety)
// ============================================================

const noop = () => {};
const noopBool = () => false;

const fallbackContext: AppContextType = {
  currentUser: null, users: [], groups: [], posts: [], prayers: [], pastors: [],
  login: () => false, signup: () => false, logout: noop,
  createAdminUser: () => false, updateAdminUser: noop as any, deleteAdminUser: () => false,
  createGroup: noop as any, joinGroup: noop as any, leaveGroup: noop as any, requestJoinGroup: noop as any, approveJoinRequest: noop as any, rejectJoinRequest: noop as any, addContentManager: noop as any, removeContentManager: noop as any, canPostInGroup: noopBool as any, approveGroup: noop as any, rejectGroup: noop as any, updateGroup: noop as any,
  createPost: noop as any, updatePost: noop as any, deletePost: noop as any, likePost: noop as any, addReaction: noop as any, addComment: noop as any,
  getUserById: () => undefined, getGroupById: () => undefined, getUserGroups: () => [],
  createPrayer: noop as any, updatePrayer: noop as any, deletePrayer: noop as any, getPrayersByDate: () => [], getUserPrayers: () => [],
  createPastor: noop as any, updatePastor: noop as any, deletePastor: noop as any, getPastorById: () => undefined, getPastorByUserId: () => undefined,
  approvePastorContent: noop as any, rejectPastorContent: noop as any, approvePastorBook: noop as any, rejectPastorBook: noop as any,
};

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) return fallbackContext;
  return context;
}
