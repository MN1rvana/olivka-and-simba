import { useCallback, useSyncExternalStore } from 'react';
import { parseFilter, searchWithFilter, type PhotoFilter } from '../lib/gallery.ts';

// history.replaceState fires no event, so the hook announces its own changes.
const FILTER_CHANGE = 'photo-filter-change';

function subscribe(onChange: () => void) {
  // Back/forward can land on an entry with a different ?cat.
  window.addEventListener('popstate', onChange);
  window.addEventListener(FILTER_CHANGE, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(FILTER_CHANGE, onChange);
  };
}

const getSearch = () => window.location.search;
// The static HTML is built without a URL, so it always shows all photos.
const getServerSearch = () => '';

/**
 * The gallery filter, kept in the URL (?cat=simba) so a filtered view can
 * be shared.
 *
 * useSyncExternalStore treats the URL as the store. During hydration React
 * uses the server value (''), so the HTML matches. Straight after, it
 * re-renders with the real ?cat, so there's no hydration mismatch.
 *
 * replaceState, not pushState: changing a filter isn't navigation, so it
 * shouldn't fill the Back button's history. Next.js picks up native
 * replaceState calls too, and passing history.state through keeps its
 * router state.
 */
export function usePhotoFilter(): [PhotoFilter, (filter: PhotoFilter) => void] {
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);

  const setFilter = useCallback((next: PhotoFilter) => {
    const url = new URL(window.location.href);
    url.search = searchWithFilter(url.search, next);
    window.history.replaceState(window.history.state, '', url);
    window.dispatchEvent(new Event(FILTER_CHANGE));
  }, []);

  return [parseFilter(search), setFilter];
}
