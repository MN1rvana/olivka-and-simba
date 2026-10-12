import { useCallback, useEffect, useState } from 'react';
import { parseFilter, searchWithFilter, type PhotoFilter } from '../lib/gallery.ts';

/**
 * The gallery filter, kept in the URL (?cat=simba) so a filtered view can
 * be shared. replaceState, not pushState: changing a filter isn't
 * navigation, so it shouldn't fill the Back button's history.
 */
export function usePhotoFilter(): [PhotoFilter, (filter: PhotoFilter) => void] {
  const [filter, setFilterState] = useState(() => parseFilter(window.location.search));

  useEffect(() => {
    // Back/forward can land on an entry with a different ?cat.
    const syncFromUrl = () => setFilterState(parseFilter(window.location.search));
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  const setFilter = useCallback((next: PhotoFilter) => {
    setFilterState(next);
    const url = new URL(window.location.href);
    url.search = searchWithFilter(url.search, next);
    window.history.replaceState(window.history.state, '', url);
  }, []);

  return [filter, setFilter];
}
