import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Map,
  Download,
  Info,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye,
  Loader2,
  FileText,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { downloadCSV, downloadPDF, generateTableHTML, generateSummaryHTML } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { HeatmapZone as ApiHeatmapZone } from '@/contexts/DataContext';

type ViewMode = 'performance' | 'traffic';

const getPerformanceColor = (value: number) => {
  if (value >= 70) return 'bg-blue-500 hover:bg-blue-400';
  if (value >= 40) return 'bg-orange-500 hover:bg-orange-400';
  return 'bg-red-500 hover:bg-red-400';
};

const getTrafficColor = (value: number) => {
  if (value >= 70) return 'bg-emerald-500 hover:bg-emerald-400';
  if (value >= 40) return 'bg-yellow-500 hover:bg-yellow-400';
  return 'bg-rose-500 hover:bg-rose-400';
};

const getValueColor = (value: number, mode: ViewMode) => {
  return mode === 'performance' ? getPerformanceColor(value) : getTrafficColor(value);
};

const getPerformanceLabel = (value: number) => {
  if (value >= 70) return 'High';
  if (value >= 40) return 'Medium';
  return 'Low';
};

const getTrafficLabel = (traffic: string) => {
  switch (traffic) {
    case 'high':
      return 'text-success';
    case 'medium':
      return 'text-warning';
    case 'low':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
};

type HeatmapZone = {
  zone: string;
  category: string;
  traffic: 'high' | 'medium' | 'low';
  trafficScore: number;
  performance: number;
  x: number;
  y: number;
};

const mapZone = (zone: ApiHeatmapZone): HeatmapZone => {
  const trafficScore = Math.round(zone.traffic_score * 100);
  const traffic = trafficScore >= 70 ? 'high' : trafficScore >= 40 ? 'medium' : 'low';
  const performance = zone.performance === 'high' ? 85 : zone.performance === 'average' ? 55 : 25;

  return {
    zone: zone.zone_name,
    category: zone.zone_name,
    traffic,
    trafficScore,
    performance,
    x: zone.x,
    y: zone.y,
  };
};

export default function Heatmap() {
  const { heatmapData, isLoading } = useData();
  const mappedZones = heatmapData.map(mapZone);
  const [selectedZone, setSelectedZone] = useState<HeatmapZone | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('performance');
  const [isExporting, setIsExporting] = useState(false);

  // Group by rows
  const rows = useMemo(() => [
    mappedZones.filter(d => d.y === 0),
    mappedZones.filter(d => d.y === 1),
    mappedZones.filter(d => d.y === 2),
  ], [mappedZones]);

  const highPerformanceZones = mappedZones.filter(d => d.performance >= 70);
  const lowPerformanceZones = mappedZones.filter(d => d.performance < 40);
  const misalignedZones = mappedZones.filter(
    d => (d.traffic === 'high' && d.performance < 50) || (d.traffic === 'low' && d.performance >= 70)
  );

  const avgPerformance = mappedZones.length
    ? Math.round(mappedZones.reduce((sum, d) => sum + d.performance, 0) / mappedZones.length)
    : 0;

  const getCurrentValue = (zone: HeatmapZone) => {
    return viewMode === 'performance' ? zone.performance : zone.trafficScore;
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const exportData = mappedZones.map(zone => ({
        Zone: zone.zone,
        Category: zone.category,
        'Traffic Level': zone.traffic,
        'Traffic Score': zone.trafficScore,
        'Performance %': zone.performance,
        Position: `Row ${zone.y + 1}, Col ${zone.x + 1}`,
        Status: zone.performance >= 70 ? 'High' : zone.performance >= 40 ? 'Medium' : 'Low',
      }));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      downloadCSV(exportData, `heatmap-${viewMode}-${new Date().toISOString().split('T')[0]}`);
      toast.success('Export completed', {
        description: 'Heatmap data exported to CSV',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    const summaryItems = [
      { label: 'Total Zones', value: `${mappedZones.length}` },
      { label: 'High Performers', value: `${highPerformanceZones.length} zones (70%+ efficiency)` },
      { label: 'Low Performers', value: `${lowPerformanceZones.length} zones (<40% efficiency)` },
      { label: 'Misaligned Zones', value: `${misalignedZones.length}` },
      { label: 'Average Performance', value: `${avgPerformance}%` },
    ];
    
    const tableHeaders = ['Zone', 'Category', 'Traffic', 'Traffic Score', 'Performance', 'Status'];
    const tableRows = mappedZones.map(zone => [
      zone.zone,
      zone.category,
      zone.traffic,
      `${zone.trafficScore}%`,
      `${zone.performance}%`,
      zone.performance >= 70 ? 'High' : zone.performance >= 40 ? 'Medium' : 'Low',
    ]);
    
    const content = `
      <h2>Summary</h2>
      ${generateSummaryHTML(summaryItems)}
      <h2>Zone Details</h2>
      ${generateTableHTML(tableHeaders, tableRows)}
      <h2>Optimization Recommendations</h2>
      <div class="summary">
        ${misalignedZones.length > 0 ? `
          <h4>Misaligned Zones (High Traffic + Low Performance):</h4>
          <ul>
            ${misalignedZones.filter(z => z.traffic === 'high' && z.performance < 50).map(z => 
              `<li>${z.zone} (${z.category}): ${z.performance}% performance in high-traffic area - consider moving core products here</li>`
            ).join('')}
          </ul>
        ` : '<p>No major misalignments detected</p>'}
      </div>
    `;
    
    downloadPDF('Store Heatmap Analysis', content);
    toast.success('PDF report opened', {
      description: 'Print or save the report from the new window',
    });
  };

  const getLegendColors = () => {
    if (viewMode === 'performance') {
      return [
        { color: 'bg-blue-500', label: 'High (70%+)' },
        { color: 'bg-orange-500', label: 'Medium (40-70%)' },
        { color: 'bg-red-500', label: 'Low (<40%)' },
      ];
    }
    return [
      { color: 'bg-emerald-500', label: 'High Traffic' },
      { color: 'bg-yellow-500', label: 'Medium Traffic' },
      { color: 'bg-rose-500', label: 'Low Traffic' },
    ];
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Store Heatmap</h1>
          <p className="text-muted-foreground mt-1">
            Analyze product placement and traffic zone performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'performance' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode('performance')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Performance
            </Button>
            <Button
              variant={viewMode === 'traffic' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode('traffic')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Traffic
            </Button>
          </div>
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
            PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        isLoading && "opacity-50"
      )}>
        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Map className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Zones</p>
              <p className="text-xl font-bold text-foreground">{mappedZones.length}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Store floor sections</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">High Performers</p>
              <p className="text-xl font-bold text-foreground">{highPerformanceZones.length}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Zones with 70%+ efficiency</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Performers</p>
              <p className="text-xl font-bold text-foreground">{lowPerformanceZones.length}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Zones below 40% efficiency</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Misaligned</p>
              <p className="text-xl font-bold text-foreground">{misalignedZones.length}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Traffic/performance mismatch</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Grid */}
        <div className={cn(
          "lg:col-span-2 chart-container",
          isLoading && "opacity-50"
        )}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-foreground">
              Store Floor Plan - {viewMode === 'performance' ? 'Performance' : 'Traffic'} View
            </h3>
            <div className="flex items-center gap-4 text-xs">
              {getLegendColors().map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={cn('w-4 h-4 rounded', item.color)} />
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floor Plan Labels */}
          <div className="mb-2 flex justify-between px-2">
            <span className="text-xs text-muted-foreground">← Entrance</span>
            <span className="text-xs text-muted-foreground">Back of Store →</span>
          </div>

          {/* Heatmap Grid */}
          <div className="space-y-3">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-3">
                <div className="w-8 flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {['Front', 'Middle', 'Back'][rowIndex]}
                </div>
                <div className="flex-1 grid grid-cols-4 gap-3">
                  {row.map((zone) => (
                    <Tooltip key={zone.zone}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setSelectedZone(zone)}
                          className={cn(
                            'heatmap-cell aspect-square flex flex-col items-center justify-center p-3 text-white transition-all duration-200',
                            getValueColor(getCurrentValue(zone), viewMode),
                            selectedZone?.zone === zone.zone && 'ring-2 ring-white ring-offset-2 ring-offset-background'
                          )}
                        >
                          <span className="text-sm font-bold">{zone.zone}</span>
                          <span className="text-xs opacity-90">{getCurrentValue(zone)}%</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-semibold">{zone.zone}: {zone.category}</p>
                          <p className="text-sm">Performance: {zone.performance}%</p>
                          <p className="text-sm">Traffic: {zone.traffic} ({zone.trafficScore}%)</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Aisle Labels */}
          <div className="mt-4 flex gap-3">
            <div className="w-8" />
            <div className="flex-1 grid grid-cols-4 gap-3">
              {['Aisle 1', 'Aisle 2', 'Aisle 3', 'Aisle 4'].map((aisle) => (
                <div key={aisle} className="text-center text-xs text-muted-foreground">
                  {aisle}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zone Details Panel */}
        <div className="chart-container">
          <h3 className="text-sm font-semibold text-foreground mb-4">Zone Details</h3>
          
          {selectedZone ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">{selectedZone.zone}</span>
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium',
                      selectedZone.performance >= 70
                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        : selectedZone.performance >= 40
                        ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                        : 'bg-red-500/20 text-red-600 dark:text-red-400'
                    )}
                  >
                    {getPerformanceLabel(selectedZone.performance)}
                  </span>
                </div>
                <p className="text-muted-foreground">{selectedZone.category}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Performance</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          selectedZone.performance >= 70
                            ? 'bg-blue-500'
                            : selectedZone.performance >= 40
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        )}
                        style={{ width: `${selectedZone.performance}%` }}
                      />
                    </div>
                    <span className="font-medium">{selectedZone.performance}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Traffic Level</span>
                  <div className="flex items-center gap-2">
                    <span className={cn('font-medium capitalize', getTrafficLabel(selectedZone.traffic))}>
                      {selectedZone.traffic}
                    </span>
                    <span className="text-sm text-muted-foreground">({selectedZone.trafficScore}%)</span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Position</span>
                  <span className="font-medium">
                    Row {selectedZone.y + 1}, Col {selectedZone.x + 1}
                  </span>
                </div>
              </div>

              {/* Recommendations */}
              {selectedZone.performance < 50 && selectedZone.traffic === 'high' && (
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Optimization Opportunity</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        This high-traffic zone has low performance. Consider moving core products here.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Info className="w-10 h-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Click on a zone to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm font-medium text-foreground">Top Zone</span>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">
            {highPerformanceZones[0]?.zone || 'N/A'}
          </p>
          <p className="text-sm text-muted-foreground">
            {highPerformanceZones[0]?.category} - {highPerformanceZones[0]?.performance}% performance
          </p>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-sm font-medium text-foreground">Needs Attention</span>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">
            {lowPerformanceZones[0]?.zone || 'N/A'}
          </p>
          <p className="text-sm text-muted-foreground">
            {lowPerformanceZones[0]?.category} - Only {lowPerformanceZones[0]?.performance}% performance
          </p>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-sm font-medium text-foreground">Store Average</span>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">{avgPerformance}%</p>
          <p className="text-sm text-muted-foreground">
            Overall zone performance score
          </p>
        </div>
      </div>
    </div>
  );
}
