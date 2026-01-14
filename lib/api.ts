// HUDT API Service
// Handles all HTTP requests to the backend

// Use environment variable for production, fallback to localhost for dev
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');

// Helper to get auth headers
const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('hudtAdminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch wrapper with error handling
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${cleanEndpoint}`;

    console.log(`🚀 Requesting: ${url}`); // Helpful for debugging in browser console

    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...options.headers,
        },
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
}

// ==================== PUBLIC API ====================

export interface SubmitApplicationData {
    fullName: string;
    email: string;
    phone: string;
    department: string;
    level: string;
    talents: string[];
    instruments?: string;
    otherTalent?: string;
    experience: 'Yes' | 'No';
    experienceDetails?: string;
    motivation: string;
    gain?: string;
    availability: string[];
    preferredSlot?: string;
}

export interface SubmitApplicationResponse {
    success: boolean;
    refNumber: string;
    message: string;
}

export const submitApplication = async (
    data: SubmitApplicationData
): Promise<SubmitApplicationResponse> => {
    // Map frontend fields to backend expected fields
    const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        department: data.department,
        level: data.level,
        talents: data.talents,
        instruments: data.instruments,
        otherTalent: data.otherTalent,
        previousExperience: data.experience,
        experienceDetails: data.experienceDetails,
        motivation: data.motivation,
        hopesToGain: data.gain,
        availability: data.availability,
        auditionSlot: data.preferredSlot,
    };

    return apiRequest<SubmitApplicationResponse>('/applications', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export interface ApplicationStatus {
    refNumber: string;
    fullName: string;
    department: string;
    level: string;
    talents: string[];
    status: string;
    auditionSlot?: string;
    submittedAt: string;
}

export interface StatusCheckResponse {
    success: boolean;
    application: ApplicationStatus;
}

export const checkApplicationStatus = async (
    identifier: string
): Promise<StatusCheckResponse> => {
    return apiRequest<StatusCheckResponse>(`/applications/status/${identifier}`);
};

// ==================== ADMIN API ====================

export interface LoginResponse {
    success: boolean;
    token: string;
    admin: {
        id: number;
        username: string;
        email: string;
        role: string;
    };
}

export const adminLogin = async (
    username: string,
    password: string
): Promise<LoginResponse> => {
    const response = await apiRequest<LoginResponse>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });

    if (response.success && response.token) {
        localStorage.setItem('hudtAdminToken', response.token);
        localStorage.setItem('hudtAdmin', JSON.stringify(response.admin));
    }

    return response;
};

export const adminLogout = (): void => {
    localStorage.removeItem('hudtAdminToken');
    localStorage.removeItem('hudtAdmin');
};

export const isAdminLoggedIn = (): boolean => {
    return !!localStorage.getItem('hudtAdminToken');
};

export const getStoredAdmin = (): { id: number; username: string; role: string } | null => {
    const admin = localStorage.getItem('hudtAdmin');
    return admin ? JSON.parse(admin) : null;
};

export interface DashboardStats {
    totalApplications: number;
    applicationsToday: number;
    applicationsThisWeek: number;
    applicationsThisMonth: number;
    statusCounts: Record<string, number>;
    talentCounts: Record<string, number>;
    departmentCounts: Record<string, number>;
    levelCounts: Record<string, number>;
    recentApplications: any[];
    applicationsTimeline: { date: string; count: number }[];
    averageRating: number | null;
    acceptanceRate: number;
}

export interface DashboardResponse {
    success: boolean;
    stats: DashboardStats;
}

export const getDashboardStats = async (): Promise<DashboardResponse> => {
    return apiRequest<DashboardResponse>('/admin/dashboard/stats');
};

export interface ApplicationsFilters {
    search?: string;
    status?: string;
    department?: string;
    level?: string;
    talent?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface ApplicationsResponse {
    success: boolean;
    applications: any[];
    totalCount: number;
    page: number;
    totalPages: number;
    limit: number;
}

export const getApplications = async (
    filters: ApplicationsFilters = {}
): Promise<ApplicationsResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'All') {
            params.append(key, String(value));
        }
    });

    const queryString = params.toString();
    const endpoint = `/admin/applications${queryString ? `?${queryString}` : ''}`;

    return apiRequest<ApplicationsResponse>(endpoint);
};

export const getApplication = async (id: number): Promise<{ success: boolean; application: any }> => {
    return apiRequest(`/admin/applications/${id}`);
};

export const updateApplication = async (
    id: number,
    updates: Record<string, any>
): Promise<{ success: boolean; application: any }> => {
    return apiRequest(`/admin/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
};

export const deleteApplication = async (
    id: number
): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/admin/applications/${id}`, {
        method: 'DELETE',
    });
};

export const bulkUpdateApplications = async (
    applicationIds: number[],
    updates: Record<string, any>
): Promise<{ success: boolean; updatedCount: number }> => {
    return apiRequest('/admin/applications/bulk-update', {
        method: 'POST',
        body: JSON.stringify({ applicationIds, updates }),
    });
};

export const bulkDeleteApplications = async (
    applicationIds: number[]
): Promise<{ success: boolean; deletedCount: number }> => {
    return apiRequest('/admin/applications/bulk-delete', {
        method: 'DELETE',
        body: JSON.stringify({ applicationIds }),
    });
};

export const exportApplications = async (filters: ApplicationsFilters = {}): Promise<void> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'All') {
            params.append(key, String(value));
        }
    });

    const queryString = params.toString();
    const url = `${API_BASE_URL}/admin/applications/export${queryString ? `?${queryString}` : ''}`;

    const token = localStorage.getItem('hudtAdminToken');
    const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
        throw new Error('Export failed');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `hudt-applications-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
};

export const sendEmail = async (
    applicationId: number,
    subject: string,
    message: string
): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/admin/applications/${applicationId}/send-email`, {
        method: 'POST',
        body: JSON.stringify({ subject, message }),
    });
};

// Health check
export const checkApiHealth = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch {
        return false;
    }
};
