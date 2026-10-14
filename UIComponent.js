class UIComponent {
  constructor({ title = 'Widget', id = null, onClose = null, onMove = null } = {}) {
    this.title = title;
    this.id = id || `w-${UIComponent._uid()}`;
    this.onClose = onClose;
    this.onMove = onMove;
    this.isDestroyed = false;
    this.isMinimized = false;
    this._abortControllers = [];
    this._timers = [];
    this._listeners = [];
    this.element = null;
    this._bodyEl = null;
    this._minBtn = null;
    this._buildSkeleton();
  }
  static _uid() {
    UIComponent._counter = (UIComponent._counter || 0) + 1;
    return `${Date.now().toString(36)}-${UIComponent._counter}`;
  }
  _buildSkeleton() {
    const el = document.createElement('article');
    el.className = 'widget';
    el.dataset.widgetId = this.id;
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', this.title);
    el.draggable = true;
    const header = document.createElement('header');
    header.className = 'widget-header';
    const titleEl = document.createElement('h2');
    titleEl.className = 'widget-title';
    titleEl.textContent = this.title;
    const actions = document.createElement('div');
    actions.className = 'widget-actions';
    const upBtn = this._iconBtn('Move up', '↑', () => this.onMove && this.onMove(this.id, -1));
    const downBtn = this._iconBtn('Move down', '↓', () => this.onMove && this.onMove(this.id, 1));
    const minBtn = this._iconBtn('Minimize', '▾', () => this.toggleMinimize());
    const closeBtn = this._iconBtn('Close', '✕', () => this._handleClose());
    closeBtn.classList.add('icon-btn-danger');
    actions.append(upBtn, downBtn, minBtn, closeBtn);
    header.append(titleEl, actions);
    const body = document.createElement('div');
    body.className = 'widget-body';
    el.append(header, body);
    this.element = el;
    this._bodyEl = body;
    this._minBtn = minBtn;
  }
  _iconBtn(label, glyph, onClick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'icon-btn';
    b.setAttribute('aria-label', label);
    b.innerHTML = `<span aria-hidden="true">${glyph}</span>`;
    this._on(b, 'click', onClick);
    return b;
  }
  _handleClose() {
    if (this.onClose) this.onClose(this.id);
    else this.destroy();
  }
  _on(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    this._listeners.push({ target, type, handler, options });
  }
  _setTimeout(fn, ms) {
    const t = setTimeout(fn, ms);
    this._timers.push(t);
    return t;
  }
  _setInterval(fn, ms) {
    const t = setInterval(fn, ms);
    this._timers.push(t);
    return t;
  }
  _createAbortController() {
    const ac = new AbortController();
    this._abortControllers.push(ac);
    return ac;
  }
  render(container) {
    if (this.isDestroyed) return;
    container.appendChild(this.element);
    this.onMount();
  }
  onMount() {}
  toggleMinimize() {
    if (this.isDestroyed) return;
    this.isMinimized = !this.isMinimized;
    this.element.classList.toggle('is-minimized', this.isMinimized);
    this._minBtn.setAttribute('aria-label', this.isMinimized ? 'Expand' : 'Minimize');
    this._minBtn.querySelector('span').textContent = this.isMinimized ? '▸' : '▾';
  }
  _clearBody() {
    while (this._bodyEl.firstChild) this._bodyEl.removeChild(this._bodyEl.firstChild);
  }
  setLoading(message = 'Loading...') {
    this._clearBody();
    const wrap = document.createElement('div');
    wrap.className = 'widget-state state-loading';
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    spinner.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span');
    text.className = 'state-text';
    text.textContent = message;
    wrap.append(spinner, text);
    this._bodyEl.appendChild(wrap);
  }
  setError(message = 'Failed to load') {
    this._clearBody();
    const wrap = document.createElement('div');
    wrap.className = 'widget-state state-error';
    wrap.setAttribute('role', 'alert');
    const icon = document.createElement('span');
    icon.className = 'state-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '⚠️';
    const text = document.createElement('span');
    text.className = 'state-text';
    text.textContent = message;
    wrap.append(icon, text);
    this._bodyEl.appendChild(wrap);
  }
  setEmpty(message = 'No data') {
    this._clearBody();
    const wrap = document.createElement('div');
    wrap.className = 'widget-state state-empty';
    const text = document.createElement('span');
    text.className = 'state-text';
    text.textContent = message;
    wrap.appendChild(text);
    this._bodyEl.appendChild(wrap);
  }
  setContent(node) {
    this._clearBody();
    if (node) this._bodyEl.appendChild(node);
  }
  destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this._abortControllers.forEach(ac => { try { ac.abort(); } catch (_) {} });
    this._abortControllers = [];
    this._timers.forEach(t => clearTimeout(t));
    this._timers = [];
    this._listeners.forEach(({ target, type, handler, options }) => {
      try { target.removeEventListener(type, handler, options); } catch (_) {}
    });
    this._listeners = [];
    if (this.element && this.element.parentNode) this.element.parentNode.removeChild(this.element);
    this.element = null;
    this._bodyEl = null;
    this._minBtn = null;
  }
}
if (typeof window !== 'undefined') window.UIComponent = UIComponent;
