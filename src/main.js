import './style.css';
import { supabase } from './supabase.js';

const app = document.querySelector('#app');
const statuses = { todo: 'To do', in_progress: 'In progress', done: 'Done' };
let session = null;
let tasks = [];
let filter = 'all';
let search = '';
let generation = 0;
let loading = false;
let loadError = '';
let initialized = false;
const pendingStatuses = new Map();
const escape = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const brand = '<a class="brand" href="/" aria-label="Task Tracker home"><span class="brand-icon" aria-hidden="true">✓</span> Task Tracker<span class="tag">ED1</span></a>';

function message(text, error = false) {
  const el = document.querySelector('#notice');
  if (!el) return;
  el.textContent = text;
  el.className = `notice ${error ? 'error' : 'success'}`;
  el.hidden = !text;
}

function errorText(error) {
  if (/fetch|network/i.test(error?.message || '')) return 'Could not connect. Check your internet connection and try again.';
  return error?.message || 'Something went wrong. Please try again.';
}

function authView(mode = 'login', email = '') {
  const signup = mode === 'signup';
  app.innerHTML = `<header>${brand}<span class="header-note">A little structure. Real progress.</span></header>
    <main class="auth-layout">
      <section class="intro"><p class="eyebrow">YOUR ENGINEERING WORKSPACE</p><h1>Big ideas.<br>Clear next steps.</h1>
      <p class="intro-copy">Make room for the work that matters. Keep your project tasks organized, track your progress, and move your next idea forward.</p>
      <div class="roadmap" aria-label="Task workflow"><span><i class="dot todo"></i>To do</span><b>→</b><span><i class="dot in_progress"></i>In progress</span><b>→</b><span><i class="dot done"></i>Done</span></div>
      <p class="intro-foot">BUILT FOR ENGINEERING DESIGN 1</p></section>
      <section class="auth-card" aria-labelledby="auth-heading"><p class="eyebrow">LET’S GET STARTED</p><h2 id="auth-heading">${signup ? 'Create your account' : 'Welcome back'}</h2>
      <p class="muted">${signup ? 'Your own space to make progress.' : 'Sign in to pick up where you left off.'}</p>
      <div class="auth-switch"><button type="button" id="login-tab" class="${!signup ? 'active' : ''}" aria-pressed="${!signup}">Log in</button><button type="button" id="signup-tab" class="${signup ? 'active' : ''}" aria-pressed="${signup}">Register</button></div>
      <div id="notice" role="status" aria-live="polite" hidden></div>
      <form id="auth-form"><label for="email">Email address</label><input id="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com" value="${escape(email)}">
      <label for="password">Password</label><input id="password" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" required ${signup ? 'minlength="8"' : ''} placeholder="${signup ? 'At least 8 characters' : 'Your password'}">
      ${signup ? '<p class="field-help">Use at least 8 characters. You may need to confirm your email before signing in.</p>' : ''}
      <button class="primary full" type="submit">${signup ? 'Create account' : 'Log in'} <span aria-hidden="true">→</span></button></form>
      <p class="privacy">Your tasks belong to you. Each account has its own private list.</p></section>
    </main><footer>One task at a time.</footer>`;
  document.querySelector('#login-tab').onclick = () => authView('login', document.querySelector('#email').value);
  document.querySelector('#signup-tab').onclick = () => authView('signup', document.querySelector('#email').value);
  document.querySelector('#auth-form').onsubmit = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#password').value;
    const button = form.querySelector('[type=submit]');
    button.disabled = true;
    button.textContent = signup ? 'Creating account…' : 'Signing in…';
    message('');
    try {
      const { data, error } = signup
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (signup && !data.session) {
        authView('login', email);
        message('Check your inbox for a confirmation link, then return here to log in. If you already have an account, log in instead.');
      }
    } catch (error) { message(errorText(error), true); }
    finally {
      button.disabled = false;
      button.textContent = signup ? 'Create account →' : 'Log in →';
    }
  };
}

