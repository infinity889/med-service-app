import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPinIcon, PhoneIcon, GlobeAltIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { getLocale } from '@/i18n';
import { useClinicDetails } from '@/services/clinics';

export function ClinicDetails() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const locale = getLocale(i18n.language);
  const { data: clinic, isLoading } = useClinicDetails(id);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
          <Skeleton className="w-32 h-32 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-4 w-full">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-3/4 max-w-2xl" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-card/50 pb-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-20 ml-auto" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
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

  if (!clinic) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 text-center text-muted-foreground">
        Clinic not found.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
        {/* Clinic Logo Placeholder */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-center justify-center shrink-0">
          <span className="text-3xl sm:text-4xl font-bold text-primary">{clinic.name.substring(0, 3)}</span>
        </div>
        
        <div className="flex-1 space-y-4 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">{clinic.name}</h1>
            {clinic.verified && (
              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">{t('clinic.verified')}</Badge>
            )}
          </div>
          
          <p className="text-muted-foreground max-w-2xl">{clinic.description}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="flex items-start space-x-3">
              <MapPinIcon className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-foreground">{clinic.city}</div>
                <div className="text-sm text-muted-foreground">{clinic.address}</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <PhoneIcon className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm font-medium text-foreground">{clinic.phone}</div>
            </div>
            
            <div className="flex items-start space-x-3">
              <GlobeAltIcon className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <a href={clinic.website} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">
                {clinic.website.replace('https://', '')}
              </a>
            </div>
            
            <div className="flex items-start space-x-3">
              <ClockIcon className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm font-medium text-foreground">{clinic.workingHours}</div>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border bg-card/50 pb-4">
          <CardTitle className="text-lg font-medium">{t('clinic.servicesProvided')}</CardTitle>
          <div className="text-xs sm:text-sm text-muted-foreground flex items-center">
            <ArrowPathIcon className="w-4 h-4 mr-1.5" />
            {t('clinic.pricesParsedOn', { date: clinic.lastUpdate })}
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-transparent">
                <TableHead>{t('clinic.serviceName')}</TableHead>
                <TableHead>{t('clinic.category')}</TableHead>
                <TableHead className="text-right">{t('clinic.price')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinic.services.map((s, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-foreground">{s.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal text-xs">{s.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary tabular-nums">
                    {s.price.toLocaleString(locale)} ₸
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
