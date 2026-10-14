class CatWidget extends UIComponent {
  constructor(options = {}) {
    super({ title: options.title || 'Cat Gallery', id: options.id, onClose: options.onClose, onMove: options.onMove });
    this.current = null;
    this._controller = null;
  }
  onMount() { this.fetchCat(); }
  async fetchCat() {
    if (this._controller) { try { this._controller.abort(); } catch (_) {} }
    const controller = this._createAbortController();
    this._controller = controller;
    this.setLoading('Summoning a cat...');
    try {
      const res = await fetch('https://api.thecatapi.com/v1/images/search', { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) throw new Error('Empty data');
      this.current = data[0];
      this._renderCat();
    } catch (err) {
      if (err.name === 'AbortError') return;
      this.setError('The cat got lost. Please try again later.');
    }
  }
  _renderCat() {
    const c = this.current;
    if (!c || !c.url) { this.setEmpty('No cat image available'); return; }
    const wrap = document.createElement('div');
    wrap.className = 'cat-widget';
    const img = document.createElement('img');
    img.className = 'cat-image';
    img.src = c.url;
    img.alt = 'Random cat image';
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    const refresh = document.createElement('button');
    refresh.type = 'button';
    refresh.className = 'btn btn-primary btn-sm';
    refresh.textContent = '🔄 Another cat';
    this._on(refresh, 'click', () => this.fetchCat());
    wrap.append(img, refresh);
    this.setContent(wrap);
  }
}
if (typeof window !== 'undefined') window.CatWidget = CatWidget;
