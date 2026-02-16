(function () {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

  const nativeMatchMedia = window.matchMedia.bind(window);
  const targetQuery = '(max-width: 520px) and (orientation: portrait)';

  const normalize = (q) => String(q || '').replace(/\s+/g, ' ').trim().toLowerCase();

  const isTouchTabletInPortrait = () => {
    const portrait = nativeMatchMedia('(orientation: portrait)').matches;
    if (!portrait) return false;

    const hasTouch = (navigator.maxTouchPoints || 0) > 0;
    const coarse = nativeMatchMedia('(pointer: coarse)').matches || nativeMatchMedia('(any-pointer: coarse)').matches;
    const tabletLike = Math.max(window.innerWidth || 0, window.innerHeight || 0) >= 900;
    const uaTablet = /ipad|android/i.test(navigator.userAgent || '');

    return (hasTouch || coarse) && (tabletLike || uaTablet);
  };

  const createForcedMql = (query) => {
    const listeners = new Set();

    const getMatches = () => nativeMatchMedia(query).matches || isTouchTabletInPortrait();

    const notify = () => {
      const event = { matches: getMatches(), media: query };
      listeners.forEach((cb) => {
        try {
          cb(event);
        } catch (_) {
          // no-op
        }
      });
    };

    const onViewportChange = () => notify();
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('orientationchange', onViewportChange);

    return {
      get matches() {
        return getMatches();
      },
      media: query,
      onchange: null,
      addListener(cb) {
        if (typeof cb === 'function') listeners.add(cb);
      },
      removeListener(cb) {
        listeners.delete(cb);
      },
      addEventListener(type, cb) {
        if (type === 'change' && typeof cb === 'function') listeners.add(cb);
      },
      removeEventListener(type, cb) {
        if (type === 'change') listeners.delete(cb);
      },
      dispatchEvent() {
        return true;
      },
    };
  };

  window.matchMedia = function patchedMatchMedia(query) {
    if (normalize(query) === normalize(targetQuery)) {
      return createForcedMql(query);
    }
    return nativeMatchMedia(query);
  };
})();
