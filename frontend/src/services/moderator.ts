import { apiClient } from '../api/axios';

export interface RawRecord {
  id: string;
  source_file_id: string;
  raw_service_name: string;
  raw_price: string;
  cleaned_service_name?: string;
  cleaned_price?: number;
  status: string;
  error_message?: string;
  created_at: string;
}

export interface ServiceItem {
  id: string;
  canonical_name: string;
  description?: string;
  category_id: string;
}

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await apiClient.post('/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const runParser = async (url: string) => {
  const { data } = await apiClient.post('/parser/run/', { url });
  return data;
};

export const getRecords = async (status?: string) => {
  const params = status ? { status } : {};
  const { data } = await apiClient.get<RawRecord[]>('/records/', { params });
  return data;
};

export const getServices = async () => {
  const { data } = await apiClient.get<ServiceItem[]>('/services/');
  return data;
};

export const resolveRecord = async (recordId: string, serviceId: string) => {
  const { data } = await apiClient.post(`/records/${recordId}/resolve`, {
    service_id: serviceId,
  });
  return data;
};

