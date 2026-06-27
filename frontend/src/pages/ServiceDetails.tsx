import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BuildingOfficeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { usePriceHistoryChart } from '@/services/dashboard';
import { useServiceDetails } from '@/services/search';
import { useTranslation } from 'react-i18next';
import { getLocale } from '@/i18n';

export function ServiceDetails() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = getLocale(i18n.language);
  const { data: chartData } = usePriceHistoryChart();
  const { data: service, isLoading } = useServiceDetails(id);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-10 w-3/4 max-w-xl" />
          <Skeleton className="mt-4 h-4 w-full max-w-3xl" />
          <Skeleton className="mt-2 h-4 w-4/5 max-w-3xl" />
          
          <div className="mt-6">
            <Skeleton className="h-5 w-40 mb-3" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2 border-border shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="h-[300px]">
              <Skeleton className="w-full h-full rounded-md" />
            </CardContent>
          </Card>

          <Card className="col-span-1 border-border shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="bg-card/50 border-b border-border">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto divide-y divide-border">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <div className="space-y-2 flex flex-col items-end">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-64" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-40" /></TableHead>
                  <TableHead className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableHead>
                  <TableHead className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 text-center text-muted-foreground">
        Service not found.
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">{service.category}</Badge>
          <span className="text-sm text-muted-foreground">ID: {service.id}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">{service.canonicalName}</h1>
        <p className="mt-4 text-muted-foreground max-w-3xl leading-relaxed">{service.description}</p>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium text-foreground mb-3">{t('service.knownSynonyms')}</h3>
          <div className="flex flex-wrap gap-2">
            {service.synonyms.map(s => (
              <Badge key={s} variant="outline" className="font-normal bg-background text-muted-foreground">{s}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium">{t('service.priceTrend')}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4F00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF4F00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6F767E', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6F767E', fontSize: 12 }} tickFormatter={(value) => `${value.toLocaleString(locale)}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#111111', fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="averagePrice" stroke="#FF4F00" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-border shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="bg-card/50 border-b border-border">
            <CardTitle className="text-lg font-medium">{t('service.bestOffers')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            <div className="divide-y divide-border">
              {service.bestOffers.map((cp, idx) => (
                <div key={idx} className="p-4 hover:bg-muted/50 transition-colors flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="font-medium text-sm flex items-center">
                      <BuildingOfficeIcon className="w-4 h-4 mr-1.5 text-muted-foreground" />
                      {cp.clinic}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <MapPinIcon className="w-3.5 h-3.5 mr-1 text-muted-foreground/70" />
                      {cp.city}, {cp.address}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary tabular-nums">{cp.price.toLocaleString(locale)} ₸</div>
                    <div className="text-[10px] text-muted-foreground">{cp.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">{t('service.compareAll')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>{t('service.clinicName')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('service.city')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('service.address')}</TableHead>
                <TableHead className="text-right">{t('service.priceKzt')}</TableHead>
                <TableHead className="text-right">{t('service.lastParsed')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {service.bestOffers.map((cp, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{cp.clinic}</TableCell>
                  <TableCell>
                     <Badge variant="outline" className="font-normal bg-background text-xs hidden sm:inline-flex">{cp.city}</Badge>
                     <span className="sm:hidden text-xs text-muted-foreground">{cp.city}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{cp.address}</TableCell>
                  <TableCell className="text-right font-semibold text-foreground tabular-nums">{cp.price.toLocaleString(locale)}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{cp.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
