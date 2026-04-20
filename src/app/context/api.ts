// ============================================================
// Mission Sagacity API Client
// Points to DigitalOcean backend
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';


const TOKEN_KEY = 'mission_sagacity_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Only set application/json if not sending FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(body.error || 'Request failed', res.status);
  }

  return res.json();
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// ---- Auth ----

export interface LoginResponse {
  token: string;
  user: any;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (data: { name: string; email?: string; password: string; phone: string; address?: string; pincode: string }) =>
    request<LoginResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<any>('/auth/me'),

  // Users
  getUsers: () => request<any[]>('/users'),
  getUser: (id: string) => request<any>(`/users/${id}`),
  createUser: (data: { name: string; email: string }) =>
    request<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: { name: string; email: string }) =>
    request<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) =>
    request<any>(`/users/${id}`, { method: 'DELETE' }),

  // Groups (Flocks)
  getGroups: () => request<any[]>('/groups'),
  getGroup: (id: string) => request<any>(`/groups/${id}`),
  createGroup: (data: any) =>
    request<any>('/groups', { 
      method: 'POST', 
      body: data instanceof FormData ? data : JSON.stringify(data) 
    }),
  updateGroup: (id: string, data: any) =>
    request<any>(`/groups/${id}`, { 
      method: 'PUT', 
      body: data instanceof FormData ? data : JSON.stringify(data) 
    }),
  approveGroup: (id: string) =>
    request<any>(`/groups/${id}/approve`, { method: 'POST' }),
  rejectGroup: (id: string) =>
    request<any>(`/groups/${id}/reject`, { method: 'POST' }),
  joinGroup: (id: string) =>
    request<any>(`/groups/${id}/join`, { method: 'POST' }),
  leaveGroup: (id: string) =>
    request<any>(`/groups/${id}/leave`, { method: 'POST' }),
  requestJoinGroup: (id: string) =>
    request<any>(`/groups/${id}/request-join`, { method: 'POST' }),
  approveJoinRequest: (groupId: string, userId: string) =>
    request<any>(`/groups/${groupId}/approve-join/${userId}`, { method: 'POST' }),
  rejectJoinRequest: (groupId: string, userId: string) =>
    request<any>(`/groups/${groupId}/reject-join/${userId}`, { method: 'POST' }),
  addContentManager: (groupId: string, userId: string) =>
    request<any>(`/groups/${groupId}/content-manager/${userId}`, { method: 'POST' }),
  removeContentManager: (groupId: string, userId: string) =>
    request<any>(`/groups/${groupId}/content-manager/${userId}`, { method: 'DELETE' }),

  // Posts
  getFeed: () => request<any[]>('/posts/feed'),
  getGroupPosts: (groupId: string) => request<any[]>(`/posts/group/${groupId}`),
  getPost: (id: string) => request<any>(`/posts/${id}`),
  createPost: (formData: FormData) =>
    request<any>('/posts', { method: 'POST', body: formData }),
  updatePost: (id: string, data: any) =>
    request<any>(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePost: (id: string) =>
    request<any>(`/posts/${id}`, { method: 'DELETE' }),
  likePost: (id: string) =>
    request<any>(`/posts/${id}/like`, { method: 'POST' }),
  reactToPost: (id: string, reaction: string) =>
    request<any>(`/posts/${id}/react`, { method: 'POST', body: JSON.stringify({ reaction }) }),
  addComment: (postId: string, content: string) =>
    request<any>(`/posts/${postId}/comment`, { method: 'POST', body: JSON.stringify({ content }) }),

  // Prayers (Gatherings)
  getPrayers: () => request<any[]>('/prayers'),
  getAllPrayers: () => request<any[]>('/prayers/all'),
  getPrayersByDate: (date: string) => request<any[]>(`/prayers/date/${date}`),
  getUpcomingPrayers: () => request<any[]>('/prayers/upcoming'),
  createPrayer: (data: any) =>
    request<any>('/prayers', { method: 'POST', body: JSON.stringify(data) }),
  updatePrayer: (id: string, data: any) =>
    request<any>(`/prayers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePrayer: (id: string) =>
    request<any>(`/prayers/${id}`, { method: 'DELETE' }),

  // Pastors (Sages)
  getPastors: () => request<any[]>('/pastors'),
  getPastor: (id: string) => request<any>(`/pastors/${id}`),
  getPastorByUser: (userId: string) => request<any>(`/pastors/by-user/${userId}`),
  createPastor: (data: any) =>
    request<any>('/pastors', { method: 'POST', body: JSON.stringify(data) }),
  updatePastor: (id: string, data: any) =>
    request<any>(`/pastors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePastor: (id: string) =>
    request<any>(`/pastors/${id}`, { method: 'DELETE' }),

  // Sage content
  addPastorContent: (pastorId: string, data: any) =>
    request<any>(`/pastors/${pastorId}/content`, { method: 'POST', body: JSON.stringify(data) }),
  approvePastorContent: (pastorId: string, contentId: string) =>
    request<any>(`/pastors/${pastorId}/content/${contentId}/approve`, { method: 'POST' }),
  rejectPastorContent: (pastorId: string, contentId: string) =>
    request<any>(`/pastors/${pastorId}/content/${contentId}/reject`, { method: 'POST' }),

  // Sage books
  addPastorBook: (pastorId: string, formData: FormData) =>
    request<any>(`/pastors/${pastorId}/books`, { method: 'POST', body: formData }),
  approvePastorBook: (pastorId: string, bookId: string) =>
    request<any>(`/pastors/${pastorId}/books/${bookId}/approve`, { method: 'POST' }),
  rejectPastorBook: (pastorId: string, bookId: string) =>
    request<any>(`/pastors/${pastorId}/books/${bookId}/reject`, { method: 'POST' }),

  // Admin pending content
  getPendingContent: () => request<any>('/pastors/admin/pending'),

  // Health
  health: () => request<any>('/health'),

  // OTP
  sendOtp: (phoneNumber: string, code: string) =>
    request<any>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, code, type: 'user' }),
    }),

  verifyOtp: (phoneNumber: string, code: string, otp: string) =>
    request<any>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, code, otp }),
    }),
};

// ---- Connectivity check ----

let _apiAvailable: boolean | null = null;

/**
 * Quick probe: hits /api/health with a short timeout.
 * Caches the result so we only probe once per page load.
 */
export async function checkApiAvailable(): Promise<boolean> {
  if (_apiAvailable !== null) return _apiAvailable;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000); // 4 s timeout
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timer);
    _apiAvailable = res.ok;
  } catch {
    _apiAvailable = false;
  }
  console.log(`[MissionSagacity] API ${_apiAvailable ? 'reachable' : 'unreachable – using local mock data'}`);
  return _apiAvailable;
}

/** Reset the cached probe (e.g. after user manually retries). */
export function resetApiProbe() {
  _apiAvailable = null;
}