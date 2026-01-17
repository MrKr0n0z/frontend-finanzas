'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from 'cookies-next';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard,
  DollarSign,
  LogOut,
  Activity,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import axiosInstance from '@/lib/axios';
import type { Account, Transaction, Category } from '@/types';

// ============================================
// INTERFACES
// ============================================

interface MonthlyData {
  month: string;
  ingresos: number;
  gastos: number;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function DashboardPage() {
  const router = useRouter();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // CÁLCULOS DE KPIs
  // ============================================

  // Saldo Total (Patrimonio Neto Real)
  const totalBalance = accounts.reduce((sum, account) => {
    return sum + account.current_balance;
  }, 0);

  // Obtener mes y año actual
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Filtrar transacciones del mes actual
  const currentMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  // Ingresos del mes
  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  // Gastos del mes
  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // ============================================
  // DATOS PARA GRÁFICO (Últimos 6 meses)
  // ============================================

  const getMonthlyChartData = (): MonthlyData[] => {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const data: MonthlyData[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === month && tDate.getFullYear() === year;
      });

      const ingresos = monthTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

      const gastos = monthTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      data.push({
        month: monthNames[month],
        ingresos,
        gastos
      });
    }

    return data;
  };

  const chartData = getMonthlyChartData();

  // ============================================
  // FORMATTERS
  // ============================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // ============================================
  // EFECTOS Y CARGA DE DATOS
  // ============================================

  useEffect(() => {
    const token = getCookie('auth_token');

    if (!token) {
      router.push('/');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar cuentas
        try {
          const accountsResponse = await axiosInstance.get<{ accounts: Account[] }>('/accounts');
          setAccounts(accountsResponse.data.accounts || []);
        } catch (err: any) {
          console.error('Error al cargar cuentas:', err);
          console.error('Detalles:', err.response?.data);
          setAccounts([]);
          
          // Si es error 401, redirigir al login
          if (err.response?.status === 401) {
            deleteCookie('auth_token');
            router.push('/');
            return;
          }
        }

        // Cargar transacciones
        try {
          const transactionsResponse = await axiosInstance.get<{ transactions: Transaction[] }>('/transactions', {
            params: { per_page: 50 }
          });
          setTransactions(transactionsResponse.data.transactions || []);
        } catch (err: any) {
          console.error('Error al cargar transacciones:', err);
          console.error('Detalles:', err.response?.data);
          setTransactions([]);
          
          // Si es error 401, redirigir al login
          if (err.response?.status === 401) {
            deleteCookie('auth_token');
            router.push('/');
            return;
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleLogout = () => {
    deleteCookie('auth_token');
    router.push('/');
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ============================================
          HEADER
          ============================================ */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-indigo-600 p-2">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Financiero</h1>
                <p className="text-sm text-gray-500">Gestiona tus finanzas personales</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ============================================
            SECCIÓN SUPERIOR - KPIs (3 Tarjetas)
            ============================================ */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Tarjeta 1: Saldo Total */}
          <div className="group rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 shadow-lg transition-all hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-100">Saldo Total</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {formatCurrency(totalBalance)}
                </p>
                <p className="mt-2 text-xs text-indigo-200">
                  Patrimonio neto real
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Ingresos del Mes */}
          <div className="group rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-lg transition-all hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-green-100">Ingresos del Mes</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {formatCurrency(monthlyIncome)}
                </p>
                <p className="mt-2 flex items-center text-xs text-green-200">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Gastos del Mes */}
          <div className="group rounded-2xl bg-gradient-to-br from-red-500 to-red-600 p-6 shadow-lg transition-all hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-red-100">Gastos del Mes</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {formatCurrency(monthlyExpenses)}
                </p>
                <p className="mt-2 flex items-center text-xs text-red-200">
                  <Activity className="mr-1 h-3 w-3" />
                  Balance: {formatCurrency(monthlyIncome - monthlyExpenses)}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <TrendingDown className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================
            SECCIÓN MEDIA - GRÁFICO
            ============================================ */}
        <div className="mt-8">
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Flujo de Efectivo - Últimos 6 Meses
                </h2>
                <p className="text-sm text-gray-500">
                  Comparación de ingresos vs gastos mensuales
                </p>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => value ? formatCurrency(Number(value)) : '$0.00'}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Bar 
                    dataKey="ingresos" 
                    fill="#10b981" 
                    radius={[8, 8, 0, 0]}
                    name="Ingresos"
                  />
                  <Bar 
                    dataKey="gastos" 
                    fill="#ef4444" 
                    radius={[8, 8, 0, 0]}
                    name="Gastos"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ============================================
            SECCIÓN INFERIOR - 2 COLUMNAS
            ============================================ */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Columna Izquierda: Lista de Cuentas */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Mis Cuentas</h2>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {accounts.length}
                </span>
              </div>

              {accounts.length === 0 ? (
                <div className="py-8 text-center">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">No hay cuentas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className="group rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`rounded-lg p-2 ${
                            account.type === 'LIQUID' 
                              ? 'bg-green-100' 
                              : 'bg-red-100'
                          }`}>
                            {account.type === 'LIQUID' ? (
                              <Wallet className={`h-5 w-5 ${
                                account.type === 'LIQUID' 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`} />
                            ) : (
                              <CreditCard className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {account.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {account.type === 'LIQUID' ? 'Cuenta Líquida' : 'Tarjeta de Crédito'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className={`text-right text-lg font-bold ${
                          account.current_balance >= 0 
                            ? 'text-gray-900' 
                            : 'text-red-600'
                        }`}>
                          {formatCurrency(account.current_balance)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Tabla de Últimas Transacciones */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Últimas Transacciones</h2>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {transactions.slice(0, 10).length} recientes
                </span>
              </div>

              {transactions.length === 0 ? (
                <div className="py-12 text-center">
                  <Activity className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">No hay transacciones</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Fecha
                        </th>
                        <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Descripción
                        </th>
                        <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Cuenta
                        </th>
                        <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Monto
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {transactions.slice(0, 10).map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="group transition-colors hover:bg-gray-50"
                        >
                          <td className="py-4 text-sm text-gray-600">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className={`rounded-lg p-2 ${
                                transaction.type === 'INCOME' 
                                  ? 'bg-green-100' 
                                  : transaction.type === 'EXPENSE'
                                  ? 'bg-red-100'
                                  : 'bg-blue-100'
                              }`}>
                                {transaction.type === 'INCOME' ? (
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                ) : transaction.type === 'EXPENSE' ? (
                                  <TrendingDown className="h-4 w-4 text-red-600" />
                                ) : (
                                  <Activity className="h-4 w-4 text-blue-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {transaction.description}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {transaction.category?.name || 'Sin categoría'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-sm text-gray-600">
                            {transaction.account?.name || 'N/A'}
                          </td>
                          <td className={`py-4 text-right font-bold ${
                            transaction.type === 'INCOME' 
                              ? 'text-green-600' 
                              : transaction.type === 'EXPENSE'
                              ? 'text-red-600'
                              : 'text-gray-900'
                          }`}>
                            {transaction.type === 'EXPENSE' ? '-' : '+'}
                            {formatCurrency(Math.abs(transaction.amount))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}