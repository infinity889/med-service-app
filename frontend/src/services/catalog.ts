import { apiClient } from '@/api/axios';

export interface CatalogItem {
  id: string;
  name: string;
  avgPrice: number;
}

export interface CatalogCategory {
  id: string;
  name: string;
  items: CatalogItem[];
}

export const servicesApi = {
  getCatalog: async (): Promise<CatalogCategory[]> => {
    const response = await apiClient.get<CatalogCategory[]>('/services/catalog');
    return response.data;
  },
};
