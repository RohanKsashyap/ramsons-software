const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Customer API
  customers = {
    getAll: () => this.request<any[]>('/customers'),
    create: (data: any) => this.request<any>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => this.request<any>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => this.request<{ success: boolean }>(`/customers/${id}`, {
      method: 'DELETE',
    }),
    search: (searchTerm: string) => this.request<any[]>(`/customers/search/${encodeURIComponent(searchTerm)}`),
  };

  // Transaction API
  transactions = {
    getAll: () => this.request<any[]>('/transactions'),
    getByCustomer: (customerId: string) => this.request<any[]>(`/transactions/customer/${customerId}`),
    create: (data: any) => this.request<any>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    makePayment: (transactionId: string, amount: number) => this.request<any>(`/transactions/${transactionId}/payment`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
  };

  // Report API
  reports = {
    generateSales: (startDate: string, endDate: string) => this.request<any>('/reports/sales', {
      method: 'POST',
      body: JSON.stringify({ startDate, endDate }),
    }),
    generateOverdues: () => this.request<any>('/reports/overdue'),
    exportToExcel: (reportData: any, filename: string) => this.request<{ filePath: string; success: boolean }>('/reports/export/excel', {
      method: 'POST',
      body: JSON.stringify({ reportData, filename }),
    }),
    exportToPDF: (reportData: any, filename: string) => this.request<{ filePath: string; success: boolean }>('/reports/export/pdf', {
      method: 'POST',
      body: JSON.stringify({ reportData, filename }),
    }),
  };

  // Dashboard API
  dashboard = {
    getStats: () => this.request<any>('/dashboard/stats'),
    getMonthlyRevenue: () => this.request<any>('/dashboard/monthly-revenue'),
  };

  // Notification API
  notifications = {
    getRules: () => this.request<any[]>('/notifications'),
    createRule: (data: any) => this.request<any>('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    updateRule: (id: string, data: any) => this.request<any>(`/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    deleteRule: (id: string) => this.request<{ success: boolean }>(`/notifications/${id}`, {
      method: 'DELETE',
    }),
    testRule: (ruleId: string) => this.request<{ success: boolean; message: string }>(`/notifications/${ruleId}/test`, {
      method: 'POST',
    }),
  };

  // Follow-up API
  followups = {
    getSequences: () => this.request<any[]>('/followups'),
    createSequence: (data: any) => this.request<any>('/followups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    updateSequence: (id: string, data: any) => this.request<any>(`/followups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    deleteSequence: (id: string) => this.request<{ success: boolean }>(`/followups/${id}`, {
      method: 'DELETE',
    }),
    triggerSequence: (customerId: string, sequenceId: string) => this.request<{ success: boolean }>(`/followups/${sequenceId}/trigger`, {
      method: 'POST',
      body: JSON.stringify({ customerId }),
    }),
  };

  // Web notification (browser notification API)
  notification = {
    show: async (title: string, body: string) => {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title, { body });
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification(title, { body });
          }
        }
      }
    },
  };
}

const apiService = new ApiService();
export { apiService };
export default apiService;