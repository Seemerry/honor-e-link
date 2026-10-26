'use strict';

// The requested app is a single static view; its visual controls are decorative.
// All resources are local and no account, API or analytics is used.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(() => navigator.serviceWorker.ready)
      .then(() => { document.documentElement.dataset.offlineReady = 'true'; })
      .catch(error => console.warn('Offline setup failed:', error));
  });
}