function workspace() {
  app.innerHTML = `<header>${brand}<div class="account"><span>${escape(session.user.email)}</span><button id="logout" class="secondary">Log out</button></div></header>
    <main class="workspace"><div class="page-heading"><div><p class="eyebrow">YOUR PROJECT, IN MOTION</p><h1>My tasks<span class="heading-dot">.</span></h1><p class="muted">From first idea to final deliverable. Make the next step count.</p></div><button id="add-task" class="primary">＋ New task</button></div>
    <div id="notice" role="status" aria-live="polite" hidden></div><section id="stats" class="stats" aria-label="Task summary"></section>
    <section class="task-panel" aria-label="Your tasks"><div class="toolbar"><div class="filters" aria-label="Filter tasks">${Object.entries({ all: 'All tasks', ...statuses }).map(([key, name]) => `<button data-filter="${key}" aria-pressed="${filter === key}" class="${filter === key ? 'active' : ''}">${name}</button>`).join('')}</div><label class="search-label"><span class="sr-only">Search tasks</span><input id="search" type="search" placeholder="Search tasks…" value="${escape(search)}"></label><button id="refresh" class="secondary" aria-label="Refresh tasks">Refresh</button></div><div id="task-list" aria-live="polite"></div></section>
    <p class="workspace-note">A focused space for your ED1 project. Only you can access these tasks.</p></main>
    <dialog id="task-dialog" aria-labelledby="dialog-title"></dialog>`;
  document.querySelector('#add-task').onclick = () => taskDialog();
  document.querySelector('#search').oninput = event => { search = event.target.value; renderTasks(); };
  document.querySelectorAll('[data-filter]').forEach(button => { button.onclick = () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => {
      item.classList.toggle('active', item.dataset.filter === filter);
      item.setAttribute('aria-pressed', String(item.dataset.filter === filter));
    });
    renderTasks();
  }; });
  document.querySelector('#refresh').onclick = loadTasks;
  document.querySelector('#logout').onclick = async event => {
    const button = event.currentTarget;
    button.disabled = true;
    try { const { error } = await supabase.auth.signOut({ scope: 'local' }); if (error) throw error; }
    catch (error) { message(errorText(error), true); button.disabled = false; }
  };
  renderTasks();
}

async function loadTasks() {
  if (!session) return;
  const ownGeneration = ++generation;
  const userId = session.user.id;
  loading = true; loadError = ''; renderTasks();
  try {
    // RLS is the security boundary; the explicit owner filter also makes intent clear.
    const { data, error } = await supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    if (ownGeneration !== generation) return;
    tasks = data;
  } catch (error) {
    if (ownGeneration !== generation) return;
    loadError = errorText(error);
  } finally {
    if (ownGeneration === generation) { loading = false; renderTasks(); }
  }
}

