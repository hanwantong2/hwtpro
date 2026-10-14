class Dashboard {
  constructor(container) {
    this.container = container;
    this.widgets = new Map();
    this._dragId = null;
    this._registry = {
      todo:    (o) => new ToDoWidget(o),
      quote:   (o) => new QuoteWidget(o),
      weather: (o) => new WeatherWidget(o),
      cat:     (o) => new CatWidget(o),
    };
    this._bindDrag();
  }
  register(type, factory) { this._registry[type] = factory; }
  addWidget(type, options = {}) {
    const factory = this._registry[type];
    if (!factory) { console.warn(`Unknown widget type: ${type}`); return null; }
    const opts = {
      ...options,
      onClose: (id) => this.removeWidget(id),
      onMove:  (id, dir) => this.moveWidget(id, dir),
    };
    const widget = factory(opts);
    this.widgets.set(widget.id, widget);
    widget.render(this.container);
    this._updateEmptyHint();
    return widget;
  }
  removeWidget(id) {
    const widget = this.widgets.get(id);
    if (!widget) return;
    widget.destroy();
    this.widgets.delete(id);
    this._updateEmptyHint();
  }
  getWidget(id) { return this.widgets.get(id) || null; }
  clear() {
    for (const id of Array.from(this.widgets.keys())) this.removeWidget(id);
  }
  moveWidget(id, direction) {
    const ids = Array.from(this.widgets.keys());
    const idx = ids.indexOf(id);
    if (idx < 0) return;
    const target = idx + direction;
    if (target < 0 || target >= ids.length) return;
    const a = this.widgets.get(ids[idx]).element;
    const b = this.widgets.get(ids[target]).element;
    if (!a || !b) return;
    const newIds = [...ids];
    [newIds[idx], newIds[target]] = [newIds[target], newIds[idx]];
    const newMap = new Map();
    newIds.forEach(i => newMap.set(i, this.widgets.get(i)));
    this.widgets = newMap;
    const parent = a.parentNode;
    if (a.nextSibling === b) parent.insertBefore(b, a);
    else parent.insertBefore(a, b);
  }
  _bindDrag() {
    const c = this.container;
    c.addEventListener('dragstart', (e) => {
      const w = e.target.closest('.widget');
      if (!w) return;
      this._dragId = w.dataset.widgetId;
      e.dataTransfer.effectAllowed = 'move';
    });
    c.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    c.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.widget');
      if (!target || !this._dragId) { this._dragId = null; return; }
      const targetId = target.dataset.widgetId;
      if (targetId === this._dragId) { this._dragId = null; return; }
      this._reorder(this._dragId, targetId);
      this._dragId = null;
    });
  }
  _reorder(dragId, targetId) {
    const ids = Array.from(this.widgets.keys());
    const fromIdx = ids.indexOf(dragId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, moved);
    const newMap = new Map();
    ids.forEach(i => newMap.set(i, this.widgets.get(i)));
    this.widgets = newMap;
    const dragEl = this.widgets.get(dragId).element;
    const targetEl = this.widgets.get(targetId).element;
    if (toIdx > fromIdx) targetEl.parentNode.insertBefore(dragEl, targetEl.nextSibling);
    else targetEl.parentNode.insertBefore(dragEl, targetEl);
  }
  _updateEmptyHint() {
    const hint = document.getElementById('empty-hint');
    if (hint) hint.hidden = this.widgets.size > 0;
  }
}
if (typeof window !== 'undefined') window.Dashboard = Dashboard;
