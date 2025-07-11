import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import ko from './locales/ko.json';

type MessageSchema = typeof en;

// Get saved language from localStorage or use browser language
const savedLanguage = localStorage.getItem('language');
const browserLanguage = navigator.language.toLowerCase();
const defaultLanguage = savedLanguage || (browserLanguage.startsWith('ko') ? 'ko' : 'en');

const i18n = createI18n<[MessageSchema], 'en' | 'ko'>({
  legacy: false,
  locale: defaultLanguage,
  fallbackLocale: 'en',
  messages: {
    en,
    ko
  }
});

// Save language preference
export function setLanguage(lang: string) {
  i18n.global.locale.value = lang as 'en' | 'ko';
  localStorage.setItem('language', lang);
}

export default i18n;