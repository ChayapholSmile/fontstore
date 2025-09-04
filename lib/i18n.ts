import { translations, type Language, type TranslationKey } from "./i18n/translations"

// Simple translation function that can be used without context
export function t(key: TranslationKey, language: Language = "en"): string {
  return translations[language][key] || translations.en[key] || key
}

// Export types for convenience
export type { Language, TranslationKey }
export { translations }
