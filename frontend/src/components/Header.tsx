import { MagnifyingGlassIcon, BellIcon, ArrowPathIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t } = useTranslation()

  return (
    <header className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-card border-b border-border z-10 shrink-0 gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        <div className="hidden md:block max-w-md w-full relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-border rounded-md leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors shadow-sm"
            placeholder={t('header.quickSearch')}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
        <LanguageSwitcher />

        <div className="hidden sm:flex items-center text-xs font-medium text-muted-foreground bg-background px-3 py-1.5 rounded-full border border-border shadow-sm">
          <ArrowPathIcon className="h-3.5 w-3.5 mr-1.5 shrink-0" />
          <span className="hidden lg:inline">{t('header.lastUpdate', { minutes: 12 })}</span>
          <span className="lg:hidden">12 мин</span>
        </div>

        <button className="p-1.5 rounded-full border border-border bg-background text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-sm">
          <span className="sr-only">{t('header.notifications')}</span>
          <BellIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
