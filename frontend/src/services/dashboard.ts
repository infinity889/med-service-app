import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/axios';

export interface DashboardStats {
  totalClinics: number;
  totalServices: number;
  totalPrices: number;
  lastUpdate: string;
  averagePrice: number;
}

export interface ChartDataPoint {
  date: string;
  averagePrice: number;
}

const MOCK_STATS: DashboardStats = {
  totalClinics: 142,
  totalServices: 2350,
  totalPrices: 18400,
  lastUpdate: new Date().toISOString(),
  averagePrice: 4250,
};

const MOCK_CHART_DATA: ChartDataPoint[] = [
  { date: 'Jan', averagePrice: 4100 },
  { date: 'Feb', averagePrice: 4150 },
  { date: 'Mar', averagePrice: 4300 },
  { date: 'Apr', averagePrice: 4250 },
  { date: 'May', averagePrice: 4400 },
  { date: 'Jun', averagePrice: 4250 },
];

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const isMock = import.meta.env.VITE_USE_MOCK !== 'false';
      
      if (isMock) {
        return new Promise<DashboardStats>((resolve) => setTimeout(() => resolve(MOCK_STATS), 800));
      } else {
        const { data } = await apiClient.get<DashboardStats>('/dashboard/stats');
        return data;
      }
    },
  });
};

export const usePriceHistoryChart = () => {
  return useQuery({
    queryKey: ['dashboard', 'chart'],
    queryFn: async () => {
      const isMock = import.meta.env.VITE_USE_MOCK !== 'false';
      
      if (isMock) {
        return new Promise<ChartDataPoint[]>((resolve) => setTimeout(() => resolve(MOCK_CHART_DATA), 800));
      } else {
        const { data } = await apiClient.get<ChartDataPoint[]>('/dashboard/chart');
        return data;
      }
    },
  });
};
