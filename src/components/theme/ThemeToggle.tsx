import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

import { Button } from '../ui/button';

type Theme = 'light' | 'dark';

const THEME_KEY = 'siga-theme-v2';
const LEGACY_THEME_KEY = 'siga-theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_KEY);

    if (!stored) {
      localStorage.removeItem(LEGACY_THEME_KEY);
      document.documentElement.classList.remove('dark');
      return 'light';
    }

    return stored === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const dark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={dark ? 'Modo claro' : 'Modo escuro'}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
