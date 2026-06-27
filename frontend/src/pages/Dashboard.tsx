import { useDashboardStats, usePriceHistoryChart } from '@/services/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BuildingOfficeIcon, ClipboardDocumentListIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { getLocale } from '@/i18n';

export function Dashboard() {
  const { t, i18n } = useTranslation();
  const locale = getLocale(i18n.language);
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: chartData, isLoading: chartLoading } = usePriceHistoryChart();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('dashboard.totalClinics')} 
          value={stats?.totalClinics} 
          icon={<BuildingOfficeIcon className="w-5 h-5 text-primary" />} 
          loading={statsLoading}
          locale={locale}
        />
        <StatCard 
          title={t('dashboard.medicalServices')} 
          value={stats?.totalServices} 
          icon={<ClipboardDocumentListIcon className="w-5 h-5 text-primary" />} 
          loading={statsLoading}
          locale={locale}
        />
        <StatCard 
          title={t('dashboard.priceRecords')} 
          value={stats?.totalPrices} 
          icon={<CurrencyDollarIcon className="w-5 h-5 text-primary" />} 
          loading={statsLoading}
          locale={locale}
        />
        <StatCard 
          title={t('dashboard.avgServicePrice')} 
          value={stats ? `${stats.averagePrice.toLocaleString(locale)} ₸` : undefined} 
          icon={<ClockIcon className="w-5 h-5 text-primary" />} 
          loading={statsLoading}
          locale={locale}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium">{t('dashboard.priceTrend')}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {chartLoading ? (
              <Skeleton className="w-full h-full rounded-md" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF4F00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF4F00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6F767E', fontSize: 12 }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6F767E', fontSize: 12 }} 
                    tickFormatter={(value) => `${value.toLocaleString(locale)}`} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#111111', fontWeight: 500 }}
                  />
                  <Area type="monotone" dataKey="averagePrice" stroke="#FF4F00" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium">{t('dashboard.recentUpdates')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">Общий анализ крови (ОАК)</span>
                    <span className="text-xs text-muted-foreground">KDL Olymp • Astana</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold tabular-nums">2 500 ₸</span>
                    <span className="text-[10px] text-primary">{t('dashboard.updatedAgo', { hours: 2 })}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, loading, locale }: { title: string; value?: number | string; icon: React.ReactNode; loading: boolean; locale: string }) {
  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <h3 className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
              {typeof value === 'number' ? value.toLocaleString(locale) : value}
            </h3>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
