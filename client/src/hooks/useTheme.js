import { useEffect, useState } from 'react';

const KEY = 'ssms-theme';

const readTheme = () => {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

// Bootstrap 5.3: <html data-bs-theme="dark">. Fakt theme (light/dark) save thay chhe,
// koi token ke secret nahi, etle localStorage ma chale.
export default function useTheme() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // storage block hoy to pan theme chale
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
}