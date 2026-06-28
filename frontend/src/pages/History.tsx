import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ClockIcon, BookmarkIcon, ArrowRightIcon, BellIcon, TrashIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { getLocale } from '@/i18n';

interface RecentItem {
  id: string;
  serviceName: string;
  clinicName: string;
  price: number;
  city: string;
  category: string;
  sourceUrl: string | null;
  viewedAt: string;
}

interface BookmarkItem {
  id: string;
  serviceName: string;
  clinicName: string;
  price: number;
  city: string;
  category: string;
  sourceUrl: string | null;
  addedAt: string;
}

interface SubscriptionItem {
  id: string;
  serviceName: string;
  clinicName: string;
  date: string;
}

export function History() {
  const { t, i18n } = useTranslation();
  const locale = getLocale(i18n.language);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'recent' | 'bookmarks' | 'subscriptions'>('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [recentHistory, setRecentHistory] = useState<RecentItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      if (activeTab === 'recent') {
        const saved = JSON.parse(localStorage.getItem('med_recent_history') || '[]');
        setRecentHistory(saved);
      } else if (activeTab === 'bookmarks') {
        const saved = JSON.parse(localStorage.getItem('med_bookmarks') || '[]');
        setBookmarks(saved);
      } else if (activeTab === 'subscriptions') {
        const savedIds = JSON.parse(localStorage.getItem('price_subscriptions') || '[]');
        const subDetails = JSON.parse(localStorage.getItem('price_sub_details') || '{}');
        const list = savedIds.map((id: string) => {
          const detail = subDetails[id] || { serviceName: 'Услуга', clinicName: 'Клиника', date: new Date().toLocaleDateString() };
          return { id, ...detail };
        });
        setSubscriptions(list);
      }
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const removeRecentItem = (id: string) => {
    const updated = recentHistory.filter(item => item.id !== id);
    setRecentHistory(updated);
    localStorage.setItem('med_recent_history', JSON.stringify(updated));
  };

  const clearAllRecent = () => {
    setRecentHistory([]);
    localStorage.setItem('med_recent_history', '[]');
  };

  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter(item => item.id !== id);
    setBookmarks(updated);
    localStorage.setItem('med_bookmarks', JSON.stringify(updated));
  };

  const clearAllBookmarks = () => {
    setBookmarks([]);
    localStorage.setItem('med_bookmarks', '[]');
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Только что';
    if (diffMin < 60) return `${diffMin} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;
    return date.toLocaleDateString(locale);
  };

  const renderSkeleton = () => (
    <div className="space-y-3">
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

  const recentCount = recentHistory.length;
  const bookmarkCount = bookmarks.length;
  const subCount = subscriptions.length;

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
          {recentCount > 0 && <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{recentCount}</span>}
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 min-w-[100px] py-2 px-2 text-xs sm:text-sm font-medium rounded-md transition-all text-foreground whitespace-nowrap ${
            activeTab === 'bookmarks' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('history.bookmarks', 'Закладки')}
          {bookmarkCount > 0 && <span className="ml-1.5 text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-full">{bookmarkCount}</span>}
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex-1 min-w-[100px] py-2 px-2 text-xs sm:text-sm font-medium rounded-md transition-all text-foreground whitespace-nowrap ${
            activeTab === 'subscriptions' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('history.subscriptions', 'Подписки')}
          {subCount > 0 && <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{subCount}</span>}
        </button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          renderSkeleton()
        ) : activeTab === 'recent' ? (
          <div className="space-y-3">
            {recentHistory.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={clearAllRecent}
                  className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  Очистить историю
                </button>
              </div>
            )}
            {recentHistory.length === 0 ? (
              <Card className="border-border border-dashed py-12 flex flex-col items-center justify-center text-muted-foreground bg-card/50">
                <ClockIcon className="w-10 h-10 opacity-20 mb-3" />
                <p className="text-sm font-medium">История просмотров пуста</p>
                <p className="text-xs opacity-60 mt-1">Нажмите «Подробнее» на любой услуге в поиске</p>
              </Card>
            ) : (
              recentHistory.map((item) => (
                <Card key={item.id + item.viewedAt} className="border-border shadow-sm hover:shadow-md transition-shadow group bg-card">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <ClockIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">{item.serviceName}</h3>
                        <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                          <span>{item.clinicName}</span>
                          <span className="w-1 h-1 rounded-full bg-border"></span>
                          <span>{item.city}</span>
                          <span className="w-1 h-1 rounded-full bg-border"></span>
                          <span className="font-semibold text-primary">{item.price.toLocaleString(locale)} ₸</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">{formatTimeAgo(item.viewedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-medium rounded-md transition-colors"
                        >
                          Источник <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => removeRecentItem(item.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors rounded-md hover:bg-red-50/50"
                        title="Удалить из истории"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : activeTab === 'bookmarks' ? (
          <div className="space-y-3">
            {bookmarks.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={clearAllBookmarks}
                  className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  Очистить закладки
                </button>
              </div>
            )}
            {bookmarks.length === 0 ? (
              <Card className="border-border border-dashed py-12 flex flex-col items-center justify-center text-muted-foreground bg-card/50">
                <BookmarkIcon className="w-10 h-10 opacity-20 mb-3" />
                <p className="text-sm font-medium">У вас пока нет закладок</p>
                <p className="text-xs opacity-60 mt-1">Нажмите ★ рядом с услугой в поиске, чтобы сохранить</p>
              </Card>
            ) : (
              bookmarks.map((item) => (
                <Card key={item.id} className="border-border shadow-sm hover:shadow-md transition-shadow group bg-card">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <StarIcon className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">{item.serviceName}</h3>
                        <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                          <span>{item.clinicName}</span>
                          <span className="w-1 h-1 rounded-full bg-border"></span>
                          <span>{item.city}</span>
                          <span className="w-1 h-1 rounded-full bg-border"></span>
                          <span className="font-semibold text-primary">{item.price.toLocaleString(locale)} ₸</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">Добавлено: {formatTimeAgo(item.addedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-medium rounded-md transition-colors"
                        >
                          Источник <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => removeBookmark(item.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors rounded-md hover:bg-red-50/50"
                        title="Удалить из закладок"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
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
