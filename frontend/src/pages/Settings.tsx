import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircleIcon, BellAlertIcon, GlobeAltIcon, MapPinIcon } from '@heroicons/react/24/outline';

export function Settings() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.city || 'Астана');
  const [language, setLanguage] = useState(i18n.language);
  const [notifications, setNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate save delay
    setTimeout(() => {
      i18n.changeLanguage(language);
      setIsSaving(false);
      // alert('Settings saved successfully');
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">{t('settings.title', 'Настройки')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle', 'Управление профилем и предпочтениями приложения')}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="bg-card border-b border-border">
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-medium">{t('settings.profile', 'Профиль')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('settings.fullName', 'Имя и Фамилия')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary shadow-sm bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('settings.email', 'Email')}</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-border rounded-md bg-muted text-muted-foreground shadow-sm cursor-not-allowed"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="bg-card border-b border-border">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-medium">{t('settings.location', 'Локация')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2 max-w-md">
              <label className="text-sm font-medium text-foreground">{t('settings.defaultCity', 'Город по умолчанию')}</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary shadow-sm bg-background text-foreground"
              >
                <option value="Астана">Астана</option>
                <option value="Алматы">Алматы</option>
                <option value="Шымкент">Шымкент</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="bg-card border-b border-border">
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-medium">{t('settings.preferences', 'Предпочтения')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2 max-w-md">
              <label className="text-sm font-medium text-foreground">{t('settings.language', 'Язык интерфейса')}</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary shadow-sm bg-background text-foreground"
              >
                <option value="ru">Русский</option>
                <option value="kk">Қазақша</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2 max-w-md">
              <div className="flex items-center space-x-2">
                <BellAlertIcon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{t('settings.notifications', 'Уведомления')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.notificationsDesc', 'Получать оповещения о снижении цен')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifications(!notifications)}
                className={`${
                  notifications ? 'bg-primary' : 'bg-muted border border-border'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out`}
              >
                <span
                  aria-hidden="true"
                  className={`${
                    notifications ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all shadow-sm"
          >
            {isSaving ? t('settings.saving', 'Сохранение...') : t('settings.saveBtn', 'Сохранить изменения')}
          </button>
        </div>
      </form>
    </div>
  );
}
