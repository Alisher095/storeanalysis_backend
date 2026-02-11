import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowUpDown,
  Search,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { downloadCSV } from '@/utils/exportUtils';
import { toast } from 'sonner';

type SortField = 'sku' | 'name' | 'category' | 'salesPercentage';
type SortDirection = 'asc' | 'desc';

const CHART_COLORS = {
  core: 'hsl(142, 76%, 36%)',
  average: 'hsl(38, 92%, 50%)',
  tail: 'hsl(0, 84%, 50%)',
  primary: 'hsl(168, 70%, 26%)',
  accent: 'hsl(189, 94%, 43%)',
};

const ITEMS_PER_PAGE = 15;

export default function TailAnalysis() {
  const { tailAnalysis, categories, applyFilters, isLoading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('salesPercentage');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!tailAnalysis) {
      void applyFilters();
    }
  }, [tailAnalysis, applyFilters]);

  const products = tailAnalysis?.table || [];
  const summary = tailAnalysis?.summary;
  const chart = tailAnalysis?.chart;

  const coreProducts = products.filter(p => p.classification === 'core');
  const averageProducts = products.filter(p => p.classification === 'average');
  const tailProducts = products.filter(p => p.classification === 'tail');

  const corePercentage = summary ? Math.round(summary.core_pct * 100) : 0;
  const averagePercentage = summary ? Math.round(summary.average_pct * 100) : 0;
  const tailPercentage = summary ? Math.round(summary.tail_pct * 100) : 0;

  const coreSalesContribution = chart ? chart.core_sales_share * 100 : 0;
  const averageSalesContribution = chart ? chart.average_sales_share * 100 : 0;
  const tailSalesContribution = chart ? chart.tail_sales_share * 100 : 0;

  const pieData = [
    { name: 'Core', value: coreProducts.length, sales: coreSalesContribution.toFixed(1) },
    { name: 'Average', value: averageProducts.length, sales: averageSalesContribution.toFixed(1) },
    { name: 'Tail', value: tailProducts.length, sales: tailSalesContribution.toFixed(1) },
  ];

  const categoryBreakdown = (categories.length ? categories.map(c => c.name) : [...new Set(products.map(p => p.category))]).map(name => {
    const catProducts = products.filter(p => p.category === name);
    const catCore = catProducts.filter(p => p.classification === 'core').length;
    const catAverage = catProducts.filter(p => p.classification === 'average').length;
    const catTail = catProducts.filter(p => p.classification === 'tail').length;
    return {
      name,
      core: catCore,
      average: catAverage,
      tail: catTail,
      total: catProducts.length,
    };
  });

  const trendData: { month: string; coreShare: number; averageShare: number; tailShare: number }[] = [];

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.sku.toLowerCase().includes(query) ||
          p.product_name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    if (classificationFilter !== 'all') {
      filtered = filtered.filter(p => p.classification === classificationFilter);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'sku':
          comparison = a.sku.localeCompare(b.sku);
          break;
        case 'name':
          comparison = a.product_name.localeCompare(b.product_name);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'salesPercentage':
          comparison = a.sales_pct - b.sales_pct;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [products, searchQuery, categoryFilter, classificationFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, classificationFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Export filtered products
      const exportData = filteredProducts.map(p => ({
        SKU: p.sku,
        'Product Name': p.product_name,
        Category: p.category,
        'Sales %': (p.sales_pct * 100).toFixed(2),
        Classification: p.classification.charAt(0).toUpperCase() + p.classification.slice(1),
      }));
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UX
      downloadCSV(exportData, `tail-analysis-${new Date().toISOString().split('T')[0]}`);
      toast.success('Export completed', {
        description: `${exportData.length} products exported to CSV`,
      });
    } catch (error) {
      toast.error('Export failed', {
        description: 'Please try again',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const uniqueCategories = [...new Set(products.map(p => p.category))];

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'core':
        return <span className="badge-core">Core</span>;
      case 'average':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">Average</span>;
      case 'tail':
        return <span className="badge-tail">Tail</span>;
      default:
        return null;
    }
  };


  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Tail Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Identify products taking shelf space without meaningful sales contribution
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Core Products</p>
              <p className="text-xl font-bold text-foreground">{coreProducts.length}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {corePercentage}% of SKUs → {coreSalesContribution.toFixed(1)}% of sales
          </p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Minus className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Products</p>
              <p className="text-xl font-bold text-foreground">{averageProducts.length}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {averagePercentage}% of SKUs → {averageSalesContribution.toFixed(1)}% of sales
          </p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tail Products</p>
              <p className="text-xl font-bold text-foreground">{tailProducts.length}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {tailPercentage}% of SKUs → {tailSalesContribution.toFixed(1)}% of sales
          </p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pareto Insight</p>
              <p className="text-xl font-bold text-foreground">{corePercentage}/{Math.round(coreSalesContribution)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {corePercentage}% products drive {Math.round(coreSalesContribution)}% sales
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="chart-container">
          <h3 className="text-sm font-semibold text-foreground mb-4">Product Distribution</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill={CHART_COLORS.core} />
                  <Cell fill={CHART_COLORS.average} />
                  <Cell fill={CHART_COLORS.tail} />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value} products (${props.payload.sales}% sales)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.core }} />
              <span className="text-sm text-muted-foreground">Core</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.average }} />
              <span className="text-sm text-muted-foreground">Average</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.tail }} />
              <span className="text-sm text-muted-foreground">Tail</span>
            </div>
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="chart-container lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">Category Breakdown</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown} layout="vertical">
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
                <Legend />
                <Bar dataKey="core" name="Core" stackId="a" fill={CHART_COLORS.core} />
                <Bar dataKey="average" name="Average" stackId="a" fill={CHART_COLORS.average} />
                <Bar dataKey="tail" name="Tail" stackId="a" fill={CHART_COLORS.tail} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="chart-container">
        <h3 className="text-sm font-semibold text-foreground mb-4">Distribution Trend (6 Months)</h3>
        <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
          Trend data will appear once monthly analytics are available.
        </div>
      </div>

      {/* Data Table */}
      <div className="card-elevated overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <h3 className="text-lg font-semibold text-foreground">Product Details</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={classificationFilter} onValueChange={setClassificationFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="core">Core</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="tail">Tail</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <button
                    onClick={() => handleSort('sku')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    SKU
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th>
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Product Name
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th>
                  <button
                    onClick={() => handleSort('category')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Category
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th>
                  <button
                    onClick={() => handleSort('salesPercentage')}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Sales %
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(product => (
                <tr key={product.sku} className="group">
                  <td className="font-mono text-sm">{product.sku}</td>
                  <td className="font-medium">{product.product_name}</td>
                  <td className="text-muted-foreground">{product.category}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            product.classification === 'core' && 'bg-success',
                            product.classification === 'average' && 'bg-warning',
                            product.classification === 'tail' && 'bg-destructive'
                          )}
                          style={{ width: `${Math.min(product.sales_pct * 2000, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm">{(product.sales_pct * 100).toFixed(2)}%</span>
                    </div>
                  </td>
                  <td>{getClassificationBadge(product.classification)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    className="w-9"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
