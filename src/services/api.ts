const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

class ApiService {
  private async requestTo<T>(base: string, endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${base}${endpoint}`;
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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.requestTo<T>(API_BASE_URL, endpoint, options);
  }

  // Customer API
  customers = {
    getAll: () => this.request<any[]>('/customers'),
    getById: (id: string) => this.request<any>(`/customers/${id}`),
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
    deleteMultiple: (ids: string[]) => this.request<{ success: boolean; deletedCount: number; message: string }>('/customers/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }),
    search: (searchTerm: string) => this.request<any[]>(`/customers/search/${encodeURIComponent(searchTerm)}`),
  };

  // Transaction API
  transactions = {
    getAll: () => this.request<any[]>('/transactions'),
    getById: (id: string) => this.request<any>(`/transactions/${id}`),
    getByCustomer: (customerId: string) => this.request<any[]>(`/transactions/customer/${customerId}`),
    create: (data: any) => this.request<any>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => this.request<any>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => this.request<{ success: boolean }>(`/transactions/${id}`, {
      method: 'DELETE',
    }),
    deleteMultiple: (ids: string[]) => this.request<{ success: boolean; deletedCount: number; message: string }>('/transactions/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }),
    makePayment: (transactionId: string, amount: number) => this.request<any>(`/transactions/${transactionId}/payment`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
    getDueDateAlerts: () => this.request<any>('/transactions/due-date-alerts'),
    getDueSoon: (days: number = 7) => this.request<any>(`/transactions/due-soon?days=${days}`),
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
    // Wire directly to backend v1 notification-rules on port 5000
    getRules: async () => {
      const res = await this.request<any>('/notification-rules');
      const items = res?.data || res || [];
      return items.map((r: any) => {
        const id = r._id || r.id;
        const triggerType = r.triggerType || 'payment_due';
        const mapType = (tt: string) => {
          if (tt === 'payment_overdue') return 'overdue';
          if (tt === 'due_date_reminder' || tt === 'payment_due') return 'reminder';
          return 'followup';
        };
        return {
          id,
          name: r.name,
          type: mapType(triggerType),
          enabled: r.active !== undefined ? !!r.active : true,
          conditions: {
            daysOverdue: r.conditions?.daysOverdue,
            balanceThreshold: r.conditions?.balanceThreshold,
            customerTags: r.conditions?.customerTags || []
          },
          actions: {
            notification: true,
            email: false,
            sms: false,
          },
          sound: r.sound || { enabled: true, type: 'notification', volume: 0.7 },
          schedule: {
            frequency: r.schedule?.frequency || 'daily',
            time: r.schedule?.time || '09:00',
            days: r.schedule?.days
          },
          message: r.message || { title: r.name || 'Notification Rule', body: triggerType },
          createdAt: r.createdAt || new Date().toISOString(),
          updatedAt: r.updatedAt || new Date().toISOString(),
        };
      });
    },
    createRule: (data: any) => {
      const payload = ((): any => {
        const mapTrigger = (t: string) => {
          if (t === 'overdue') return 'payment_overdue';
          if (t === 'reminder') return 'due_date_reminder';
          return 'payment_due';
        };
        return {
          name: data.name,
          triggerType: mapTrigger(data.type),
          active: data.enabled,
          conditions: {
            ...(data.conditions?.daysOverdue !== undefined && { daysOverdue: data.conditions.daysOverdue }),
            ...(data.conditions?.balanceThreshold !== undefined && { balanceThreshold: data.conditions.balanceThreshold }),
            ...(data.conditions?.customerTags && { customerTags: data.conditions.customerTags }),
          },
          actions: data.actions ? {
            notification: !!data.actions.notification,
            email: !!data.actions.email,
            sms: !!data.actions.sms,
          } : undefined,
          sound: data.sound ? {
            enabled: !!data.sound.enabled,
            type: data.sound.type,
            ...(data.sound.customUrl && { customUrl: data.sound.customUrl }),
            ...(data.sound.volume !== undefined && { volume: data.sound.volume }),
          } : undefined,
          schedule: data.schedule ? {
            frequency: data.schedule.frequency,
            time: data.schedule.time,
            ...(data.schedule.days && { days: data.schedule.days }),
          } : undefined,
          message: data.message ? {
            title: data.message.title,
            body: data.message.body,
          } : undefined,
        };
      })();
      return this.request<any>('/notification-rules', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    updateRule: (id: string, data: any) => {
      const mapTrigger = (t: string) => {
        if (t === 'overdue') return 'payment_overdue';
        if (t === 'reminder') return 'due_date_reminder';
        return 'payment_due';
      };
      const payload: any = {};
      if (data.name !== undefined) payload.name = data.name;
      if (data.type !== undefined) payload.triggerType = mapTrigger(data.type);
      if (data.enabled !== undefined) payload.active = data.enabled;
      if (data.conditions) {
        payload.conditions = {
          ...(data.conditions.daysOverdue !== undefined && { daysOverdue: data.conditions.daysOverdue }),
          ...(data.conditions.balanceThreshold !== undefined && { balanceThreshold: data.conditions.balanceThreshold }),
          ...(data.conditions.customerTags && { customerTags: data.conditions.customerTags }),
        };
      }
      if (data.actions) {
        payload.actions = {
          notification: !!data.actions.notification,
          email: !!data.actions.email,
          sms: !!data.actions.sms,
        };
      }
      if (data.sound) {
        payload.sound = {
          enabled: !!data.sound.enabled,
          type: data.sound.type,
          ...(data.sound.customUrl && { customUrl: data.sound.customUrl }),
          ...(data.sound.volume !== undefined && { volume: data.sound.volume }),
        };
      }
      if (data.schedule) {
        payload.schedule = {
          frequency: data.schedule.frequency,
          time: data.schedule.time,
          ...(data.schedule.days && { days: data.schedule.days }),
        };
      }
      if (data.message) {
        payload.message = {
          title: data.message.title,
          body: data.message.body,
        };
      }
      return this.request<any>(`/notification-rules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    deleteRule: (id: string) => this.request<{ success: boolean }>(`/notification-rules/${id}`, {
      method: 'DELETE',
    }),
    testRule: (ruleId: string) => this.request<{ success: boolean; message: string }>(`/notification-rules/${ruleId}/test`, {
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
    show: async (title: string, body: string, soundType?: 'notification' | 'urgent' | 'reminder' | 'custom', customSoundUrl?: string) => {
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

      // Play sound notification if specified
      if (soundType) {
        const { audioService } = await import('./audioService');
        if (soundType === 'custom' && customSoundUrl) {
          await audioService.playNotificationSound('custom', customSoundUrl);
        } else {
          await audioService.playNotificationSound(soundType);
        }
      }
    },
  };
}

const apiService = new ApiService();
export { apiService };
export default apiService;