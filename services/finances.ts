import axiosInstance from '@/lib/axios';
import type { 
  Account, 
  Transaction, 
  Category,
  ApiResponse,
  PaginatedResponse 
} from '@/types';

/**
 * Servicio de finanzas
 */
class FinancesService {
  // ============================================
  // ACCOUNTS
  // ============================================

  /**
   * Obtener todas las cuentas del usuario
   * @returns Lista de cuentas
   */
  async getAccounts(): Promise<Account[]> {
    const response = await axiosInstance.get<ApiResponse<Account[]>>('/accounts');
    return response.data.data;
  }

  /**
   * Obtener una cuenta específica
   * @param id - ID de la cuenta
   * @returns Cuenta
   */
  async getAccount(id: number): Promise<Account> {
    const response = await axiosInstance.get<ApiResponse<Account>>(`/accounts/${id}`);
    return response.data.data;
  }

  /**
   * Crear una nueva cuenta
   * @param data - Datos de la cuenta
   * @returns Cuenta creada
   */
  async createAccount(data: {
    name: string;
    type: 'LIQUID' | 'CREDIT';
    current_balance: number;
    currency?: string;
    description?: string;
  }): Promise<Account> {
    const response = await axiosInstance.post<ApiResponse<Account>>('/accounts', data);
    return response.data.data;
  }

  /**
   * Actualizar una cuenta
   * @param id - ID de la cuenta
   * @param data - Datos a actualizar
   * @returns Cuenta actualizada
   */
  async updateAccount(
    id: number,
    data: Partial<{
      name: string;
      type: 'LIQUID' | 'CREDIT';
      current_balance: number;
      currency: string;
      description: string;
      is_active: boolean;
    }>
  ): Promise<Account> {
    const response = await axiosInstance.put<ApiResponse<Account>>(
      `/accounts/${id}`,
      data
    );
    return response.data.data;
  }

  /**
   * Eliminar una cuenta
   * @param id - ID de la cuenta
   */
  async deleteAccount(id: number): Promise<void> {
    await axiosInstance.delete(`/accounts/${id}`);
  }

  // ============================================
  // TRANSACTIONS
  // ============================================

  /**
   * Obtener todas las transacciones del usuario
   * @param params - Parámetros de filtrado y paginación
   * @returns Lista de transacciones
   */
  async getTransactions(params?: {
    page?: number;
    per_page?: number;
    account_id?: number;
    category_id?: number;
    type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    date_from?: string;
    date_to?: string;
  }): Promise<Transaction[]> {
    const response = await axiosInstance.get<ApiResponse<Transaction[]>>(
      '/transactions',
      { params }
    );
    return response.data.data;
  }

  /**
   * Obtener transacciones paginadas
   * @param params - Parámetros de filtrado y paginación
   * @returns Respuesta paginada con transacciones
   */
  async getTransactionsPaginated(params?: {
    page?: number;
    per_page?: number;
    account_id?: number;
    category_id?: number;
    type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedResponse<Transaction>> {
    const response = await axiosInstance.get<PaginatedResponse<Transaction>>(
      '/transactions',
      { params }
    );
    return response.data;
  }

  /**
   * Obtener una transacción específica
   * @param id - ID de la transacción
   * @returns Transacción
   */
  async getTransaction(id: number): Promise<Transaction> {
    const response = await axiosInstance.get<ApiResponse<Transaction>>(
      `/transactions/${id}`
    );
    return response.data.data;
  }

  /**
   * Crear una nueva transacción
   * @param data - Datos de la transacción
   * @returns Transacción creada
   */
  async createTransaction(data: {
    account_id: number;
    category_id?: number;
    amount: number;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    date: string;
    description: string;
    reference?: string;
    is_recurring?: boolean;
  }): Promise<Transaction> {
    const response = await axiosInstance.post<ApiResponse<Transaction>>(
      '/transactions',
      data
    );
    return response.data.data;
  }

  /**
   * Actualizar una transacción
   * @param id - ID de la transacción
   * @param data - Datos a actualizar
   * @returns Transacción actualizada
   */
  async updateTransaction(
    id: number,
    data: Partial<{
      account_id: number;
      category_id: number;
      amount: number;
      type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
      date: string;
      description: string;
      reference: string;
      is_recurring: boolean;
    }>
  ): Promise<Transaction> {
    const response = await axiosInstance.put<ApiResponse<Transaction>>(
      `/transactions/${id}`,
      data
    );
    return response.data.data;
  }

  /**
   * Eliminar una transacción
   * @param id - ID de la transacción
   */
  async deleteTransaction(id: number): Promise<void> {
    await axiosInstance.delete(`/transactions/${id}`);
  }

  // ============================================
  // CATEGORIES
  // ============================================

  /**
   * Obtener todas las categorías del usuario
   * @returns Lista de categorías
   */
  async getCategories(): Promise<Category[]> {
    const response = await axiosInstance.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  }

  /**
   * Obtener una categoría específica
   * @param id - ID de la categoría
   * @returns Categoría
   */
  async getCategory(id: number): Promise<Category> {
    const response = await axiosInstance.get<ApiResponse<Category>>(
      `/categories/${id}`
    );
    return response.data.data;
  }

  /**
   * Crear una nueva categoría
   * @param data - Datos de la categoría
   * @returns Categoría creada
   */
  async createCategory(data: {
    name: string;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    color?: string;
    icon?: string;
    description?: string;
  }): Promise<Category> {
    const response = await axiosInstance.post<ApiResponse<Category>>(
      '/categories',
      data
    );
    return response.data.data;
  }

  /**
   * Actualizar una categoría
   * @param id - ID de la categoría
   * @param data - Datos a actualizar
   * @returns Categoría actualizada
   */
  async updateCategory(
    id: number,
    data: Partial<{
      name: string;
      type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
      color: string;
      icon: string;
      description: string;
      is_active: boolean;
    }>
  ): Promise<Category> {
    const response = await axiosInstance.put<ApiResponse<Category>>(
      `/categories/${id}`,
      data
    );
    return response.data.data;
  }

  /**
   * Eliminar una categoría
   * @param id - ID de la categoría
   */
  async deleteCategory(id: number): Promise<void> {
    await axiosInstance.delete(`/categories/${id}`);
  }

  // ============================================
  // ESTADÍSTICAS Y REPORTES
  // ============================================

  /**
   * Obtener resumen financiero del usuario
   * @returns Resumen con balance total, ingresos, gastos, etc.
   */
  async getFinancialSummary(params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<{
    total_balance: number;
    total_income: number;
    total_expenses: number;
    net_balance: number;
    accounts_count: number;
    transactions_count: number;
  }> {
    const response = await axiosInstance.get<ApiResponse<any>>(
      '/finances/summary',
      { params }
    );
    return response.data.data;
  }
}

// Exportar instancia única
export const financesService = new FinancesService();
