import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/axios';

export interface SearchResult {
  id: string;
  serviceName: string;
  clinicName: string;
  price: number;
  city: string;
  updatedAt: string;
  category: string;
}

export interface SearchFilters {
  city: string;
  category: string;
  sortBy: string;
}

const MOCK_RESULTS: SearchResult[] = [
  { id: '1', serviceName: 'Общий анализ крови (ОАК)', clinicName: 'KDL Olymp', price: 2500, city: 'Astana', updatedAt: '2025-05-10', category: 'Лаборатория' },
  { id: '2', serviceName: 'Общий анализ крови (ОАК)', clinicName: 'Invitro', price: 2700, city: 'Astana', updatedAt: '2025-05-09', category: 'Лаборатория' },
  { id: '3', serviceName: 'МРТ головного мозга', clinicName: 'Orhun Medical', price: 18000, city: 'Almaty', updatedAt: '2025-05-11', category: 'Диагностика' },
  { id: '4', serviceName: 'Прием терапевта', clinicName: 'Emirmed', price: 5000, city: 'Almaty', updatedAt: '2025-05-12', category: 'Приём врача' },
  { id: '5', serviceName: 'УЗИ брюшной полости', clinicName: 'Sunkar', price: 6500, city: 'Shymkent', updatedAt: '2025-05-08', category: 'Диагностика' },
  { id: '6', serviceName: 'УЗИ щитовидной железы', clinicName: 'Sunkar', price: 5500, city: 'Shymkent', updatedAt: '2025-05-08', category: 'Диагностика' },
  { id: '7', serviceName: 'Общий анализ мочи', clinicName: 'KDL Olymp', price: 1200, city: 'Astana', updatedAt: '2025-05-10', category: 'Лаборатория' },
];

export const useSearch = (query: string, filters: SearchFilters) => {
  return useQuery({
    queryKey: ['search', query, filters],
    queryFn: async () => {
      const isMock = import.meta.env.VITE_USE_MOCK !== 'false';
      
      if (isMock) {
        // Simulate network request
        return new Promise<SearchResult[]>((resolve) => {
          setTimeout(() => {
            let results = [...MOCK_RESULTS];
            
            if (query) {
              const q = query.toLowerCase();
              results = results.filter(r => 
                r.serviceName.toLowerCase().includes(q) || 
                r.clinicName.toLowerCase().includes(q)
              );
            }
            
            if (filters.city) {
              results = results.filter(r => r.city === filters.city);
            }
            
            if (filters.category) {
              results = results.filter(r => r.category === filters.category);
            }
            
            // Basic sorting
            if (filters.sortBy === 'price_asc') {
              results.sort((a, b) => a.price - b.price);
            } else if (filters.sortBy === 'price_desc') {
              results.sort((a, b) => b.price - a.price);
            }
            
            resolve(results);
          }, 600);
        });
      } else {
        const { data } = await apiClient.get<SearchResult[]>('/search', {
          params: { query, ...filters }
        });
        return data;
      }
    },
  });
};

export interface ServiceDetailsData {
  id: string;
  canonicalName: string;
  synonyms: string[];
  description: string;
  category: string;
  bestOffers: Array<{
    clinic: string;
    city: string;
    price: number;
    date: string;
    address: string;
  }>;
}

const MOCK_SERVICE_DETAILS: Record<string, ServiceDetailsData> = {
  '1': {
    id: '1',
    canonicalName: 'Общий анализ крови (ОАК)',
    synonyms: ['ОАК', 'CBC', 'Клинический анализ крови', 'Анализ крови общий'],
    description: 'Комплексное исследование, определяющее количественный и качественный состав форменных элементов крови. Помогает выявить воспалительные процессы, анемию и другие отклонения.',
    category: 'Лаборатория',
    bestOffers: [
      { clinic: 'KDL Olymp', city: 'Astana', price: 2500, date: '2025-05-10', address: 'ул. Достык 18' },
      { clinic: 'Invitro', city: 'Astana', price: 2700, date: '2025-05-09', address: 'пр. Мангилик Ел 53' },
      { clinic: 'Helix', city: 'Almaty', price: 2450, date: '2025-05-11', address: 'ул. Абая 120' },
    ],
  },
};

export const useServiceDetails = (id?: string) => {
  return useQuery({
    queryKey: ['serviceDetails', id],
    queryFn: async () => {
      if (!id) return null;
      const isMock = import.meta.env.VITE_USE_MOCK !== 'false';
      
      if (isMock) {
        return new Promise<ServiceDetailsData | null>((resolve) => {
          setTimeout(() => {
            const details = MOCK_SERVICE_DETAILS[id] || {
              ...MOCK_SERVICE_DETAILS['1'], // fallback mock
              id: id,
            };
            resolve(details);
          }, 600);
        });
      } else {
        const { data } = await apiClient.get<ServiceDetailsData>(`/services/${id}`);
        return data;
      }
    },
    enabled: !!id,
  });
};
