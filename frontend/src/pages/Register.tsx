import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(name, email, password, city);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to register', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative">
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        {t('auth.back', 'Назад')}
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="w-12 h-12 mx-auto rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-primary-foreground font-bold text-2xl leading-none">M</span>
        </div>
        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {t('auth.registerTitle', 'Создать аккаунт')}
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {t('auth.alreadyHaveAccount', 'Уже есть аккаунт?')} &nbsp;
          <Link to="/login" className="font-medium text-primary hover:text-primary/90 transition-colors">
            {t('auth.loginLink', 'Войти')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-card py-8 px-4 shadow-xl shadow-black/5 sm:rounded-2xl sm:px-10 border border-border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                {t('auth.fullName', 'Имя и Фамилия')}
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                {t('auth.email', 'Email адрес')}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-foreground">
                {t('auth.city', 'Город (необязательно)')}
              </label>
              <div className="mt-1">
                <select
                  id="city"
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-background text-foreground shadow-sm"
                >
                  <option value="">{t('auth.selectCity', 'Выберите город')}</option>
                  <option value="Астана">Астана</option>
                  <option value="Алматы">Алматы</option>
                  <option value="Шымкент">Шымкент</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                {t('auth.password', 'Пароль')}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary focus:ring-primary border-border rounded bg-background"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-muted-foreground">
                {t('auth.agreeTerms', 'Я согласен с условиями использования')}
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? t('auth.registering', 'Регистрация...') : t('auth.registerBtn', 'Зарегистрироваться')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
