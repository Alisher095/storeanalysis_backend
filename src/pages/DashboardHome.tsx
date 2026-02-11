import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import {
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  Calendar,
  Filter,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'sonner';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  accentColor?: string;
}

function KPICard({ title, value, change, changeLabel, icon, trend, accentColor }: KPICardProps) {
  return (
    <div className="kpi-card group hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          accentColor || 'bg-primary/10'
        )}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full',
            trend === 'up' && 'bg-success/10 text-success',
            trend === 'down' && 'bg-destructive/10 text-destructive',
            trend === 'neutral' && 'bg-warning/10 text-warning'
          )}>
            {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
            {trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
            <span>{change > 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {changeLabel && (
        <p className="text-xs text-muted-foreground mt-2">{changeLabel}</p>
      )}
    </div>
  );
}

const CHART_COLORS = {
  primary: 'hsl(168, 70%, 26%)',
  accent: 'hsl(189, 94%, 43%)',
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(38, 92%, 50%)',
  destructive: 'hsl(0, 84%, 50%)',
  violet: 'hsl(263, 70%, 50%)',
};

const PIE_COLORS = [CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.destructive];

export default function DashboardHome() {
  const { user } = useAuth();
  const { tailAnalysis, spaceElasticity, salesSummary, filters, setFilters, applyFilters, isLoading, stores } = useData();
  
  const [localStoreId, setLocalStoreId] = useState(filters.storeId);
  const [localDateRange, setLocalDateRange] = useState(filters.dateRange);

  const totalSkus = tailAnalysis?.summary.total_skus || 0;
  const coreCount = Math.round(totalSkus * (tailAnalysis?.summary.core_pct || 0));
  const averageCount = Math.round(totalSkus * (tailAnalysis?.summary.average_pct || 0));
  const tailCount = Math.max(0, totalSkus - coreCount - averageCount);

  const pieData = [
    { name: 'Core Products', value: coreCount, percentage: Math.round((tailAnalysis?.summary.core_pct || 0) * 100) },
    { name: 'Average Products', value: averageCount, percentage: Math.round((tailAnalysis?.summary.average_pct || 0) * 100) },
    { name: 'Tail Products', value: tailCount, percentage: Math.round((tailAnalysis?.summary.tail_pct || 0) * 100) },
  ];

  const categoryData = (spaceElasticity?.table || []).map(cat => ({
    name: cat.category,
    sales: Math.round(cat.sales_pct * 1000) / 10,
    efficiency: cat.current_meters > 0 ? Math.round((cat.recommended_meters / cat.current_meters) * 100) : 0,
  }));


  const handleApplyFilters = async () => {
    setFilters({ storeId: localStoreId, dateRange: localDateRange });
    await applyFilters();
    
    const storeName = stores.find(s => String(s.id) === localStoreId)?.name || 'Unknown';
    const dateLabels: Record<string, string> = {
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 90 days',
      '6m': 'Last 6 months',
    };
    
    toast.success('Filters applied', {
      description: `Showing ${storeName} - ${dateLabels[localDateRange]}`,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your retail performance
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={localStoreId} onValueChange={setLocalStoreId}>
            <SelectTrigger className="w-[180px] h-10">
              <Store className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              {stores.map(store => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={localDateRange} onValueChange={setLocalDateRange}>
            <SelectTrigger className="w-[140px] h-10">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={handleApplyFilters} 
            disabled={isLoading}
            className="h-10"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Filter className="w-4 h-4 mr-2" />
            )}
            Apply
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 stagger-children",
        isLoading && "opacity-50 pointer-events-none"
      )}>
        <KPICard
          title="Total SKUs"
          value={totalSkus.toLocaleString()}
          change={2.5}
          changeLabel="vs last month"
          trend="up"
          icon={<Package className="w-6 h-6 text-primary" />}
          accentColor="bg-primary/10"
        />
        <KPICard
          title="Core Items"
          value={`${Math.round((tailAnalysis?.summary.core_pct || 0) * 100)}%`}
          change={1.2}
          changeLabel="of total SKUs"
          trend="up"
          icon={<TrendingUp className="w-6 h-6 text-success" />}
          accentColor="bg-success/10"
        />
        <KPICard
          title="Average Items"
          value={`${Math.round((tailAnalysis?.summary.average_pct || 0) * 100)}%`}
          change={0.5}
          changeLabel="of total SKUs"
          trend="neutral"
          icon={<Minus className="w-6 h-6 text-warning" />}
          accentColor="bg-warning/10"
        />
        <KPICard
          title="Total Sales"
          value={`$${((salesSummary?.totalSalesValue || 0) / 1000000).toFixed(2)}M`}
          change={5.8}
          changeLabel="vs last month"
          trend="up"
          icon={<DollarSign className="w-6 h-6 text-accent" />}
          accentColor="bg-accent/10"
        />
      </div>

      {/* Charts Row */}
      <div className={cn(
        "grid grid-cols-1 lg:grid-cols-3 gap-6",
        isLoading && "opacity-50 pointer-events-none"
      )}>
        {/* Core vs Tail Pie Chart */}
        <div className="chart-container lg:col-span-1">
          <h3 className="text-sm font-semibold text-foreground mb-4">Product Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number, name: string) => [value, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[index] }}
                />
                <span className="text-sm text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance Bar Chart */}
        <div className="chart-container lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">Category Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="sales"
                  name="Sales %"
                  fill={CHART_COLORS.primary}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trend Line Chart */}
      <div className={cn(
        "chart-container",
        isLoading && "opacity-50 pointer-events-none"
      )}>
        <h3 className="text-sm font-semibold text-foreground mb-4">Performance Trend (6 Months)</h3>
        <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">
          Trend data will appear once monthly analytics are available.
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-sm font-medium text-foreground">Top Insight</span>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{coreCount} products</span> contribute to {Math.round((tailAnalysis?.summary.core_pct || 0) * 100)}% of your total sales. Consider increasing shelf space for these core items.
          </p>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-sm font-medium text-foreground">Optimization Opportunity</span>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Frozen Foods</span> category has 25% over-allocated space. Reallocation could boost efficiency by 18%.
          </p>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-sm font-medium text-foreground">Action Required</span>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{tailCount} tail products</span> are occupying prime shelf positions. Review the heatmap for placement optimization.
          </p>
        </div>
      </div>
    </div>
  );
}