function renderTasks() {
  const list = document.querySelector('#task-list');
  if (!list) return;
  const counts = Object.fromEntries(Object.keys(statuses).map(key => [key, tasks.filter(t => t.status === key).length]));
  document.querySelector('#stats').innerHTML = Object.entries(statuses).map(([key, name]) => `<article class="stat"><div><span class="stat-label"><i class="dot ${key}"></i>${name}</span><strong>${loading ? '—' : counts[key]}</strong></div></article>`).join('');
  document.querySelector('#refresh').disabled = loading;
  if (loading) { list.innerHTML = '<div class="empty"><p>Loading your tasks…</p></div>'; return; }
  if (loadError) { list.innerHTML = `<div class="empty"><h2>Couldn’t load your tasks</h2><p>${escape(loadError)}</p><p>Use Refresh to try again.</p></div>`; return; }
  const query = search.trim().toLowerCase();
  const visible = tasks.filter(t => (filter === 'all' || t.status === filter) && `${t.title} ${t.description}`.toLowerCase().includes(query));
  if (!visible.length) {
    list.innerHTML = `<div class="empty"><span class="empty-icon" aria-hidden="true">✓</span><h2>${tasks.length ? 'No matching tasks' : 'A fresh start for your project'}</h2><p>${tasks.length ? 'Try another status or search term.' : 'Add your first task and turn your next idea into a clear next step.'}</p>${!tasks.length ? '<button id="first-task" class="primary">＋ Create your first task</button>' : ''}</div>`;
    document.querySelector('#first-task')?.addEventListener('click', () => taskDialog());
    return;
  }
  list.innerHTML = visible.map(t => `<article class="task-row"><div class="task-symbol ${t.status}" aria-hidden="true">${t.status === 'done' ? '✓' : t.status === 'in_progress' ? '◒' : '○'}</div><div class="task-content"><h2>${escape(t.title)}</h2>${t.description ? `<p>${escape(t.description)}</p>` : ''}<span class="created">Added ${new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></div><select class="badge status-select ${t.status}" data-status="${t.id}" aria-label="Status for ${escape(t.title)}" ${pendingStatuses.has(t.id) ? 'disabled aria-busy="true"' : ''}>${Object.entries(statuses).map(([key, label]) => `<option value="${key}" ${(pendingStatuses.get(t.id) || t.status) === key ? 'selected' : ''}>${label}</option>`).join('')}</select><div class="task-actions"><button class="text-button" data-edit="${t.id}" ${pendingStatuses.has(t.id) ? 'disabled' : ''} aria-label="Edit ${escape(t.title)}">Edit</button><button class="text-button danger" data-delete="${t.id}" ${pendingStatuses.has(t.id) ? 'disabled' : ''} aria-label="Delete ${escape(t.title)}">Delete</button></div></article>`).join('');
  list.querySelectorAll('[data-status]').forEach(select => {
    select.onchange = () => updateStatus(select.dataset.status, select.value);
  });
  list.querySelectorAll('[data-edit]').forEach(button => { button.onclick = () => taskDialog(tasks.find(t => t.id === button.dataset.edit)); });
  list.querySelectorAll('[data-delete]').forEach(button => { button.onclick = () => deleteDialog(tasks.find(t => t.id === button.dataset.delete)); });
}

async function updateStatus(taskId, status) {
  const owner = session?.user.id;
  const task = tasks.find(item => item.id === taskId);
  if (!owner || !task || !(status in statuses) || task.status === status || pendingStatuses.has(taskId)) return;
  pendingStatuses.set(taskId, status);
  message('Saving status…');
  renderTasks();
  try {
    const { error } = await supabase.from('tasks').update({ status })
      .eq('id', taskId).eq('user_id', owner).select('id').single();
    if (error) throw error;
    pendingStatuses.delete(taskId);
    if (session?.user.id !== owner) return;
    message(`Status changed to ${statuses[status]}.`);
    await loadTasks();
  } catch (error) {
    pendingStatuses.delete(taskId);
    if (session?.user.id !== owner) return;
    // The saved task stays unchanged until the database confirms the update.
    renderTasks();
    message(`Status was not saved. ${errorText(error)}`, true);
  } finally {
    if (session?.user.id === owner) {
      const control = document.querySelector(`[data-status="${taskId}"]`);
      if (control && !control.disabled) control.focus();
    }
  }
}

