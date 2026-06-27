import { NavLink, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  InboxIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navigation = [
    { nameKey: 'nav.dashboard', href: '/dashboard', icon: HomeIcon },
    { nameKey: 'nav.search', href: '/search', icon: MagnifyingGlassIcon },
    { nameKey: 'nav.clinics', href: '/clinics', icon: BuildingOfficeIcon },
    { nameKey: 'nav.services', href: '/services', icon: ClipboardDocumentListIcon },
    { nameKey: 'nav.priceComparison', href: '/compare', icon: CurrencyDollarIcon },
    { nameKey: 'nav.history', href: '/history', icon: ClockIcon },
    { nameKey: 'nav.statistics', href: '/statistics', icon: ChartBarIcon },
    ...(user?.role === 'admin' ? [{ nameKey: 'nav.moderator', href: '/moderator', icon: InboxIcon }] : []),
  ]

  const handleNavClick = () => {
    onClose?.()
  }

  const sidebarContent = (
    <>
      <div className="p-4 lg:p-6 flex items-center justify-between">
        <Link to="/" onClick={handleNavClick} className="flex items-center space-x-3 hover:opacity-80 transition-opacity min-w-0">
          <img src="/logo.png" alt="MedPrice.kz" className="w-8 h-8 object-contain rounded-md shrink-0" />
          <span className="font-bold text-foreground text-lg tracking-tight truncate">MedPrice.kz</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 lg:px-4 space-y-1 overflow-y-auto mt-1">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          {t('nav.overview')}
        </div>
        {navigation.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />
            {t(item.nameKey)}
          </NavLink>
        ))}

        {user && (
          <div className="mt-8 pt-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
              {t('nav.system')}
            </div>
            <NavLink
              to="/settings"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Cog6ToothIcon className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />
              {t('nav.settings')}
            </NavLink>
          </div>
        )}
      </nav>

      <div className="p-3 lg:p-4 border-t border-border m-3 lg:m-4 rounded-xl bg-background border flex-shrink-0">
        {user ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-sm font-bold shrink-0">
                {user.avatar || user.name.charAt(0)}
              </div>
              <div className="ml-3 overflow-hidden flex-1">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); onClose?.() }}
              className="flex items-center w-full justify-center px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-1.5" />
              {t('auth.logout', 'Выйти')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => { navigate('/login'); onClose?.() }}
            className="w-full flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
          >
            {t('auth.login', 'Войти')}
          </button>
        )}
      </div>
    </>
  )

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          w-64 max-w-[85vw] bg-card flex flex-col h-full border-r border-border
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto lg:max-w-none shrink-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
