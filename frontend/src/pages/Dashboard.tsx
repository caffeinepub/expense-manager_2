import { useState, useMemo } from 'react';
import { useGetExpenses } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Download,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Receipt,
  CalendarDays,
  PackageOpen,
  Printer,
} from 'lucide-react';
import { useDeleteExpense } from '../hooks/useQueries';
import type { Expense } from '../backend';

const CATEGORIES = [
  'Movies',
  'Gadgets',
  'Clothes',
  'Food',
  'Travel',
  'Health',
  'Education',
  'Other',
];

const CATEGORY_COLORS: Record<string, string> = {
  Movies: '#a855f7',
  Gadgets: '#3b82f6',
  Clothes: '#ec4899',
  Food: '#f97316',
  Travel: '#14b8a6',
  Health: '#22c55e',
  Education: '#6366f1',
  Other: '#94a3b8',
};

const CATEGORY_BG: Record<string, string> = {
  Movies: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Gadgets: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Clothes: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  Food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Travel: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  Health: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Education: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  Other: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatRupee(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function CategoryBadge({ category }: { category: string }) {
  const cls = CATEGORY_BG[category] ?? CATEGORY_BG['Other'];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {category}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  loading,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  sub?: string;
  loading?: boolean;
  accent?: boolean;
}) {
  return (
    <div className={`bg-card rounded-2xl p-5 shadow-card border border-border flex flex-col gap-3 ${accent ? 'ring-1 ring-gold/40' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? 'bg-gold/15' : 'bg-muted'}`}>
          <Icon className={`w-4.5 h-4.5 ${accent ? 'text-gold' : 'text-muted-foreground'}`} />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-28" />
      ) : (
        <p className={`text-2xl font-display font-bold ${accent ? 'text-gold' : 'text-foreground'}`}>
          {value}
        </p>
      )}
      {sub && !loading && (
        <p className="text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}

function ExpenseCard({
  expense,
  onDelete,
  deleting,
}: {
  expense: Expense;
  onDelete: (id: bigint) => void;
  deleting: boolean;
}) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 flex items-start gap-4 hover:shadow-card-lg transition-shadow duration-200 group animate-fade-in">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: `${CATEGORY_COLORS[expense.category] ?? CATEGORY_COLORS['Other']}20` }}
      >
        <IndianRupee
          className="w-5 h-5"
          style={{ color: CATEGORY_COLORS[expense.category] ?? CATEGORY_COLORS['Other'] }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{expense.title}</p>
            {expense.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {expense.description}
              </p>
            )}
          </div>
          <p className="font-bold text-foreground text-base flex-shrink-0">
            {formatRupee(expense.price)}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <CategoryBadge category={expense.category || 'Other'} />
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {formatDate(expense.timestamp)}
          </span>
        </div>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{expense.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(expense.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function Dashboard() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const { data: expenses = [], isLoading } = useGetExpenses();
  const deleteMutation = useDeleteExpense();

  // Filter expenses for selected month/year
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const date = new Date(Number(exp.timestamp) / 1_000_000);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
  }, [expenses, selectedMonth, selectedYear]);

  // Summary stats for selected month
  const stats = useMemo(() => {
    if (filteredExpenses.length === 0) {
      return { total: 0, count: 0, highest: null as number | null, lowest: null as number | null };
    }
    const prices = filteredExpenses.map((e) => e.price);
    return {
      total: prices.reduce((a, b) => a + b, 0),
      count: filteredExpenses.length,
      highest: Math.max(...prices),
      lowest: Math.min(...prices),
    };
  }, [filteredExpenses]);

  // Category breakdown for chart
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    CATEGORIES.forEach((c) => (map[c] = 0));
    filteredExpenses.forEach((e) => {
      const cat = e.category || 'Other';
      map[cat] = (map[cat] ?? 0) + e.price;
    });
    return CATEGORIES.map((cat) => ({
      name: cat,
      amount: map[cat],
      color: CATEGORY_COLORS[cat],
    })).filter((d) => d.amount > 0);
  }, [filteredExpenses]);

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const isCurrentMonth =
    selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

  const handleDelete = (id: bigint) => {
    deleteMutation.mutate(id);
  };

  const handleDownloadPDF = () => {
    const monthLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rows = filteredExpenses
      .map(
        (e) => `
        <tr>
          <td>${e.title}</td>
          <td>${e.category || 'Other'}</td>
          <td>${e.description || '-'}</td>
          <td>${formatDate(e.timestamp)}</td>
          <td style="text-align:right">${formatRupee(e.price)}</td>
        </tr>`
      )
      .join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Expense Report - ${monthLabel}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; padding: 40px; }
    .header { border-bottom: 3px solid #c9a227; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 28px; font-weight: 800; color: #1a1a2e; }
    .header p { color: #666; margin-top: 4px; font-size: 14px; }
    .month-title { font-size: 18px; font-weight: 700; color: #c9a227; margin-top: 8px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }
    .stat-card { background: #f8f9fa; border-radius: 10px; padding: 16px; border-left: 4px solid #c9a227; }
    .stat-card .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; font-weight: 600; }
    .stat-card .value { font-size: 20px; font-weight: 800; color: #1a1a2e; margin-top: 4px; }
    .section-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #1a1a2e; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead tr { background: #1a1a2e; color: white; }
    thead th { padding: 10px 12px; text-align: left; font-weight: 600; }
    thead th:last-child { text-align: right; }
    tbody tr:nth-child(even) { background: #f8f9fa; }
    tbody td { padding: 9px 12px; border-bottom: 1px solid #e9ecef; }
    tbody td:last-child { text-align: right; font-weight: 600; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #e9ecef; color: #555; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #e9ecef; padding-top: 16px; }
    .total-row { background: #1a1a2e !important; color: white; font-weight: 700; }
    .total-row td { color: white !important; border: none !important; }
    @media print {
      body { padding: 20px; }
      .stats { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>💰 ExpenseTrack</h1>
    <p>Monthly Expense Report</p>
    <div class="month-title">${monthLabel}</div>
  </div>

  <div class="stats">
    <div class="stat-card">
      <div class="label">Total Spent</div>
      <div class="value">${formatRupee(stats.total)}</div>
    </div>
    <div class="stat-card">
      <div class="label">Transactions</div>
      <div class="value">${stats.count}</div>
    </div>
    <div class="stat-card">
      <div class="label">Highest</div>
      <div class="value">${stats.highest !== null ? formatRupee(stats.highest) : '—'}</div>
    </div>
    <div class="stat-card">
      <div class="label">Lowest</div>
      <div class="value">${stats.lowest !== null ? formatRupee(stats.lowest) : '—'}</div>
    </div>
  </div>

  <div class="section-title">Expense Details</div>
  <table>
    <thead>
      <tr>
        <th>Title</th>
        <th>Category</th>
        <th>Description</th>
        <th>Date</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="5" style="text-align:center;padding:20px;color:#888">No expenses for this month</td></tr>'}
      ${
        filteredExpenses.length > 0
          ? `<tr class="total-row">
              <td colspan="4"><strong>Total for ${monthLabel}</strong></td>
              <td>${formatRupee(stats.total)}</td>
            </tr>`
          : ''
      }
    </tbody>
  </table>

  <div class="footer">
    Generated by ExpenseTrack &bull; ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const chartConfig = Object.fromEntries(
    CATEGORIES.map((cat) => [
      cat,
      { label: cat, color: CATEGORY_COLORS[cat] },
    ])
  );

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Track and manage your monthly expenses
          </p>
        </div>
        <Button
          onClick={handleDownloadPDF}
          variant="outline"
          className="flex items-center gap-2 border-gold/40 text-gold hover:bg-gold/10 hover:text-gold"
          disabled={filteredExpenses.length === 0}
        >
          <Download className="w-4 h-4" />
          Download PDF Report
        </Button>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between bg-card rounded-2xl border border-border shadow-card px-5 py-4">
        <button
          onClick={prevMonth}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="font-display font-bold text-xl text-foreground">
            {MONTH_NAMES[selectedMonth]} {selectedYear}
          </p>
          {isCurrentMonth && (
            <span className="text-xs text-gold font-medium">Current Month</span>
          )}
        </div>
        <button
          onClick={nextMonth}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          disabled={isCurrentMonth}
        >
          <ChevronRight className={`w-5 h-5 ${isCurrentMonth ? 'opacity-30' : ''}`} />
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Spent"
          value={isLoading ? '...' : formatRupee(stats.total)}
          icon={IndianRupee}
          sub={`${stats.count} transaction${stats.count !== 1 ? 's' : ''}`}
          loading={isLoading}
          accent
        />
        <StatCard
          label="Transactions"
          value={isLoading ? '...' : String(stats.count)}
          icon={Receipt}
          loading={isLoading}
        />
        <StatCard
          label="Highest Expense"
          value={isLoading ? '...' : stats.highest !== null ? formatRupee(stats.highest) : '—'}
          icon={TrendingUp}
          loading={isLoading}
        />
        <StatCard
          label="Lowest Expense"
          value={isLoading ? '...' : stats.lowest !== null ? formatRupee(stats.lowest) : '—'}
          icon={TrendingDown}
          loading={isLoading}
        />
      </div>

      {/* Category Chart */}
      {!isLoading && categoryData.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-display font-semibold text-foreground mb-5 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-gold inline-block" />
            Spending by Category
          </h3>
          <ChartContainer config={chartConfig} className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [formatRupee(Number(value)), 'Amount']}
                    />
                  }
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )}

      {/* Expense List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-gold inline-block" />
            Expenses — {MONTH_NAMES[selectedMonth]} {selectedYear}
          </h3>
          {!isLoading && filteredExpenses.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {filteredExpenses.length} item{filteredExpenses.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4 flex gap-4">
                <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border shadow-card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <PackageOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="font-display font-semibold text-foreground mb-2">
              No expenses in {MONTH_NAMES[selectedMonth]} {selectedYear}
            </h4>
            <p className="text-muted-foreground text-sm">
              Use the navigation above to browse other months, or add a new expense.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <ExpenseCard
                key={String(expense.id)}
                expense={expense}
                onDelete={handleDelete}
                deleting={deleteMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Print button (secondary) */}
      {filteredExpenses.length > 0 && (
        <div className="flex justify-center pb-4">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
        </div>
      )}
    </div>
  );
}
