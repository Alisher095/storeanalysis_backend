import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { apiGet } from '@/lib/api';

interface Filters {
  storeId: string;
  dateRange: string;
}

export interface Store {
  id: number;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface TailAnalysisSummary {
  total_skus: number;
  core_pct: number;
  average_pct: number;
  tail_pct: number;
  tail_sales_share: number;
}

export interface TailAnalysisTableItem {
  sku: string;
  product_name: string;
  category: string;
  sales_pct: number;
  classification: 'core' | 'average' | 'tail';
}

export interface TailAnalysisChart {
  core_sales_share: number;
  average_sales_share: number;
  tail_sales_share: number;
}

export interface TailAnalysisResponse {
  summary: TailAnalysisSummary;
  table: TailAnalysisTableItem[];
  chart: TailAnalysisChart;
}

export interface SpaceElasticityTableItem {
  category: string;
  sales_pct: number;
  current_meters: number;
  recommended_meters: number;
}

export interface SpaceElasticityResponse {
  table: SpaceElasticityTableItem[];
  chart: {
    current: { category: string; meters: number }[];
    recommended: { category: string; meters: number }[];
  };
}

export interface HeatmapZone {
  zone_name: string;
  x: number;
  y: number;
  traffic_score: number;
  performance: string;
  color: string;
}

export interface SalesSummary {
  totalSalesValue: number;
  avgSalesPerSKU: number;
}

interface DataContextType {
  stores: Store[];
  categories: Category[];
  tailAnalysis: TailAnalysisResponse | null;
  spaceElasticity: SpaceElasticityResponse | null;
  heatmapData: HeatmapZone[];
  salesSummary: SalesSummary | null;
  filters: Filters;
  isLoading: boolean;
  setFilters: (filters: Filters) => void;
  applyFilters: () => Promise<void>;
  recalculateSpaceElasticity: () => Promise<SpaceElasticityResponse | null>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tailAnalysis, setTailAnalysis] = useState<TailAnalysisResponse | null>(null);
  const [spaceElasticity, setSpaceElasticity] = useState<SpaceElasticityResponse | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapZone[]>([]);
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [filters, setFilters] = useState<Filters>({ storeId: '1', dateRange: '30d' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [storeList, categoryList] = await Promise.all([
          apiGet<Store[]>('/stores'),
          apiGet<Category[]>('/categories'),
        ]);
        setStores(storeList);
        setCategories(categoryList);

        if (storeList.length > 0) {
          setFilters((prev) => ({ ...prev, storeId: String(storeList[0].id) }));
        }
      } catch {
        // ignore bootstrap errors for now
      }
    };

    void bootstrap();
  }, []);

  const buildDateRange = () => {
    const now = new Date();
    let start = new Date(now);

    switch (filters.dateRange) {
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      case '6m':
        start.setMonth(now.getMonth() - 6);
        break;
      default:
        start.setDate(now.getDate() - 30);
        break;
    }

    return {
      date_start: start.toISOString(),
      date_end: now.toISOString(),
    };
  };

  const applyFilters = useCallback(async () => {
    setIsLoading(true);
    try {
      const storeId = Number(filters.storeId);
      const { date_start, date_end } = buildDateRange();

      const [tailResponse, spaceResponse, heatmapResponse, salesResponse] = await Promise.all([
        apiGet<TailAnalysisResponse>(
          `/analytics/tail?store_id=${storeId}&date_start=${encodeURIComponent(date_start)}&date_end=${encodeURIComponent(date_end)}`
        ),
        apiGet<SpaceElasticityResponse>(
          `/analytics/space?store_id=${storeId}&date_start=${encodeURIComponent(date_start)}&date_end=${encodeURIComponent(date_end)}`
        ),
        apiGet<{ zones: HeatmapZone[] }>(
          `/analytics/heatmap?store_id=${storeId}&date_start=${encodeURIComponent(date_start)}&date_end=${encodeURIComponent(date_end)}`
        ),
        apiGet<
          {
            id: number;
            product_id: number;
            store_id: number;
            date: string;
            units_sold: number;
            revenue: number;
          }[]
        >(
          `/sales?store_id=${storeId}&date_start=${encodeURIComponent(date_start)}&date_end=${encodeURIComponent(date_end)}`
        ),
      ]);

      setTailAnalysis(tailResponse);
      setSpaceElasticity(spaceResponse);
      setHeatmapData(heatmapResponse.zones || []);

      const totalSalesValue = salesResponse.reduce((sum, sale) => sum + Number(sale.revenue || 0), 0);
      const totalSkus = tailResponse.summary.total_skus || 0;
      const avgSalesPerSKU = totalSkus > 0 ? totalSalesValue / totalSkus : 0;
      setSalesSummary({ totalSalesValue, avgSalesPerSKU });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const recalculateSpaceElasticity = useCallback(async (): Promise<SpaceElasticityResponse | null> => {
    setIsLoading(true);
    try {
      const storeId = Number(filters.storeId);
      const { date_start, date_end } = buildDateRange();
      const response = await apiGet<SpaceElasticityResponse>(
        `/analytics/space?store_id=${storeId}&date_start=${encodeURIComponent(date_start)}&date_end=${encodeURIComponent(date_end)}`
      );
      setSpaceElasticity(response);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (filters.storeId) {
      void applyFilters();
    }
  }, [filters.storeId, filters.dateRange, applyFilters]);

  return (
    <DataContext.Provider
      value={{
        stores,
        categories,
        tailAnalysis,
        spaceElasticity,
        heatmapData,
        salesSummary,
        filters,
        isLoading,
        setFilters,
        applyFilters,
        recalculateSpaceElasticity,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