function taskDialog(task = null) {
  const dialog = document.querySelector('#task-dialog');
  dialog.innerHTML = `<form id="task-form"><div class="dialog-heading"><div><p class="eyebrow">MAKE IT HAPPEN</p><h2 id="dialog-title">${task ? 'Edit task' : 'A new next step'}</h2></div><button type="button" class="close" aria-label="Close dialog">×</button></div><p id="form-error" class="error" role="alert" hidden></p>
    <label for="task-title">Task title</label><input id="task-title" name="title" required maxlength="120" placeholder="e.g. Review landmark detection results" value="${escape(task?.title || '')}">
    <label for="task-description">Description <span class="optional">optional</span></label><textarea id="task-description" name="description" maxlength="2000" rows="4" placeholder="Add context, notes, or a clear definition of done.">${escape(task?.description || '')}</textarea>
    <label for="task-status">Status</label><select id="task-status" name="status">${Object.entries(statuses).map(([key, name]) => `<option value="${key}" ${task?.status === key ? 'selected' : ''}>${name}</option>`).join('')}</select>
    <div class="dialog-actions"><button type="button" class="secondary cancel">Cancel</button><button type="submit" class="primary">${task ? 'Save changes' : 'Create task'}</button></div></form>`;
  bindDialog(dialog);
  dialog.querySelector('form').onsubmit = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const title = values.get('title').trim();
    if (!title) { showDialogError(dialog, 'Please enter a task title.'); return; }
    const owner = session?.user.id;
    if (!owner) { dialog.close(); return; }
    const fields = { title, description: values.get('description').trim(), status: values.get('status') };
    setDialogBusy(dialog, true);
    try {
      const query = task
        ? supabase.from('tasks').update(fields).eq('id', task.id).eq('user_id', owner)
        : supabase.from('tasks').insert({ ...fields, user_id: owner });
      const { error } = await query.select('id').single();
      if (error) throw error;
      if (session?.user.id !== owner) return;
      dialog.close(); message(task ? 'Task updated.' : 'Task created.'); await loadTasks();
    } catch (error) { showDialogError(dialog, errorText(error)); }
    finally { setDialogBusy(dialog, false); }
  };
  dialog.showModal();
}

function deleteDialog(task) {
  const dialog = document.querySelector('#task-dialog');
  dialog.innerHTML = `<form><h2 id="dialog-title">Delete this task?</h2><p class="delete-copy">“${escape(task.title)}” will be permanently removed.</p><p id="form-error" class="error" role="alert" hidden></p><div class="dialog-actions"><button type="button" class="secondary cancel">Keep task</button><button type="submit" class="primary destructive">Delete task</button></div></form>`;
  bindDialog(dialog);
  dialog.querySelector('form').onsubmit = async event => {
    event.preventDefault();
    const owner = session?.user.id;
    if (!owner) { dialog.close(); return; }
    setDialogBusy(dialog, true);
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', task.id).eq('user_id', owner).select('id').single();
      if (error) throw error;
      if (session?.user.id !== owner) return;
      dialog.close(); message('Task deleted.'); await loadTasks();
    } catch (error) { showDialogError(dialog, errorText(error)); }
    finally { setDialogBusy(dialog, false); }
  };
  dialog.showModal();
}
function bindDialog(dialog) {
  dialog.dataset.busy = 'false';
  dialog.oncancel = event => { if (dialog.dataset.busy === 'true') event.preventDefault(); };
  dialog.querySelectorAll('.cancel, .close').forEach(button => { button.onclick = () => dialog.close(); });
}
function setDialogBusy(dialog, busy) {
  dialog.dataset.busy = String(busy);
  dialog.querySelectorAll('button, input, textarea, select').forEach(el => { el.disabled = busy; });
}
function showDialogError(dialog, text) {
  const el = dialog.querySelector('#form-error'); el.textContent = text; el.hidden = false;
}

function acceptSession(next) {
  if (initialized && session?.user.id === next?.user.id) { session = next; return; }
  initialized = true; generation++; session = next; tasks = []; filter = 'all'; search = ''; loading = false; loadError = '';
  if (session) { workspace(); void loadTasks(); } else authView();
}

if (!supabase) {
  app.innerHTML = `<header>${brand}</header><main class="setup"><h1>One more setup step</h1><p>Add the Supabase project URL and publishable key to the app’s environment settings, then restart or rebuild the app.</p></main>`;
} else {
  app.innerHTML = '<main class="setup"><p>Opening your workspace…</p></main>';
  // Keep Supabase requests outside the auth callback to avoid locking its client.
  supabase.auth.onAuthStateChange((_event, next) => { setTimeout(() => acceptSession(next), 0); });
  supabase.auth.getSession().then(({ data, error }) => {
    if (!initialized) acceptSession(data?.session || null);
    if (error) message(errorText(error), true);
    const authError = new URLSearchParams(window.location.hash.slice(1)).get('error_description');
    if (authError) { message(authError, true); history.replaceState(null, '', window.location.pathname); }
  }).catch(error => { acceptSession(null); message(errorText(error), true); });
}
