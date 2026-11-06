import { useEffect, useState } from 'react';

// Search box ma darek akshar par API call na thay, 0.4 second rahi ne j thay
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}