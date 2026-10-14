class QuoteWidget extends UIComponent {
  constructor(options = {}) {
    super({ title: options.title || 'Daily Quote', id: options.id, onClose: options.onClose, onMove: options.onMove });
    this.currentQuote = null;
    this._controller = null;
  }
  onMount() { this.fetchQuote(); }
  async fetchQuote() {
    if (this._controller) { try { this._controller.abort(); } catch (_) {} }
    const controller = this._createAbortController();
    this._controller = controller;
    this.setLoading('Fetching a quote...');
    const sources = [
      { url: 'https://api.quotable.io/random', parse: d => ({ content: d.content, author: d.author }) },
      { url: 'https://dummyjson.com/quotes/random', parse: d => ({ content: d.quote, author: d.author }) },
    ];
    for (const src of sources) {
      if (controller.signal.aborted) return;
      try {
        const res = await fetch(src.url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const quote = src.parse(data);
        if (!quote || !quote.content) throw new Error('Empty data');
        this.currentQuote = quote;
        this._renderQuote();
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
        continue;
      }
    }
    this.currentQuote = this._localFallback();
    this._renderQuote();
  }
  _localFallback() {
    const local = [
      { content: 'Life is like riding a bicycle. To keep your balance, you must keep moving.', author: 'Albert Einstein' },
      { content: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
      { content: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
      { content: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
      { content: 'A journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
    ];
    return local[Math.floor(Math.random() * local.length)];
  }
  _renderQuote() {
    const q = this.currentQuote;
    if (!q) { this.setEmpty('No quote available'); return; }
    const wrap = document.createElement('blockquote');
    wrap.className = 'quote-widget';
    const text = document.createElement('p');
    text.className = 'quote-text';
    text.textContent = `“${q.content}”`;
    const author = document.createElement('cite');
    author.className = 'quote-author';
    author.textContent = `— ${q.author}`;
    const refresh = document.createElement('button');
    refresh.type = 'button';
    refresh.className = 'btn btn-primary btn-sm quote-refresh';
    refresh.textContent = '🔄 New quote';
    this._on(refresh, 'click', () => this.fetchQuote());
    wrap.append(text, author, refresh);
    this.setContent(wrap);
  }
}
if (typeof window !== 'undefined') window.QuoteWidget = QuoteWidget;
