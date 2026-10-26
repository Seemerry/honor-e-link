'use strict';

const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];
const pager = document.querySelector('#team-pager');
const track = document.querySelector('#panel-track');
const views = {
  teams: document.querySelector('#teams-view'),
  search: document.querySelector('#search-view'),
  friends: document.querySelector('#friends-view')
};
const query = document.querySelector('#team-query');
const results = document.querySelector('#team-results');
const noResults = document.querySelector('#no-results');
let selectedTab = 1;
let currentView = 'teams';
let gesture = null;
let lastTrigger = null;

function selectTab(index, focus = false) {
  selectedTab = Math.max(0, Math.min(tabs.length - 1, index));
  track.style.setProperty('--panel-index', selectedTab);
  track.style.removeProperty('--drag-x');
  track.classList.remove('dragging');
  tabs.forEach((tab, i) => {
    const active = i === selectedTab;
    tab.classList.toggle('selected', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    panels[i].inert = !active;
    panels[i].setAttribute('aria-hidden', String(!active));
  });
  if (focus) tabs[selectedTab].focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(index));
  tab.addEventListener('keydown', event => {
    const destination = { ArrowLeft: selectedTab - 1, ArrowRight: selectedTab + 1, Home: 0, End: tabs.length - 1 }[event.key];
    if (destination !== undefined) {
      event.preventDefault();
      selectTab(destination, true);
    }
  });
});

// Keep vertical scrolling/pinch zoom native. Only a deliberate horizontal drag
// changes tabs; an interrupted gesture always snaps back to the selected page.
pager.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0 || event.target.closest('button, a, input')) return;
  gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, started: performance.now(), horizontal: false, vertical: false };
  pager.setPointerCapture(event.pointerId);
});

pager.addEventListener('pointermove', event => {
  if (!gesture || gesture.id !== event.pointerId || gesture.vertical) return;
  const dx = event.clientX - gesture.x;
  const dy = event.clientY - gesture.y;
  if (!gesture.horizontal) {
    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
      gesture.vertical = true;
      return;
    }
    if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    gesture.horizontal = true;
    track.classList.add('dragging');
  }
  gesture.dx = dx;
  const atEdge = (selectedTab === 0 && dx > 0) || (selectedTab === tabs.length - 1 && dx < 0);
  track.style.setProperty('--drag-x', `${atEdge ? dx * 0.18 : dx}px`);
});

function endGesture(event, cancelled = false) {
  if (!gesture || gesture.id !== event.pointerId) return;
  const { dx, started, horizontal } = gesture;
  gesture = null;
  const fastSwipe = Math.abs(dx) > 25 && Math.abs(dx) / Math.max(1, performance.now() - started) > 0.45;
  const longSwipe = Math.abs(dx) > Math.min(72, pager.clientWidth * 0.22);
  const direction = !cancelled && horizontal && (fastSwipe || longSwipe) ? (dx > 0 ? -1 : 1) : 0;
  selectTab(selectedTab + direction);
  if (pager.hasPointerCapture(event.pointerId)) pager.releasePointerCapture(event.pointerId);
}
pager.addEventListener('pointerup', event => endGesture(event));
pager.addEventListener('pointercancel', event => endGesture(event, true));
pager.addEventListener('lostpointercapture', event => endGesture(event, true));

// Search only the team already present in this personal, offline app.
const sourceRow = document.querySelector('#joined-panel .team-row');
const resultButton = document.createElement('button');
resultButton.type = 'button';
resultButton.className = 'team-row team-result';
resultButton.append(...[...sourceRow.children].map(child => child.cloneNode(true)));
resultButton.setAttribute('aria-label', '查看荣耀终端有限公司');
results.append(resultButton);
const teamName = sourceRow.querySelector('.team-name').textContent;

function filterTeams() {
  const keyword = query.value.trim().normalize('NFKC').toLocaleLowerCase();
  const found = teamName.normalize('NFKC').toLocaleLowerCase().includes(keyword);
  resultButton.hidden = !found;
  noResults.hidden = found;
}
query.addEventListener('input', filterTeams);
document.querySelector('#team-search-form').addEventListener('submit', event => {
  event.preventDefault();
  filterTeams();
  query.blur();
});

function viewFromLocation() {
  return ({ '#search': 'search', '#friends': 'friends' })[location.hash] || 'teams';
}

function showView(view, focus = false) {
  currentView = view;
  Object.entries(views).forEach(([name, element]) => { element.hidden = name !== view; });
  if (view === 'search') {
    filterTeams();
    if (focus) query.focus();
  } else if (view === 'teams' && focus && lastTrigger) {
    lastTrigger.focus({ preventScroll: true });
  }
}

function openView(view, trigger) {
  lastTrigger = trigger;
  if (view === 'search') query.value = '';
  history.pushState({ honorView: view, fromTeams: true }, '', `#${view}`);
  showView(view, true);
}

function closeView() {
  if (history.state?.fromTeams) {
    history.back();
  } else {
    history.replaceState({ honorView: 'teams', fromTeams: false }, '', location.pathname + location.search);
    showView('teams', true);
  }
}

document.querySelector('#open-search').addEventListener('click', event => openView('search', event.currentTarget));
document.querySelector('#open-friends').addEventListener('click', event => openView('friends', event.currentTarget));
document.querySelectorAll('.close-view').forEach(button => button.addEventListener('click', closeView));
resultButton.addEventListener('click', () => { selectTab(1); closeView(); });
window.addEventListener('popstate', () => showView(viewFromLocation(), true));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && currentView !== 'teams') closeView();
});

// The requested add-friend screen is a visual mockup with an editable field.
// It neither saves accounts nor sends a friend request to any service.
const initialView = viewFromLocation();
history.replaceState({ honorView: initialView, fromTeams: false }, '', location.href);
showView(initialView);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' })
      .then(registration => {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') registration.update().catch(() => {});
        });
        return navigator.serviceWorker.ready;
      })
      .then(() => { document.documentElement.dataset.offlineReady = 'true'; })
      .catch(error => console.warn('Offline setup failed:', error));
  });
}
