// ============================================
// USER TYPES
// ============================================

export interface User {
  id: number;
  name: string;
  email: string;
  address?: string;
  city?: string;
  phone?: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// ACCOUNT TYPES
// ============================================

export type AccountType = 'LIQUID' | 'CREDIT';

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: AccountType;
  current_balance: number;
  currency?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// TRANSACTION TYPES
// ============================================

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Transaction {
  id: number;
  account_id: number;
  category_id?: number;
  amount: number;
  type: TransactionType;
  date: string;
  description: string;
  reference?: string;
  is_recurring?: boolean;
  created_at: string;
  updated_at: string;
  
  // Relaciones opcionales
  category?: Category;
  account?: Account;
}

// ============================================
// CATEGORY TYPES
// ============================================

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
