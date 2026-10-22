import {
  UserDTO,
  OrganizationDTO,
  ProjectDTO,
  ScanSummaryDTO,
  ScanDetailDTO,
  ScanComparisonDTO,
  DashboardStatsDTO,
  AIExplanationResponse,
  PlanTier,
} from '../types';

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  public status: number;
  public details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('qs_token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Do not set Content-Type if uploading FormData (browser handles boundary)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Only redirect to login if we had a token and are not on auth endpoints
    if (token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      localStorage.removeItem('qs_token');
      localStorage.removeItem('qs_user');
      window.location.href = '/login?expired=true';
    }
  }

  // Check if response is JSON
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    let details: any;
    if (contentType.includes('application/json')) {
      const errData = await response.json();
      errorMsg = errData.error || errorMsg;
      details = errData.details;
    } else {
      errorMsg = await response.text();
    }
    throw new ApiError(errorMsg, response.status, details);
  }

  if (contentType.includes('application/json')) {
    const json = await response.json();
    return json.data !== undefined ? json.data : json;
  }

  return response as unknown as T;
}

export const api = {
  // --- AUTH ---
  register: (data: { name: string; email: string; password: string; organizationName?: string }) =>
    request<{ user: UserDTO; organization: OrganizationDTO; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ user: UserDTO; organization: OrganizationDTO; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  forgotPassword: (email: string) =>
    request<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (data: { email: string; code: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () =>
    request<{ user: UserDTO; organization: OrganizationDTO }>('/auth/me'),

  logout: () =>
    request<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    }),

  // --- PROJECTS ---
  listProjects: () =>
    request<ProjectDTO[]>('/projects'),

  createProject: (data: { name: string; description?: string; projectType: string; tags?: string[] }) =>
    request<ProjectDTO>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProject: (id: string) =>
    request<ProjectDTO>(`/projects/${id}`),

  updateProject: (id: string, data: Partial<ProjectDTO>) =>
    request<ProjectDTO>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteProject: (id: string) =>
    request<{ success: boolean; message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    }),

  // --- SCANS ---
  uploadAndScan: (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<ScanDetailDTO>(`/projects/${projectId}/scans`, {
      method: 'POST',
      body: formData,
    });
  },

  scanGitHubRepo: (projectId: string, repoUrl: string, branch?: string, githubToken?: string) =>
    request<ScanDetailDTO>(`/projects/${projectId}/scans/github`, {
      method: 'POST',
      body: JSON.stringify({ repoUrl, branch, githubToken }),
    }),

  quickScanDemo: (projectId: string, demoType: 'classical-vulnerable' | 'hybrid-pqc' | 'clean-app') =>
    request<ScanDetailDTO>(`/projects/${projectId}/quick-scan-demo`, {
      method: 'POST',
      body: JSON.stringify({ demoType }),
    }),

  listProjectScans: (projectId: string) =>
    request<ScanSummaryDTO[]>(`/projects/${projectId}/scans`),

  getScan: (scanId: string) =>
    request<ScanDetailDTO>(`/scans/${scanId}`),

  compareScans: (scanAId: string, scanBId: string) =>
    request<ScanComparisonDTO>(`/scans/compare?scanAId=${scanAId}&scanBId=${scanBId}`),

  explainFindingAI: (scanId: string, findingId: string) =>
    request<AIExplanationResponse>(`/scans/${scanId}/findings/${findingId}/ai-explain`, {
      method: 'POST',
    }),

  // Download URLs
  getReportJsonUrl: (scanId: string) => `${BASE_URL}/scans/${scanId}/report/json`,
  getReportPdfUrl: (scanId: string) => `${BASE_URL}/scans/${scanId}/report/pdf`,

  downloadReportJSON: async (scanId: string, fileName: string) => {
    const token = localStorage.getItem('qs_token');
    const response = await fetch(`${BASE_URL}/scans/${scanId}/report/json`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to download JSON report');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  downloadReportPDF: async (scanId: string, fileName: string) => {
    const token = localStorage.getItem('qs_token');
    const response = await fetch(`${BASE_URL}/scans/${scanId}/report/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to download PDF report');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // --- DASHBOARD ---
  getDashboardStats: () =>
    request<DashboardStatsDTO>('/dashboard/stats'),

  // --- ORGANIZATION & BILLING ---
  getCurrentOrganization: () =>
    request<{
      id: string;
      name: string;
      slug: string;
      plan: PlanTier;
      maxProjects: number;
      maxScansPerMonth: number;
      currentProjectsCount: number;
      currentScansCount: number;
      createdAt: string;
      pricingPlans: any[];
    }>('/organizations/current'),

  updatePlan: (plan: PlanTier) =>
    request<{ plan: PlanTier; maxProjects: number; maxScansPerMonth: number }>('/organizations/current/plan', {
      method: 'PATCH',
      body: JSON.stringify({ plan }),
    }),

  updateOrganization: (name: string) =>
    request<{ success: boolean; data: any }>('/organizations/current', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),
};
