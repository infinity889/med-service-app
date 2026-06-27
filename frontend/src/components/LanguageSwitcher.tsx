import { useTranslation } from 'react-i18next'
import { LanguageIcon } from '@heroicons/react/24/outline'
import { SUPPORTED_LANGUAGES, changeLanguage, type Language } from '@/i18n'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    void changeLanguage(e.target.value as Language)
  }

  return (
    <div className="flex items-center gap-1.5">
      <LanguageIcon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
      <label htmlFor="language-select" className="sr-only">
        {t('header.language')}
      </label>
      <select
        id="language-select"
        value={i18n.language}
        onChange={handleChange}
        className="text-xs font-medium text-foreground bg-background border border-border rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
      >
        {SUPPORTED_LANGUAGES.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
