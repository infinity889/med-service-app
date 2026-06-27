import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  ScaleIcon, 
  PresentationChartLineIcon, 
  ArrowTrendingDownIcon, 
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const REVIEWS = [
  {
    name: 'Асель К.',
    role: 'Молодая мама (Алматы)',
    avatar: 'A',
    rating: 5,
    text: 'Нужно было сдать развернутый комплекс анализов ребенку. В одной лаборатории насчитали 34 000 ₸. Благодаря MedPrice нашла тот же перечень в KDL за 21 500 ₸. Сэкономила кучу денег на ровном месте!',
    saved: 'Сэкономила 12 500 ₸'
  },
  {
    name: 'Данияр С.',
    role: 'Спортсмен (Астана)',
    avatar: 'Д',
    rating: 5,
    text: 'Постоянно сдаю анализы на гормоны и показатели крови для контроля формы. Этот сервис — просто находка. Не нужно открывать 5 сайтов и искать прайсы в PDF. Всё на одном экране с графиками цен.',
    saved: 'Сэкономил 8 200 ₸ / мес'
  },
  {
    name: 'Галина Ивановна',
    role: 'Пенсионерка (Шымкент)',
    avatar: 'Г',
    rating: 5,
    text: 'Сын помог разобраться с поиском МРТ суставов. Нашли отличную клинику с хорошим рейтингом и ценой на 15% дешевле, чем нам советовали в поликлинике. Очень полезный сайт для пожилых людей.',
    saved: 'Сэкономила 14 000 ₸'
  }
];

const FEATURES = [
  {
    name: 'Сравнение цен в реальном времени',
    description: 'Мы анализируем и сопоставляем прайс-листы крупнейших лабораторий и клиник Казахстана за секунды.',
    icon: ScaleIcon,
    color: 'from-orange-500 to-red-500'
  },
  {
    name: 'Интерактивные графики и аналитика',
    description: 'Следите за средними ценами в разных городах (Алматы, Астана, Шымкент) и выбирайте лучшее время для обследования.',
    icon: PresentationChartLineIcon,
    color: 'from-blue-500 to-indigo-500'
  },
  {
    name: 'Умный поиск синонимов',
    description: 'Наша система понимает медицинские синонимы. Ищите «ОАК», «CBC» или «общий анализ крови» — результат будет точным.',
    icon: MagnifyingGlassIcon,
    color: 'from-green-500 to-emerald-500'
  },
  {
    name: 'Выгода до 40%',
    description: 'Цены на одни и те же медицинские услуги могут отличаться в разы. Находите самые доступные предложения мгновенно.',
    icon: ArrowTrendingDownIcon,
    color: 'from-purple-500 to-pink-500'
  }
];

const FAQS = [
  {
    q: 'Откуда берутся цены на услуги?',
    a: 'Данные собираются автоматическими скрейперами напрямую с официальных сайтов медицинских клиник и лабораторий (КДЛ Олимп, Инвитро, Doq.kz и др.).'
  },
  {
    q: 'Как часто обновляется информация?',
    a: 'Мы стараемся ежедневно проверять прайс-листы поставщиков услуг на предмет изменений, чтобы вы видели только актуальную стоимость.'
  },
  {
    q: 'Использование сервиса бесплатное?',
    a: 'Да, MedPrice.kz абсолютно бесплатен для пациентов. Наша цель — сделать медицинские услуги прозрачными и доступными.'
  }
];

