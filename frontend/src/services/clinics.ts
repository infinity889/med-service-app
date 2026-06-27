import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/axios';

export interface Clinic {
  id: string;
  name: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  website: string;
  workingHours: string;
  averagePrice: number;
  lastUpdate: string;
  verified: boolean;
  servicesCount: number;
}

export interface ClinicService {
  name: string;
  category: string;
  price: number;
}

export interface ClinicDetails extends Clinic {
  services: ClinicService[];
}

const MOCK_CLINICS: Clinic[] = [
  {
    id: '1',
    name: 'KDL Olymp',
    description: 'Сеть клинико-диагностических лабораторий в Казахстане, предоставляющая широкий спектр медицинских анализов и исследований.',
    city: 'Astana',
    address: 'пр. Мангилик Ел 53, Блок С',
    phone: '+7 (7172) 55-00-00',
    website: 'https://kdlolymp.kz',
    workingHours: 'Пн-Сб: 08:00 - 18:00, Вс: Выходной',
    averagePrice: 4200,
    lastUpdate: '2025-05-12',
    verified: true,
    servicesCount: 154,
  },
  {
    id: '2',
    name: 'Invitro',
    description: 'Международная частная медицинская компания, специализирующаяся на лабораторной диагностике и оказании медицинских услуг.',
    city: 'Astana',
    address: 'ул. Достык 18',
    phone: '+7 (7172) 12-34-56',
    website: 'https://invitro.kz',
    workingHours: 'Пн-Вс: 07:30 - 19:00',
    averagePrice: 4500,
    lastUpdate: '2025-05-11',
    verified: true,
    servicesCount: 120,
  },
  {
    id: '3',
    name: 'Orhun Medical',
    description: 'Сеть клиник, предоставляющая услуги современной диагностики, в том числе МРТ, КТ и ПЭТ/КТ исследований.',
    city: 'Almaty',
    address: 'ул. Маркова 71',
    phone: '+7 (727) 333-22-11',
    website: 'https://orhunmedical.kz',
    workingHours: 'Круглосуточно',
    averagePrice: 15000,
    lastUpdate: '2025-05-09',
    verified: true,
    servicesCount: 45,
  },
  {
    id: '4',
    name: 'Sunkar',
    description: 'Многопрофильный медицинский центр, предоставляющий полный спектр медицинских и диагностических услуг.',
    city: 'Shymkent',
    address: 'ул. Иляева 15',
    phone: '+7 (7252) 55-44-33',
    website: 'https://sunkar.kz',
    workingHours: 'Пн-Сб: 08:00 - 20:00',
    averagePrice: 5500,
    lastUpdate: '2025-05-10',
    verified: false,
    servicesCount: 89,
  },
];

const MOCK_CLINIC_SERVICES: Record<string, ClinicService[]> = {
  '1': [
    { name: 'Общий анализ крови (ОАК)', category: 'Лаборатория', price: 2500 },
    { name: 'Биохимический анализ крови', category: 'Лаборатория', price: 8500 },
    { name: 'ПЦР тест на COVID-19', category: 'Лаборатория', price: 7000 },
    { name: 'УЗИ брюшной полости', category: 'Диагностика', price: 6000 },
    { name: 'ЭКГ с расшифровкой', category: 'Диагностика', price: 3500 },
  ],
};

export const useClinics = (query: string, city: string) => {
  return useQuery({
    queryKey: ['clinics', query, city],
    queryFn: async () => {
      const isMock = import.meta.env.VITE_USE_MOCK !== 'false';
      
      if (isMock) {
        return new Promise<Clinic[]>((resolve) => {
          setTimeout(() => {
            let results = [...MOCK_CLINICS];
            
            if (query) {
              const q = query.toLowerCase();
              results = results.filter(r => 
                r.name.toLowerCase().includes(q) || 
                r.description.toLowerCase().includes(q)
              );
            }
            
            if (city) {
              results = results.filter(r => r.city === city);
            }
            
            resolve(results);
          }, 600);
        });
      } else {
        const { data } = await apiClient.get<Clinic[]>('/clinics', {
          params: { query, city }
        });
        return data;
      }
    },
  });
};

export const useClinicDetails = (id?: string) => {
  return useQuery({
    queryKey: ['clinic', id],
    queryFn: async () => {
      if (!id) return null;
      const isMock = import.meta.env.VITE_USE_MOCK !== 'false';
      
      if (isMock) {
        return new Promise<ClinicDetails | null>((resolve) => {
          setTimeout(() => {
            const clinic = MOCK_CLINICS.find(c => c.id === id);
            if (!clinic) return resolve(null);
            
            resolve({
              ...clinic,
              services: MOCK_CLINIC_SERVICES[id] || [],
            });
          }, 800);
        });
      } else {
        const { data } = await apiClient.get<ClinicDetails>(`/clinics/${id}`);
        return data;
      }
    },
    enabled: !!id,
  });
};
