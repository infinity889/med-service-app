import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ru from './locales/ru.json'
import kk from './locales/kk.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'kk', label: 'Қазақша' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
] as const

export type Language = (typeof SUPPORTED_LANGUAGES)[number]['code']

const STORAGE_KEY = 'medprice-lang'

function getInitialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'kk' || stored === 'ru' || stored === 'en') return stored
  const browserLang = navigator.language.slice(0, 2)
  if (browserLang === 'kk') return 'kk'
  if (browserLang === 'ru') return 'ru'
  return 'ru'
}

export function getLocale(lang?: string): string {
  switch (lang ?? i18n.language) {
    case 'kk':
      return 'kk-KZ'
    case 'en':
      return 'en-US'
    case 'ru':
    default:
      return 'ru-RU'
  }
}

export function changeLanguage(lang: Language) {
  localStorage.setItem(STORAGE_KEY, lang)
  document.documentElement.lang = lang
  return i18n.changeLanguage(lang)
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    kk: { translation: kk },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false,
  },
})

document.documentElement.lang = i18n.language

export default i18n
