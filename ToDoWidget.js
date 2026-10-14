class ToDoWidget extends UIComponent {
  constructor(options = {}) {
    super({ title: options.title || 'To-Do List', id: options.id, onClose: options.onClose, onMove: options.onMove });
    this.todos = [];
    this._storageKey = `todo_${this.id}`;
    this._load();
  }
  _load() {
    try {
      const raw = localStorage.getItem(this._storageKey);
      if (raw) this.todos = JSON.parse(raw) || [];
    } catch (_) { this.todos = []; }
  }
  _save() {
    try { localStorage.setItem(this._storageKey, JSON.stringify(this.todos)); } catch (_) {}
  }
  onMount() { this._render(); }
  _render() {
    const wrap = document.createElement('div');
    wrap.className = 'todo-widget';
    const form = document.createElement('form');
    form.className = 'todo-form';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'todo-input';
    input.placeholder = 'Type a task, press Enter to add';
    input.setAttribute('aria-label', 'New task');
    input.maxLength = 120;
    const addBtn = document.createElement('button');
    addBtn.type = 'submit';
    addBtn.className = 'btn btn-primary btn-sm';
    addBtn.textContent = 'Add';
    form.append(input, addBtn);
    this._on(form, 'submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (text) { this.addTodo(text); input.value = ''; input.focus(); }
    });
    const list = document.createElement('ul');
    list.className = 'todo-list';
    list.setAttribute('aria-label', 'To-do list');
    if (this.todos.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'todo-empty';
      empty.textContent = 'No tasks yet. Add one above!';
      list.appendChild(empty);
    } else {
      this.todos.forEach(t => list.appendChild(this._renderItem(t)));
    }
    this._on(list, 'click', (e) => {
      const li = e.target.closest('li[data-id]');
      if (!li) return;
      const id = li.dataset.id;
      if (e.target.closest('.todo-remove')) this.removeTodo(id);
      else if (e.target.closest('.todo-toggle')) this.toggleTodo(id);
    });
    const stats = document.createElement('div');
    stats.className = 'todo-stats';
    const done = this.todos.filter(t => t.done).length;
    stats.textContent = `${this.todos.length} total, ${done} done`;
    wrap.append(form, list, stats);
    this.setContent(wrap);
  }
  _renderItem(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' is-done' : '');
    li.dataset.id = todo.id;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'todo-toggle';
    toggle.setAttribute('aria-label', todo.done ? 'Mark as not done' : 'Mark as done');
    toggle.setAttribute('aria-pressed', String(todo.done));
    toggle.innerHTML = todo.done ? '<span aria-hidden="true">☑</span>' : '<span aria-hidden="true">☐</span>';
    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'todo-remove icon-btn';
    remove.setAttribute('aria-label', 'Delete task');
    remove.innerHTML = '<span aria-hidden="true">🗑️</span>';
    li.append(toggle, text, remove);
    return li;
  }
  addTodo(text) {
    this.todos.push({ id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, text, done: false });
    this._save();
    this._render();
  }
  removeTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this._save();
    this._render();
  }
  toggleTodo(id) {
    const t = this.todos.find(t => t.id === id);
    if (t) { t.done = !t.done; this._save(); this._render(); }
  }
}
if (typeof window !== 'undefined') window.ToDoWidget = ToDoWidget;
