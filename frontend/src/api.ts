import axios from 'axios';
import {
  FoodItem,
  Category,
  Customer,
  RestaurantTable,
  Booking,
  Invoice,
  DashboardData,
  RestaurantSettings,
} from './types';

const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

export const api = {
  getFoodItems: async (params?: {
    search?: string;
    categoryId?: string;
    isVeg?: boolean;
    isAvailable?: boolean;
  }) => {
    const res = await axios.get<FoodItem[]>(`${API_BASE}/food`, { params });
    return res.data;
  },

  createFoodItem: async (data: Partial<FoodItem>) => {
    const res = await axios.post<FoodItem>(`${API_BASE}/food`, data);
    return res.data;
  },

  updateFoodItem: async (id: string, data: Partial<FoodItem>) => {
    const res = await axios.put<FoodItem>(`${API_BASE}/food/${id}`, data);
    return res.data;
  },

  toggleFoodAvailability: async (id: string) => {
    const res = await axios.patch<FoodItem>(
      `${API_BASE}/food/${id}/toggle-availability`
    );
    return res.data;
  },

  deleteFoodItem: async (id: string) => {
    const res = await axios.delete(`${API_BASE}/food/${id}`);
    return res.data;
  },

  getCategories: async () => {
    const res = await axios.get<Category[]>(`${API_BASE}/food/categories`);
    return res.data;
  },

  getCustomers: async (search?: string) => {
    const res = await axios.get<Customer[]>(`${API_BASE}/customers`, {
      params: { search },
    });
    return res.data;
  },

  getCustomerDetails: async (id: string) => {
    const res = await axios.get<Customer>(`${API_BASE}/customers/${id}`);
    return res.data;
  },

  createCustomer: async (data: Partial<Customer>) => {
    const res = await axios.post<Customer>(`${API_BASE}/customers`, data);
    return res.data;
  },

  updateCustomer: async (id: string, data: Partial<Customer>) => {
    const res = await axios.put<Customer>(
      `${API_BASE}/customers/${id}`,
      data
    );
    return res.data;
  },

  deleteCustomer: async (id: string) => {
    const res = await axios.delete(`${API_BASE}/customers/${id}`);
    return res.data;
  },

  getTables: async () => {
    const res = await axios.get<RestaurantTable[]>(`${API_BASE}/tables`);
    return res.data;
  },

  createTable: async (data: Partial<RestaurantTable>) => {
    const res = await axios.post<RestaurantTable>(
      `${API_BASE}/tables`,
      data
    );
    return res.data;
  },

  updateTableStatus: async (id: string, status: string) => {
    const res = await axios.patch<RestaurantTable>(
      `${API_BASE}/tables/${id}/status`,
      { status }
    );
    return res.data;
  },

  deleteTable: async (id: string) => {
    const res = await axios.delete(`${API_BASE}/tables/${id}`);
    return res.data;
  },

  getBookings: async (params?: {
    status?: string;
    date?: string;
    search?: string;
  }) => {
    const res = await axios.get<Booking[]>(`${API_BASE}/bookings`, { params });
    return res.data;
  },

  createBooking: async (data: any) => {
    const res = await axios.post<Booking>(`${API_BASE}/bookings`, data);
    return res.data;
  },

  updateBookingStatus: async (
    id: string,
    status: string,
    tableId?: string
  ) => {
    const res = await axios.patch<Booking>(
      `${API_BASE}/bookings/${id}/status`,
      { status, tableId }
    );
    return res.data;
  },

  getInvoices: async (params?: {
    search?: string;
    paymentMethod?: string;
    from?: string;
    to?: string;
  }) => {
    const res = await axios.get<Invoice[]>(`${API_BASE}/invoices`, { params });
    return res.data;
  },

  getInvoiceDetails: async (id: string) => {
    const res = await axios.get<Invoice>(`${API_BASE}/invoices/${id}`);
    return res.data;
  },

  createInvoice: async (data: {
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    tableId?: string;
    items: { foodItemId: string; quantity: number }[];
    discount?: number;
    paymentMethod: 'CASH' | 'UPI' | 'CARD';
    amountReceived?: number;
  }) => {
    const res = await axios.post<Invoice>(
      `${API_BASE}/invoices`,
      data
    );
    return res.data;
  },

  getDashboardData: async (
    period?: 'today' | 'week' | 'month' | 'all'
  ) => {
    const res = await axios.get<DashboardData>(
      `${API_BASE}/dashboard`,
      {
        params: period ? { period } : undefined,
      }
    );
    return res.data;
  },

  getSettings: async () => {
    const res = await axios.get<RestaurantSettings>(
      `${API_BASE}/settings`
    );
    return res.data;
  },

  updateSettings: async (data: Partial<RestaurantSettings>) => {
    const res = await axios.put<RestaurantSettings>(
      `${API_BASE}/settings`,
      data
    );
    return res.data;
  },
};