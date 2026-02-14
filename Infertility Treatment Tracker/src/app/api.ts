import { Cycle, InjectionRecord, RetrievalRecord, FertilizationRecord, EmbryoCultureRecord, TransferRecord, FreezeRecord, PGTRecord } from './types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });

  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    throw new Error('인증이 만료되었습니다');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '요청에 실패했습니다');
  }
  return data;
}

// Auth
export async function signup(
  email: string, password: string, nickname?: string, birthDate?: string, phone?: string,
  marketing?: { marketingEmail: boolean; marketingSms: boolean; marketingPush: boolean }
) {
  return request<{ token: string; user: { id: string; email: string; nickname: string } }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, nickname, birthDate, phone, ...marketing }),
  });
}

export async function login(email: string, password: string) {
  return request<{ token: string; user: { id: string; email: string; nickname: string } }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function kakaoLogin(code: string) {
  return request<{ token: string; user: { id: string; email: string; nickname: string; profileImage?: string } }>('/auth/kakao', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function googleLogin(code: string) {
  return request<{ token: string; user: { id: string; email: string; nickname: string; profileImage?: string } }>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function getMe() {
  return request<{ id: string; email: string; nickname: string; profileImage?: string }>('/auth/me');
}

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  profileImage?: string;
  phone: string;
  birthDate: string;
  marketingEmail: boolean;
  marketingSms: boolean;
  marketingPush: boolean;
  createdAt: string;
}

export async function getProfile() {
  return request<UserProfile>('/auth/profile');
}

export async function updateProfile(data: { nickname?: string; phone?: string; birthDate?: string }) {
  return request<{ id: string; email: string; nickname: string; profileImage?: string }>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  return request<{ message: string }>('/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function updateMarketing(data: { marketingEmail: boolean; marketingSms: boolean; marketingPush: boolean }) {
  return request<{ message: string }>('/auth/marketing', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAccount(password?: string) {
  return request<{ message: string }>('/auth/me', {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
}

// Cycles
export async function fetchCycles(): Promise<Cycle[]> {
  return request<Cycle[]>('/cycles');
}

export async function fetchCycle(id: string): Promise<Cycle> {
  return request<Cycle>(`/cycles/${id}`);
}

export async function createCycle(data: { cycleNumber: number; subtitle?: string; startDate: string }): Promise<Cycle> {
  return request<Cycle>('/cycles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCycleMeta(id: string, data: { cycleNumber?: number; subtitle?: string; title?: string }): Promise<Cycle> {
  return request<Cycle>(`/cycles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCycle(id: string): Promise<void> {
  await request(`/cycles/${id}`, { method: 'DELETE' });
}

// Injections
export async function addInjection(cycleId: string, data: Omit<InjectionRecord, 'id'>): Promise<InjectionRecord> {
  return request<InjectionRecord>(`/cycles/${cycleId}/injections`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateInjection(cycleId: string, injId: string, data: Partial<InjectionRecord>): Promise<InjectionRecord> {
  return request<InjectionRecord>(`/cycles/${cycleId}/injections/${injId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteInjection(cycleId: string, injId: string): Promise<void> {
  await request(`/cycles/${cycleId}/injections/${injId}`, { method: 'DELETE' });
}

// Sub-records (all return full Cycle)
export async function upsertRetrieval(cycleId: string, data: RetrievalRecord): Promise<Cycle> {
  return request<Cycle>(`/cycles/${cycleId}/retrieval`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function upsertFertilization(cycleId: string, data: FertilizationRecord): Promise<Cycle> {
  return request<Cycle>(`/cycles/${cycleId}/fertilization`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function upsertCulture(cycleId: string, data: EmbryoCultureRecord): Promise<Cycle> {
  return request<Cycle>(`/cycles/${cycleId}/culture`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function upsertTransfer(cycleId: string, data: TransferRecord): Promise<Cycle> {
  return request<Cycle>(`/cycles/${cycleId}/transfer`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function upsertFreeze(cycleId: string, data: FreezeRecord): Promise<Cycle> {
  return request<Cycle>(`/cycles/${cycleId}/freeze`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function upsertPGT(cycleId: string, data: PGTRecord): Promise<Cycle> {
  return request<Cycle>(`/cycles/${cycleId}/pgt`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
