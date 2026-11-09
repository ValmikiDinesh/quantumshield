const ADMIN_TOKEN_KEY = 'quantumshield_admin_token';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'support' | 'auditor';
  isActive: boolean;
  lastLoginAt?: string;
}

class AdminApiClient {
  private get baseUrl(): string {
    return import.meta.env.VITE_API_BASE_URL || '/api';
  }

  public getToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  }

  public setToken(token: string): void {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  }

  public removeToken(): void {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}/admin${endpoint}`;
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      this.removeToken();
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
      throw new Error('Administrative session expired. Please sign in again.');
    }

    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.error || 'Administrative request failed');
    }

    return data;
  }

  // Auth
  public async login(email: string, passwordPlain: string): Promise<{ token: string; admin: AdminUser }> {
    const res = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: passwordPlain }),
    });
    this.setToken(res.token);
    return res;
  }

  public async getProfile(): Promise<{ admin: AdminUser }> {
    return this.request<{ admin: AdminUser }>('/auth/me');
  }

  public async impersonateTenant(organizationId: string): Promise<{ customerToken: string; user: any; organization: any }> {
    return this.request<any>('/auth/impersonate', {
      method: 'POST',
      body: JSON.stringify({ organizationId }),
    });
  }

  // Dashboard Telemetry
  public async getDashboardStats(): Promise<any> {
    const res = await this.request<any>('/dashboard/stats');
    return res.stats;
  }

  // Organizations
  public async listOrganizations(params: { search?: string; plan?: string; status?: string } = {}): Promise<any[]> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.plan) query.append('plan', params.plan);
    if (params.status) query.append('status', params.status);

    const res = await this.request<any>(`/organizations?${query.toString()}`);
    return res.organizations;
  }

  public async getOrganization(id: string): Promise<any> {
    return this.request<any>(`/organizations/${id}`);
  }

  public async updateOrgPlan(id: string, data: { plan: string; maxProjects?: number; maxScansPerMonth?: number; reason?: string }): Promise<any> {
    return this.request<any>(`/organizations/${id}/plan`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public async updateOrgStatus(id: string, data: { status: 'active' | 'suspended'; reason?: string }): Promise<any> {
    return this.request<any>(`/organizations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Users
  public async listUsers(params: { search?: string; role?: string } = {}): Promise<any[]> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.role) query.append('role', params.role);

    const res = await this.request<any>(`/users?${query.toString()}`);
    return res.users;
  }

  public async resetUserPassword(id: string, newPassword: string): Promise<any> {
    return this.request<any>(`/users/${id}/reset-password`, {
      method: 'PATCH',
      body: JSON.stringify({ newPassword }),
    });
  }

  public async deleteUser(id: string): Promise<any> {
    return this.request<any>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Payments
  public async listPayments(params: { search?: string; status?: string; plan?: string } = {}): Promise<any[]> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.plan) query.append('plan', params.plan);

    const res = await this.request<any>(`/payments?${query.toString()}`);
    return res.payments;
  }

  public async manualCreditPayment(data: {
    organizationId: string;
    plan: string;
    amountINR: number;
    referenceNotes?: string;
    customerEmail?: string;
  }): Promise<any> {
    return this.request<any>('/payments/manual-credit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async downloadAccountingCSV(): Promise<void> {
    const token = this.getToken();
    const url = `${this.baseUrl}/admin/payments/export-csv`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to download CSV export');

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `quantumshield-accounting-export-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Scans & System
  public async listScans(params: { status?: string; limit?: number } = {}): Promise<any[]> {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.limit) query.append('limit', String(params.limit));

    const res = await this.request<any>(`/scans?${query.toString()}`);
    return res.scans;
  }

  public async getScan(id: string): Promise<any> {
    const res = await this.request<any>(`/scans/${id}`);
    return res.scan;
  }

  public async abortScan(id: string): Promise<any> {
    return this.request<any>(`/scans/${id}/abort`, { method: 'POST' });
  }

  public async purgeTempStorage(): Promise<any> {
    return this.request<any>('/scans/purge-temp', { method: 'POST' });
  }

  // Settings
  public async getSettings(): Promise<any> {
    const res = await this.request<any>('/settings');
    return res.settings;
  }

  public async updateSetting(key: string, value: any): Promise<any> {
    return this.request<any>('/settings', {
      method: 'PATCH',
      body: JSON.stringify({ key, value }),
    });
  }

  // Audit Logs
  public async listAuditLogs(params: { limit?: number; action?: string } = {}): Promise<any[]> {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', String(params.limit));
    if (params.action) query.append('action', params.action);

    const res = await this.request<any>(`/audit-logs?${query.toString()}`);
    return res.logs;
  }
}

export const adminApi = new AdminApiClient();
