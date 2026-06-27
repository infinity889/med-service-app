import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearch } from '@/services/search';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScaleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

const POPULAR_SERVICES = [
  'Общий анализ крови (ОАК)',
  'Биохимический анализ крови',
  'МРТ головного мозга',
  'Прием терапевта',
  'УЗИ брюшной полости',
  'УЗИ щитовидной железы',
  'Общий анализ мочи',
  'ПЦР тест на COVID-19',
  'ЭКГ с расшифровкой'
];

export function Compare() {
  const { t } = useTranslation();
  const [selectedService, setSelectedService] = useState(POPULAR_SERVICES[0]);
  const [cityFilter, setCityFilter] = useState('');

  // Fetch search results dynamically for the selected service name
  const { data: results, isLoading } = useSearch(selectedService, {
    city: cityFilter,
    category: '',
    sortBy: 'price_asc'
  });

  // Unique clinics found for the selected service
  const comparisonData = useMemo(() => {
    if (!results) return [];
    
    return results.map(item => {
      // Mock ratings, times, and home take options based on clinic name for a rich UX
      let rating = 4.5;
      let time = '24 ч';
      let homeTake = false;
      
      const nameLower = item.clinicName.toLowerCase();
      if (nameLower.includes('kdl') || nameLower.includes('олимп')) {
        rating = 4.8;
        time = '18 ч';
        homeTake = true;
      } else if (nameLower.includes('invitro') || nameLower.includes('инвитро')) {
        rating = 4.6;
        time = '24 ч';
        homeTake = true;
      } else if (nameLower.includes('orhun') || nameLower.includes('орхун')) {
        rating = 4.9;
        time = '12 ч';
        homeTake = false;
      } else if (nameLower.includes('sunkar') || nameLower.includes('сункар')) {
        rating = 4.2;
        time = '36 ч';
        homeTake = false;
      } else if (nameLower.includes('emirmed') || nameLower.includes('эмирмед')) {
        rating = 4.7;
        time = '12 ч';
        homeTake = true;
      }

      return {
        id: item.id,
        name: item.clinicName,
        price: item.price,
        city: item.city,
        updated: new Date(item.updatedAt).toLocaleDateString(),
        rating,
        time,
        homeTake,
        category: item.category
      };
    });
  }, [results]);

  // Find the cheapest offer
  const cheapestOffer = useMemo(() => {
    if (comparisonData.length === 0) return null;
    return comparisonData.reduce((min, item) => item.price < min.price ? item : min, comparisonData[0]);
  }, [comparisonData]);

  // Chart data
  const chartData = useMemo(() => {
    return comparisonData.map(item => ({
      name: item.name,
      'Цена': item.price
    }));
  }, [comparisonData]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">{t('compare.title', 'Сравнение цен')}</h1>
          <p className="text-muted-foreground">{t('compare.subtitle', 'Сравните стоимость услуг в разных лабораториях и клиниках')}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="w-full sm:w-64">
            <select
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
              className="w-full h-11 bg-card border border-border rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm font-medium text-foreground"
            >
              {POPULAR_SERVICES.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-48">
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="w-full h-11 bg-card border border-border rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm font-medium text-foreground"
            >
              <option value="">{t('search.allCities')}</option>
              <option value="Astana">Astana</option>
              <option value="Almaty">Almaty</option>
              <option value="Shymkent">Shymkent</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border p-6 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-64 w-full" />
          </Card>
          <Card className="border-border p-6 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </Card>
        </div>
      ) : comparisonData.length === 0 ? (
        <Card className="border-border border-dashed py-16 flex flex-col items-center justify-center text-muted-foreground bg-card/50">
          <ScaleIcon className="w-12 h-12 opacity-20 mb-4" />
          <p className="text-lg font-medium">Нет данных для сравнения этой услуги</p>
          <p className="text-sm opacity-80 mt-1">Попробуйте сменить город или выбрать другой анализ</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Matrix and Chart */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border shadow-sm overflow-hidden bg-card">
              <CardHeader className="bg-card/50 border-b border-border py-4">
                <div className="flex items-center space-x-2">
                  <ScaleIcon className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg font-medium">{selectedService}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-1/4 font-semibold text-sm">{t('compare.feature', 'Характеристика')}</TableHead>
                      {comparisonData.map(c => (
                        <TableHead key={c.id} className="text-center font-semibold text-foreground text-sm">
                          {c.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-muted-foreground">{t('compare.price', 'Цена (₸)')}</TableCell>
                      {comparisonData.map(c => (
                        <TableCell key={c.id} className="text-center">
                          <span className={`font-bold text-base ${cheapestOffer?.id === c.id ? 'text-primary' : 'text-foreground'}`}>
                            {c.price.toLocaleString()} ₸
                          </span>
                          {cheapestOffer?.id === c.id && (
                            <span className="block text-[10px] text-primary font-semibold tracking-wider uppercase mt-0.5">
                              {t('service.bestOffers', 'Лучшая цена')}
                            </span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-muted-foreground">{t('compare.time', 'Срок исполнения')}</TableCell>
                      {comparisonData.map(c => (
                        <TableCell key={c.id} className="text-center text-sm">{c.time}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-muted-foreground">{t('compare.rating', 'Рейтинг клиники')}</TableCell>
                      {comparisonData.map(c => (
                        <TableCell key={c.id} className="text-center text-sm font-medium">⭐ {c.rating} / 5.0</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-muted-foreground">{t('compare.homeTake', 'Забор на дому')}</TableCell>
                      {comparisonData.map(c => (
                        <TableCell key={c.id} className="text-center">
                          {c.homeTake ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircleIcon className="w-5 h-5 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-muted-foreground">{t('compare.updated', 'Актуальность цены')}</TableCell>
                      {comparisonData.map(c => (
                        <TableCell key={c.id} className="text-center text-xs text-muted-foreground">{c.updated}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow className="hover:bg-transparent">
                      <TableCell></TableCell>
                      {comparisonData.map(c => (
                        <TableCell key={c.id} className="text-center py-4">
                          <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors w-full shadow-sm">
                            {t('compare.book', 'Записаться')}
                          </button>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Price Distribution Chart */}
            <Card className="border-border shadow-sm bg-card">
              <CardHeader className="bg-card/50 border-b border-border py-4">
                <CardTitle className="text-base font-medium">Сравнение стоимости предложений (₸)</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 h-[240px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6F767E', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6F767E', fontSize: 12 }} />
                    <RechartsTooltip 
                      cursor={{fill: 'rgba(255, 79, 0, 0.04)'}}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="Цена" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === cheapestOffer?.name ? '#FF4F00' : '#FF7A33'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Highlights Sidebar */}
          <div className="space-y-6">
            {cheapestOffer && (
              <Card className="border-primary/20 bg-primary/5 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <span className="text-2xl">✨</span>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-2 text-primary font-semibold">
                    <span className="text-base">✨</span>
                    <span>Рекомендация по выбору</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Сэкономьте на анализе
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Наилучшее предложение на рынке предоставляет клиника <strong className="text-foreground">{cheapestOffer.name}</strong> в городе <strong className="text-foreground">{cheapestOffer.city}</strong>.
                  </p>
                  <div className="pt-2 border-t border-primary/10 flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">Цена предложения:</span>
                    <span className="text-2xl font-bold text-primary">{cheapestOffer.price.toLocaleString()} ₸</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-border shadow-sm bg-card">
              <CardHeader className="border-b border-border py-4">
                <CardTitle className="text-base font-medium">Другие услуги</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-col gap-2">
                  {POPULAR_SERVICES.filter(s => s !== selectedService).slice(0, 5).map(service => (
                    <button
                      key={service}
                      onClick={() => setSelectedService(service)}
                      className="text-left text-sm p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-all font-medium flex justify-between items-center group text-foreground"
                    >
                      <span className="truncate pr-2">{service}</span>
                      <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold shrink-0">Сравнить →</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

