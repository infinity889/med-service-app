import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlassIcon, BeakerIcon, HeartIcon, UserIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function Services() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    {
      id: 'lab',
      titleKey: 'services.labTests',
      icon: <BeakerIcon className="w-6 h-6 text-primary" />,
      items: [
        { id: '1', name: 'Общий анализ крови (ОАК)', avgPrice: 2500 },
        { id: '2', name: 'Биохимический анализ крови', avgPrice: 6500 },
        { id: '3', name: 'Витамин D', avgPrice: 8000 },
        { id: '4', name: 'ПЦР тест на COVID-19', avgPrice: 5000 },
      ]
    },
    {
      id: 'diagnostics',
      titleKey: 'services.diagnostics',
      icon: <HeartIcon className="w-6 h-6 text-primary" />,
      items: [
        { id: '5', name: 'МРТ головного мозга', avgPrice: 18000 },
        { id: '6', name: 'УЗИ брюшной полости', avgPrice: 6000 },
        { id: '7', name: 'КТ легких', avgPrice: 15000 },
        { id: '8', name: 'ЭКГ', avgPrice: 3000 },
      ]
    },
    {
      id: 'consultations',
      titleKey: 'services.consultations',
      icon: <UserIcon className="w-6 h-6 text-primary" />,
      items: [
        { id: '9', name: 'Прием терапевта', avgPrice: 8000 },
        { id: '10', name: 'Прием невропатолога', avgPrice: 10000 },
        { id: '11', name: 'Прием гинеколога', avgPrice: 9000 },
        { id: '12', name: 'Прием кардиолога', avgPrice: 12000 },
      ]
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">{t('services.title', 'Каталог услуг')}</h1>
          <p className="mt-2 text-muted-foreground">{t('services.subtitle', 'Выберите категорию или воспользуйтесь поиском')}</p>
        </div>
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-border rounded-md leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
            placeholder={t('services.searchPlaceholder', 'Поиск по каталогу...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(j => <Skeleton key={j} className="h-10 w-full rounded-md" />)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    {category.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">{t(category.titleKey, category.titleKey)}</h2>
                </div>
                
                <div className="space-y-2">
                  {category.items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/services/${item.id}`)}
                      className="w-full text-left group flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors border border-transparent hover:border-border"
                    >
                      <div className="flex items-center space-x-2 overflow-hidden pr-2">
                        <CheckBadgeIcon className="w-4 h-4 text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap bg-background px-2 py-1 rounded shadow-sm border border-border">
                        ~ {item.avgPrice.toLocaleString()} ₸
                      </span>
                    </button>
                  ))}
                  {category.items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <div className="text-sm text-muted-foreground py-4 text-center">
                      {t('services.noResults', 'Ничего не найдено')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
