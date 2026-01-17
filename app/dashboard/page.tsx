'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from 'cookies-next';
import { financesService } from '@/services/finances';
import type { Account, Transaction } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Cálculos financieros
  const totalLiquidez = accounts
    ?.filter(account => account.type === 'LIQUID')
    .reduce((sum, account) => sum + account.current_balance, 0) || 0;

  const totalDeuda = accounts
    ?.filter(account => account.type === 'CREDIT')
    .reduce((sum, account) => sum + account.current_balance, 0) || 0;

  const patrimonio = totalLiquidez + totalDeuda;

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Verificar autenticación y cargar datos
  useEffect(() => {
    const token = getCookie('auth_token');

    if (!token) {
      router.push('/');
      return;
    }

    const loadData = async () => {
      try {
        // Cargar cuentas
        try {
          const accountsData = await financesService.getAccounts();
          setAccounts(accountsData);
        } catch (error) {
          console.error('Error al cargar cuentas:', error);
          setAccounts([]);
        }

        // Cargar transacciones
        try {
          const transactionsData = await financesService.getTransactions({ per_page: 10 });
          setTransactions(transactionsData);
        } catch (error) {
          console.error('Error al cargar transacciones:', error);
          setTransactions([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // Cerrar sesión
  const handleLogout = () => {
    deleteCookie('auth_token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 animate-spin text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-700">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Mis Finanzas</h1>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Resumen Financiero - Grid de 3 Tarjetas */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Tarjeta Verde - Liquidez */}
          <div className="rounded-xl bg-white p-6 shadow-md ring-1 ring-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Liquidez Disponible
                </p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {formatCurrency(totalLiquidez)}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Tarjeta Roja - Deuda */}
          <div className="rounded-xl bg-white p-6 shadow-md ring-1 ring-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deuda Total</p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {formatCurrency(totalDeuda)}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Tarjeta Azul/Índigo - Patrimonio */}
          <div className="rounded-xl bg-white p-6 shadow-md ring-1 ring-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Patrimonio Neto
                </p>
                <p className={`mt-2 text-3xl font-bold ${
                  patrimonio >= 0 ? 'text-indigo-600' : 'text-orange-600'
                }`}>
                  {formatCurrency(patrimonio)}
                </p>
              </div>
              <div className="rounded-full bg-indigo-100 p-3">
                <svg
                  className="h-8 w-8 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Movimientos Recientes */}
        <div className="mt-8">
          <div className="rounded-xl bg-white shadow-md">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">
                Movimientos Recientes
              </h2>
            </div>

            {!transactions || transactions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500">
                  No hay transacciones registradas
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {transactions.slice(0, 5).map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {transaction.category?.name || 'Sin categoría'}
                        </td>
                        <td
                          className={`whitespace-nowrap px-6 py-4 text-right text-sm font-semibold ${
                            transaction.type === 'EXPENSE'
                              ? 'text-red-600'
                              : transaction.type === 'INCOME'
                              ? 'text-green-600'
                              : 'text-gray-900'
                          }`}
                        >
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

        {/* Resumen de Cuentas */}
        <div className="mt-8">
          <div className="rounded-xl bg-white shadow-md">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">Mis Cuentas</h2>
            </div>

            {accounts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-500">
                  No hay cuentas registradas
                </p>
              </div>
            ) : (
              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {account.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {account.type === 'LIQUID' ? 'Líquida' : 'Crédito'}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          account.type === 'LIQUID'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {account.type}
                      </span>
                    </div>
                    <p
                      className={`mt-3 text-lg font-bold ${
                        account.current_balance >= 0
                          ? 'text-gray-900'
                          : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(account.current_balance)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
