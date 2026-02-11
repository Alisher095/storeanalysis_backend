import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Maximize2,
  Download,
  RefreshCw,
  Loader2,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { downloadCSV, downloadPDF, generateTableHTML, generateSummaryHTML } from '@/utils/exportUtils';
import { toast } from 'sonner';

const CHART_COLORS = {
  current: 'hsl(168, 70%, 26%)',
  recommended: 'hsl(189, 94%, 43%)',
  efficiency: 'hsl(142, 76%, 36%)',
};

export default function SpaceElasticity() {
  const { spaceElasticity, recalculateSpaceElasticity, isLoading } = useData();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const spaceData = (spaceElasticity?.table || []).map(cat => {
    const variance = cat.recommended_meters - cat.current_meters;
    const variancePercent = cat.current_meters > 0 ? ((variance / cat.current_meters) * 100).toFixed(1) : '0.0';
    return {
      name: cat.category,
      current: cat.current_meters,
      recommended: cat.recommended_meters,
      variance,
      variancePercent,
      efficiency: cat.current_meters > 0 ? Math.round((cat.recommended_meters / cat.current_meters) * 100) : 0,
      sales: Math.round(cat.sales_pct * 1000) / 10,
    };
  });

  const totalSpace = spaceData.reduce((sum, cat) => sum + cat.current, 0);

  const overAllocated = spaceData.filter(d => d.variance < 0);
  const underAllocated = spaceData.filter(d => d.variance > 0);

  const totalSavings = overAllocated.reduce((sum, d) => sum + Math.abs(d.variance), 0);
  const avgEfficiency = spaceData.length > 0
    ? Math.round(spaceData.reduce((sum, cat) => sum + cat.efficiency, 0) / spaceData.length)
    : 0;

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await recalculateSpaceElasticity();
      toast.success('Recalculation complete', {
        description: 'Space recommendations have been updated based on current data',
      });
    } catch (error) {
      toast.error('Recalculation failed', {
        description: 'Please try again',
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const exportData = spaceData.map(cat => ({
        Category: cat.name,
        'Current Space (m)': cat.current,
        'Sales %': cat.sales,
        'Recommended Space (m)': cat.recommended,
        'Variance (m)': cat.variance,
        'Variance %': cat.variancePercent,
        'Efficiency %': cat.efficiency,
        Action: cat.variance < 0 ? 'Reduce' : cat.variance > 0 ? 'Increase' : 'Optimal',
      }));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      downloadCSV(exportData, `space-elasticity-${new Date().toISOString().split('T')[0]}`);
      toast.success('Export completed', {
        description: 'Space elasticity report exported to CSV',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    const summaryItems = [
      { label: 'Total Space', value: `${totalSpace}m` },
      { label: 'Space to Reallocate', value: `${totalSavings}m from ${overAllocated.length} categories` },
      { label: 'Under-allocated Categories', value: `${underAllocated.length}` },
      { label: 'Average Efficiency', value: `${avgEfficiency}%` },
    ];
    
    const tableHeaders = ['Category', 'Current (m)', 'Sales %', 'Recommended (m)', 'Variance', 'Efficiency', 'Action'];
    const tableRows = spaceData.map(cat => [
      cat.name,
      `${cat.current}m`,
      `${cat.sales}%`,
      `${cat.recommended}m`,
      `${cat.variance > 0 ? '+' : ''}${cat.variance}m (${cat.variancePercent}%)`,
      `${cat.efficiency}%`,
      cat.variance < 0 ? 'Reduce' : cat.variance > 0 ? 'Increase' : 'Optimal',
    ]);
    
    const content = `
      <h2>Summary</h2>
      ${generateSummaryHTML(summaryItems)}
      <h2>Space Allocation Details</h2>
      ${generateTableHTML(tableHeaders, tableRows)}
      <h2>Recommendations</h2>
      <div class="summary">
        <h4>Categories to Reduce:</h4>
        <ul>
          ${overAllocated.map(cat => `<li>${cat.name}: ${cat.variance}m (${cat.variancePercent}%)</li>`).join('')}
        </ul>
        <h4>Categories to Increase:</h4>
        <ul>
          ${underAllocated.map(cat => `<li>${cat.name}: +${cat.variance}m (+${cat.variancePercent}%)</li>`).join('')}
        </ul>
      </div>
    `;
    
    downloadPDF('Space Elasticity Analysis', content);
    toast.success('PDF report opened', {
      description: 'Print or save the report from the new window',
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Space Elasticity</h1>
          <p className="text-muted-foreground mt-1">
            Optimize shelf space allocation based on sales performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleRecalculate}
            disabled={isRecalculating || isLoading}
          >
            {isRecalculating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Recalculate
          </Button>
          <Button 
            variant="outline"
            onClick={handleExportCSV}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            CSV
          </Button>
          <Button onClick={handleExportPDF}>
            <FileText className="w-4 h-4 mr-2" />
            PDF Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        (isRecalculating || isLoading) && "opacity-50 pointer-events-none"
      )}>
        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Maximize2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Space</p>
              <p className="text-xl font-bold text-foreground">{totalSpace}m</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Across all categories</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <ArrowDown className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Space to Reallocate</p>
              <p className="text-xl font-bold text-foreground">{totalSavings}m</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">From {overAllocated.length} categories</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <ArrowUp className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Need More Space</p>
              <p className="text-xl font-bold text-foreground">{underAllocated.length}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Categories under-allocated</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Efficiency</p>
              <p className="text-xl font-bold text-foreground">{avgEfficiency}%</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Current space utilization</p>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className={cn(
        "chart-container",
        (isRecalculating || isLoading) && "opacity-50"
      )}>
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Current vs Recommended Space Allocation
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spaceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} unit="m" />
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
                formatter={(value: number, name: string) => [`${value}m`, name]}
              />
              <Legend />
              <Bar dataKey="current" name="Current Space" fill={CHART_COLORS.current} radius={[0, 4, 4, 0]} />
              <Bar dataKey="recommended" name="Recommended" fill={CHART_COLORS.recommended} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Efficiency Chart */}
      <div className={cn(
        "chart-container",
        (isRecalculating || isLoading) && "opacity-50"
      )}>
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Space Efficiency by Category
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spaceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value}%`, 'Efficiency']}
              />
              <Bar dataKey="efficiency" name="Efficiency" radius={[4, 4, 0, 0]}>
                {spaceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.efficiency >= 80
                        ? 'hsl(142, 76%, 36%)'
                        : entry.efficiency >= 50
                        ? 'hsl(38, 92%, 50%)'
                        : 'hsl(0, 84%, 50%)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className={cn(
        "card-elevated overflow-hidden",
        (isRecalculating || isLoading) && "opacity-50"
      )}>
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Space Allocation Details</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Current Space</th>
                <th>Sales %</th>
                <th>Recommended</th>
                <th>Variance</th>
                <th>Efficiency</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {spaceData.map(category => (
                <tr key={category.name}>
                  <td className="font-medium">{category.name}</td>
                  <td>{category.current}m</td>
                  <td>{category.sales}%</td>
                  <td>{category.recommended}m</td>
                  <td>
                    <div className="flex items-center gap-2">
                      {category.variance > 0 ? (
                        <ArrowUp className="w-4 h-4 text-success" />
                      ) : category.variance < 0 ? (
                        <ArrowDown className="w-4 h-4 text-destructive" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span
                        className={cn(
                          'font-medium',
                          category.variance > 0 && 'text-success',
                          category.variance < 0 && 'text-destructive'
                        )}
                      >
                        {category.variance > 0 ? '+' : ''}
                        {category.variance}m ({category.variancePercent}%)
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            category.efficiency >= 80
                              ? 'bg-success'
                              : category.efficiency >= 50
                              ? 'bg-warning'
                              : 'bg-destructive'
                          )}
                          style={{ width: `${category.efficiency}%` }}
                        />
                      </div>
                      <span className="text-sm">{category.efficiency}%</span>
                    </div>
                  </td>
                  <td>
                    {category.variance !== 0 && (
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                          category.variance < 0
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-success/10 text-success'
                        )}
                      >
                        {category.variance < 0 ? 'Reduce' : 'Increase'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-elevated p-5">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <ArrowDown className="w-5 h-5 text-destructive" />
            Reduce Allocation
          </h4>
          <div className="space-y-3">
            {overAllocated.map(cat => (
              <div key={cat.name} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5">
                <span className="font-medium">{cat.name}</span>
                <span className="text-sm text-destructive">
                  {cat.variance}m ({cat.variancePercent}%)
                </span>
              </div>
            ))}
            {overAllocated.length === 0 && (
              <p className="text-sm text-muted-foreground">No categories over-allocated</p>
            )}
          </div>
        </div>

        <div className="card-elevated p-5">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <ArrowUp className="w-5 h-5 text-success" />
            Increase Allocation
          </h4>
          <div className="space-y-3">
            {underAllocated.map(cat => (
              <div key={cat.name} className="flex items-center justify-between p-3 rounded-lg bg-success/5">
                <span className="font-medium">{cat.name}</span>
                <span className="text-sm text-success">
                  +{cat.variance}m (+{cat.variancePercent}%)
                </span>
              </div>
            ))}
            {underAllocated.length === 0 && (
              <p className="text-sm text-muted-foreground">No categories under-allocated</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
