import { useEffect } from 'react';
import i18n, { SUPPORTED_LANGUAGES, type SupportedLanguage } from './index';
import { useAppSelector } from '@redux/hooks';

/** Keeps i18next's active language in sync with the user's stored preference (settings.language). */
const I18nSync: React.FC = () => {
  const language = useAppSelector((state) => state.settings.language);

  useEffect(() => {
    const next: SupportedLanguage = (SUPPORTED_LANGUAGES as readonly string[]).includes(language)
      ? (language as SupportedLanguage)
      : 'en';
    if (i18n.language !== next) void i18n.changeLanguage(next);
  }, [language]);

  return null;
};

export default I18nSync;
