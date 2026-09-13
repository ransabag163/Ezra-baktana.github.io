'use strict';
/* Where a fresh page load should start.
   The browser's own scroll restoration runs before the images have height, so on
   a reload it clamps the saved position to a page that is still short and drops
   the reader into the middle of a section. Restoration is therefore switched off
   and the destination is decided here: the top of the page, or the section named
   in the URL. A reader who has already started scrolling is never overruled. */
(() => {
  if (!('scrollRestoration' in history)) return;
  history.scrollRestoration = 'manual';

  let touched = false;
  const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  const stop = () => events.forEach(name => removeEventListener(name, mark));
  function mark() { touched = true; stop(); }
  events.forEach(name => addEventListener(name, mark, {passive: true}));

  const target = () => (location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null);
  function place() {
    if (touched) return;
    const node = target();
    if (location.hash && !node) return;
    if (node) node.scrollIntoView({block: 'start', behavior: 'instant'});
    else scrollTo(0, 0);
  }

  place();
  addEventListener('DOMContentLoaded', place);
  addEventListener('load', () => { place(); stop(); }, {once: true});
})();
