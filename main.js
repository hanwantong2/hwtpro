(function () {
  'use strict';
  const dashboardEl = document.getElementById('dashboard');
  if (!dashboardEl) { console.error('Dashboard container #dashboard not found'); return; }
  const dashboard = new Dashboard(dashboardEl);
  window.__dashboard = dashboard;
  const toolbar = document.querySelector('.toolbar');
  if (toolbar) {
    toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'add') {
        dashboard.addWidget(btn.dataset.widget);
      } else if (action === 'clear') {
        if (dashboard.widgets.size === 0) return;
        if (window.confirm('Remove all widgets?')) dashboard.clear();
      }
    });
  }
  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
    const map = { '1': 'todo', '2': 'quote', '3': 'weather', '4': 'cat' };
    if (map[e.key]) { e.preventDefault(); dashboard.addWidget(map[e.key]); }
  });
  dashboard.addWidget('quote');
  dashboard.addWidget('weather');
})();
