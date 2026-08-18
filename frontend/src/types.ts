export interface Category {
  id: string;
  name: string;
  description?: string;
  _count?: {
    foodItems: number;
  };
}

export interface FoodItem {
  id: string;
  name: string;
  categoryId: string;
  category?: Category;
  price: number;
  description?: string;
  isVeg: boolean;
  imageUrl?: string;
  isAvailable: boolean;
  totalSold: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  totalVisits: number;
  totalSpent: number;
  invoices?: Invoice[];
  bookings?: Booking[];
}

export interface RestaurantTable {
  id: string;
  tableNumber: string;
  capacity: number;
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'CLEANING';
  bookings?: Booking[];
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customer?: Customer;
  tableId?: string;
  table?: RestaurantTable;
  date: string;
  time: string;
  guests: number;
  notes?: string;
  status: 'PENDING' | 'RESERVED' | 'SEATED' | 'COMPLETED' | 'CANCELLED';
}

export interface InvoiceItem {
  id?: string;
  foodItemId: string;
  foodItem?: FoodItem;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customer?: Customer;
  tableId?: string;
  table?: RestaurantTable;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD';
  paymentStatus: 'PENDING' | 'PAID' | 'CANCELLED';
  amountReceived: number;
  changeGiven: number;
  items: InvoiceItem[];
  createdAt: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalBills: number;
  avgBillValue: number;
  totalDiscounts: number;
  totalTax: number;
  totalCustomers: number;
  availableTables: number;
  occupiedTables: number;
  reservedTables: number;
  cleaningTables: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  paymentSplit: {
    upi: { count: number; amount: number };
    card: { count: number; amount: number };
    cash: { count: number; amount: number };
  };
  topFoodItems: FoodItem[];
  recentInvoices: Invoice[];
}


export interface RestaurantSettings {
  id: string;
  restaurantName: string;
  address: string;
  phone: string;
  gstin: string;
  taxRate: number;
  printerType: '80MM' | 'A4' | string;
  updatedAt: string;
}