export function Landing() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans select-none overflow-x-hidden">
      {/* Landing Navbar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <img src="/logo.png" alt="MedPrice.kz" className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-md shrink-0" />
            <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text truncate">
              MedPrice<span className="text-primary">.kz</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
            <a href="#about" className="hover:text-primary transition-colors">О сервисе</a>
            <a href="#features" className="hover:text-primary transition-colors">Преимущества</a>
            <a href="#reviews" className="hover:text-primary transition-colors">Отзывы</a>
            <a href="#faq" className="hover:text-primary transition-colors">Вопросы</a>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <div className="hidden sm:flex items-center space-x-4">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-xl transition-all shadow-sm shadow-primary/10 flex items-center space-x-2"
                >
                  <span>Личный кабинет</span>
                  <span>→</span>
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-sm font-medium hover:text-primary transition-colors px-3 py-2 text-foreground"
                  >
                    Войти
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-xl transition-all shadow-sm shadow-primary/10"
                  >
                    Зарегистрироваться
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col space-y-1">
              <a href="#about" onClick={closeMobileMenu} className="px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors">О сервисе</a>
              <a href="#features" onClick={closeMobileMenu} className="px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors">Преимущества</a>
              <a href="#reviews" onClick={closeMobileMenu} className="px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors">Отзывы</a>
              <a href="#faq" onClick={closeMobileMenu} className="px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors">Вопросы</a>
              <div className="pt-3 mt-2 border-t border-border flex flex-col gap-2">
                {user ? (
                  <Link to="/dashboard" onClick={closeMobileMenu} className="w-full text-center px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl">
                    Личный кабинет
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={closeMobileMenu} className="w-full text-center px-5 py-2.5 border border-border text-sm font-medium rounded-xl">
                      Войти
                    </Link>
                    <Link to="/register" onClick={closeMobileMenu} className="w-full text-center px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl">
                      Зарегистрироваться
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="about" className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 lg:pt-32 lg:pb-36 bg-gradient-to-b from-primary/5 via-transparent to-transparent overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center space-y-6 sm:space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wide">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Умный мониторинг цен</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl leading-[1.1] text-foreground">
            Сравнивайте цены на анализы и МРТ в <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">Казахстане</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            MedPrice.kz помогает находить самые выгодные предложения лабораторий и клиник в вашем городе. Экономьте время и деньги на диагностике.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              to="/dashboard" 
              className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl transition-all shadow-lg shadow-primary/20 text-center"
            >
              Начать поиск цен
            </Link>
            <a 
              href="#features" 
              className="px-8 py-4 border border-border bg-card hover:bg-muted/50 text-foreground font-semibold rounded-2xl transition-all text-center"
            >
              Узнать больше
            </a>
          </div>

          {/* Interactive Preview Dashboard Widget */}
          <div className="w-full max-w-4xl mt-8 sm:mt-12 border border-border rounded-2xl bg-card shadow-2xl p-4 sm:p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">demo.medprice.kz</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-xl border border-border bg-background">
                <div className="text-xs text-muted-foreground uppercase font-semibold">Общий анализ крови (ОАК)</div>
                <div className="text-lg font-bold text-foreground mt-2">2 500 ₸ <span className="text-xs text-muted-foreground font-normal">в KDL Olymp</span></div>
                <div className="text-xs text-green-500 font-medium mt-1">Лучшая цена в Астане</div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-background">
                <div className="text-xs text-muted-foreground uppercase font-semibold">МРТ головного мозга</div>
                <div className="text-lg font-bold text-foreground mt-2">18 000 ₸ <span className="text-xs text-muted-foreground font-normal">в Orhun Medical</span></div>
                <div className="text-xs text-primary font-medium mt-1">Скидка 15% на этой неделе</div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-background">
                <div className="text-xs text-muted-foreground uppercase font-semibold">Прием терапевта</div>
                <div className="text-lg font-bold text-foreground mt-2">5 000 ₸ <span className="text-xs text-muted-foreground font-normal">в Emirmed</span></div>
                <div className="text-xs text-green-500 font-medium mt-1">Рейтинг клиники 4.7 ★</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-24 bg-card border-y border-border relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Почему выбирают MedPrice</h2>
            <p className="text-muted-foreground">Современный и быстрый агрегатор для осознанного управления расходами на здоровье.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURES.map(f => (
              <div key={f.name} className="p-5 sm:p-8 rounded-2xl border border-border bg-background hover:border-primary/30 hover:shadow-md transition-all flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
                <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-tr ${f.color} flex items-center justify-center text-white shadow-md`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">{f.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials/Reviews Section */}
      <section id="reviews" className="py-12 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-1.5 text-primary text-sm font-semibold uppercase tracking-wider">
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span>Реальные отзывы</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Истории наших пользователей</h2>
            <p className="text-muted-foreground">Узнайте, как люди экономят на анализах и медицинском обслуживании с помощью нашего сервиса.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {REVIEWS.map(r => (
              <div key={r.name} className="p-6 rounded-2xl border border-border bg-card flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-center space-x-1 text-orange-400">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <span key={i} className="text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "{r.text}"
                  </p>
                </div>
                <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                      {r.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{r.name}</h4>
                      <p className="text-xs text-muted-foreground">{r.role}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                    {r.saved}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 sm:py-24 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Часто задаваемые вопросы</h2>
            <p className="text-muted-foreground">Ответы на популярные вопросы о работе агрегатора цен.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FAQS.map(faq => (
              <div key={faq.q} className="space-y-3 bg-background p-6 rounded-2xl border border-border">
                <h3 className="font-semibold text-lg text-foreground">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-primary/10 to-orange-400/5 relative overflow-hidden border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8 relative">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Готовы сэкономить на медицинских услугах?
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
            Создайте аккаунт, чтобы сохранять свои любимые клиники, отслеживать историю поисков и получать уведомления о снижении цен.
          </p>
          <div className="pt-2">
            <Link 
              to="/register" 
              className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl transition-all shadow-lg shadow-primary/20 inline-block"
            >
              Начать бесплатно
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-bold text-sm shadow">
              M
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">
              MedPrice<span className="text-primary">.kz</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MedPrice.kz. Все права защищены. Разработано для заботы о вашем бюджете.
          </p>
          <div className="flex space-x-6 text-xs text-muted-foreground">
            <a href="#about" className="hover:text-primary transition-colors">О нас</a>
            <a href="#faq" className="hover:text-primary transition-colors">Помощь</a>
            <Link to="/login" className="hover:text-primary transition-colors">Вход</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
