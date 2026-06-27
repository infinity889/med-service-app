import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useClinics } from '@/services/clinics';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { MagnifyingGlassIcon, MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { ClinicsMap } from '@/components/ClinicsMap';

export function Clinics() {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');

  const { data: clinics, isLoading } = useClinics(query, city);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchInput);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">{t('clinicsList.title')}</h1>
        <p className="text-muted-foreground">{t('clinicsList.subtitle')}</p>
      </div>

      <ClinicsMap />

      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('clinicsList.searchPlaceholder')}
              className="pl-10 h-12 bg-background"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
              }}
              className="w-full h-12 bg-background border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            >
              <option value="">{t('search.allCities')}</option>
              <option value="Astana">Astana</option>
              <option value="Almaty">Almaty</option>
              <option value="Shymkent">Shymkent</option>
            </select>
          </div>
          <button
            type="submit"
            className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md transition-colors shadow-sm"
          >
            {t('search.searchButton')}
          </button>
        </form>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-foreground">
          {isLoading ? '...' : t('clinicsList.found', { count: clinics?.length || 0 })}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="pt-2 flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : clinics?.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground bg-card border border-border rounded-xl border-dashed">
            <BuildingOfficeIcon className="w-12 h-12 opacity-20 mb-4" />
            <p>{t('clinicsList.noResults')}</p>
          </div>
        ) : (
          clinics?.map((clinic) => (
            <Link key={clinic.id} to={`/clinics/${clinic.id}`} className="group block h-full">
              <Card className="border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all h-full bg-card">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-xl group-hover:scale-105 transition-transform">
                        {clinic.name.substring(0, 1)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {clinic.name}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPinIcon className="w-4 h-4 mr-1 shrink-0" />
                          <span className="truncate">{clinic.city}</span>
                        </div>
                      </div>
                    </div>
                    {clinic.verified && (
                      <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary shrink-0">
                        {t('clinic.verified')}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
                    {clinic.description}
                  </p>
                  
                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {t('clinicsList.servicesCount', { count: clinic.servicesCount })}
                    </span>
                    <span className="text-primary font-medium flex items-center group-hover:translate-x-1 transition-transform">
                      {t('search.details')} →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
