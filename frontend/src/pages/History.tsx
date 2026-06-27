import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ClockIcon, BuildingOfficeIcon, BookmarkIcon, ArrowRightIcon, BellIcon, TrashIcon } from '@heroicons/react/24/outline';

interface SubscriptionItem {
  id: string;
  serviceName: string;
  clinicName: string;
  date: string;
}

export function History() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'recent' | 'bookmarks' | 'subscriptions'>('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      if (activeTab === 'subscriptions') {
        const savedIds = JSON.parse(localStorage.getItem('price_subscriptions') || '[]');
        const subDetails = JSON.parse(localStorage.getItem('price_sub_details') || '{}');
        const list = savedIds.map((id: string) => {
          const detail = subDetails[id] || { serviceName: 'Услуга', clinicName: 'Клиника', date: new Date().toLocaleDateString() };
          return { id, ...detail };
        });
        setSubscriptions(list);
      }
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const recentHistory = [
    { id: '1', type: 'service', name: 'Общий анализ крови (ОАК)', info: 'Средняя цена: 2 500 ₸', time: '2 часа назад' },
    { id: '2', type: 'clinic', name: 'KDL Olymp', info: 'Астана, пр. Мәңгілік Ел', time: '5 часов назад' },
    { id: '3', type: 'service', name: 'МРТ головного мозга', info: 'Средняя цена: 18 000 ₸', time: 'Вчера' },
  ];

  const bookmarks = [
    { id: '4', type: 'clinic', name: 'Medical Park', info: 'Алматы', addedOn: '12.05.2026' },
    { id: '5', type: 'service', name: 'Биохимический анализ крови', info: 'Средняя цена: 6 500 ₸', addedOn: '10.05.2026' },
  ];

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">{t('history.title', 'История и закладки')}</h1>
        <p className="text-muted-foreground">{t('history.subtitle', 'Недавно просмотренные услуги и сохраненные клиники')}</p>
      </div>

      <div className="flex overflow-x-auto -mx-1 px-1 space-x-1 p-1 bg-muted/50 rounded-lg max-w-full border border-border">
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex-1 min-w-[100px] py-2 px-2 text-xs sm:text-sm font-medium rounded-md transition-all text-foreground whitespace-nowrap ${
            activeTab === 'recent' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('history.recent', 'Недавно просмотренные')}
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 min-w-[100px] py-2 px-2 text-xs sm:text-sm font-medium rounded-md transition-all text-foreground whitespace-nowrap ${
            activeTab === 'bookmarks' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('history.bookmarks', 'Закладки')}
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex-1 min-w-[100px] py-2 px-2 text-xs sm:text-sm font-medium rounded-md transition-all text-foreground whitespace-nowrap ${
            activeTab === 'subscriptions' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('history.subscriptions', 'Подписки')}
        </button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          renderSkeleton()
        ) : activeTab === 'recent' ? (
          <div className="space-y-4">
            {recentHistory.map((item) => (
              <Card key={item.id} className="border-border shadow-sm hover:shadow-md transition-shadow group">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {item.type === 'service' ? (
                        <ClockIcon className="w-5 h-5 text-primary" />
                      ) : (
                        <BuildingOfficeIcon className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{item.info}</span>
                        <span className="w-1 h-1 rounded-full bg-border"></span>
                        <span>{item.time}</span>
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(item.type === 'service' ? `/services/${item.id}` : `/clinics/${item.id}`)}
                    className="flex items-center justify-center px-4 py-2 bg-background border border-border text-foreground hover:bg-muted text-sm font-medium rounded-md transition-colors"
                  >
                    Перейти
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activeTab === 'bookmarks' ? (
          <div className="space-y-4">
            {bookmarks.map((item) => (
              <Card key={item.id} className="border-border shadow-sm hover:shadow-md transition-shadow group">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <BookmarkIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{item.info}</span>
                        <span className="w-1 h-1 rounded-full bg-border"></span>
                        <span>Добавлено: {item.addedOn}</span>
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(item.type === 'service' ? `/services/${item.id}` : `/clinics/${item.id}`)}
                    className="flex items-center justify-center px-4 py-2 bg-background border border-border text-foreground hover:bg-muted text-sm font-medium rounded-md transition-colors"
                  >
                    Перейти
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.length === 0 ? (
              <Card className="border-border border-dashed py-12 flex flex-col items-center justify-center text-muted-foreground bg-card/50">
                <BellIcon className="w-10 h-10 opacity-20 mb-3" />
                <p className="text-sm font-medium">У вас пока нет активных подписок.</p>
                <p className="text-xs opacity-75 mt-0.5">Нажмите на 🔔 в поиске, чтобы отслеживать цены.</p>
              </Card>
            ) : (
              subscriptions.map((item) => (
                <Card key={item.id} className="border-border shadow-sm hover:shadow-md transition-shadow group bg-card">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <BellIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-left">{item.serviceName}</h3>
                        <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2 mt-1">
                          <span>{item.clinicName}</span>
                          <span className="w-1 h-1 rounded-full bg-border"></span>
                          <span>Подписка создана: {item.date}</span>
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        const savedIds = JSON.parse(localStorage.getItem('price_subscriptions') || '[]');
                        const updated = savedIds.filter((id: string) => id !== item.id);
                        localStorage.setItem('price_subscriptions', JSON.stringify(updated));
                        setSubscriptions(prev => prev.filter(p => p.id !== item.id));
                      }}
                      className="flex items-center justify-center px-4 py-2 border border-border text-red-500 hover:bg-red-50/50 text-sm font-medium rounded-md transition-colors bg-background shrink-0"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Отписаться
                    </button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
