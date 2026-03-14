/* ============================================================
   SMART TASK MANAGER — script.js
   Handles: Add / Complete / Delete tasks, counters, datetime
   ============================================================ */

// ── DOM References ──────────────────────────────────────────
const taskInput      = document.getElementById('taskInput');
const addTaskBtn     = document.getElementById('addTaskBtn');
const errorMsg       = document.getElementById('errorMsg');
const pendingList    = document.getElementById('pendingList');
const completedList  = document.getElementById('completedList');
const pendingEmpty   = document.getElementById('pendingEmpty');
const completedEmpty = document.getElementById('completedEmpty');
const pendingCount   = document.getElementById('pendingCount');
const completedCount = document.getElementById('completedCount');

// ── State ────────────────────────────────────────────────────
let tasks = [];       // { id, text, createdAt, completed }
let taskIdCounter = 0;

// ── Helpers ──────────────────────────────────────────────────

/**
 * Returns a formatted date + time string for a given Date object.
 * e.g. "14 Mar 2025 · 10:35 AM"
 */
function formatDateTime(date) {
  const day   = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year  = date.getFullYear();
  const time  = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${day} ${month} ${year} · ${time}`;
}

/** Show the error message briefly, then hide. */
function showError(msg) {
  errorMsg.textContent = '⚠ ' + msg;
  errorMsg.classList.add('visible');
  setTimeout(() => errorMsg.classList.remove('visible'), 2500);
}

/** Update the counter chips in the stats bar. */
function updateCounters() {
  const pending   = tasks.filter(t => !t.completed).length;
  const completed = tasks.filter(t => t.completed).length;
  pendingCount.textContent   = pending;
  completedCount.textContent = completed;
}

/** Show / hide the "empty state" placeholders. */
function updateEmptyStates() {
  const hasPending   = tasks.some(t => !t.completed);
  const hasCompleted = tasks.some(t => t.completed);

  pendingEmpty.style.display   = hasPending   ? 'none'  : 'flex';
  completedEmpty.style.display = hasCompleted ? 'none'  : 'flex';
}

// ── Render ───────────────────────────────────────────────────

/**
 * Build a single task DOM element.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createTaskElement(task) {
  const item = document.createElement('div');
  item.classList.add('task-item');
  item.dataset.id = task.id;

  if (task.completed) item.classList.add('completed');

  // --- Content block ---
  const content = document.createElement('div');
  content.classList.add('task-content');

  const text = document.createElement('p');
  text.classList.add('task-text');
  text.textContent = task.text;

  const datetime = document.createElement('div');
  datetime.classList.add('task-datetime');
  datetime.innerHTML = `<i class="fa-regular fa-calendar"></i> ${formatDateTime(task.createdAt)}`;

  content.appendChild(text);
  content.appendChild(datetime);

  // Add "Done" badge for completed tasks
  if (task.completed) {
    const badge = document.createElement('span');
    badge.classList.add('task-badge');
    badge.innerHTML = `<i class="fa-solid fa-check"></i> Done`;
    content.appendChild(badge);
  }

  // --- Actions block ---
  const actions = document.createElement('div');
  actions.classList.add('task-actions');

  if (!task.completed) {
    // Complete button (only for pending tasks)
    const completeBtn = document.createElement('button');
    completeBtn.classList.add('btn-icon', 'btn-complete');
    completeBtn.title = 'Mark as complete';
    completeBtn.setAttribute('aria-label', 'Mark as complete');
    completeBtn.innerHTML = `<i class="fa-solid fa-check"></i>`;
    completeBtn.addEventListener('click', () => completeTask(task.id));
    actions.appendChild(completeBtn);
  }

  // Delete button (for both pending & completed)
  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('btn-icon', 'btn-delete');
  deleteBtn.title = 'Delete task';
  deleteBtn.setAttribute('aria-label', 'Delete task');
  deleteBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
  deleteBtn.addEventListener('click', () => deleteTask(task.id));
  actions.appendChild(deleteBtn);

  item.appendChild(content);
  item.appendChild(actions);

  return item;
}

/** Re-render the pending and completed lists from the tasks array. */
function renderTasks() {
  // Clear rendered task items (but keep the empty-state divs)
  [...pendingList.querySelectorAll('.task-item')].forEach(el => el.remove());
  [...completedList.querySelectorAll('.task-item')].forEach(el => el.remove());

  tasks.forEach(task => {
    const el = createTaskElement(task);
    if (task.completed) {
      completedList.appendChild(el);
    } else {
      pendingList.appendChild(el);
    }
  });

  updateEmptyStates();
  updateCounters();
}

// ── Task Operations ──────────────────────────────────────────

/** Add a new task from the input field. */
function addTask() {
  const text = taskInput.value.trim();

  if (!text) {
    showError('Task cannot be empty!');
    taskInput.focus();
    return;
  }

  const newTask = {
    id:        ++taskIdCounter,
    text:      text,
    createdAt: new Date(),
    completed: false,
  };

  tasks.unshift(newTask);   // newest first
  taskInput.value = '';
  taskInput.focus();

  renderTasks();
}

/** Move a task from pending → completed. */
function completeTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  // Animate out of pending list
  const el = pendingList.querySelector(`[data-id="${id}"]`);
  if (el) {
    el.classList.add('removing');
    el.addEventListener('animationend', () => {
      task.completed = true;
      renderTasks();
    }, { once: true });
  } else {
    task.completed = true;
    renderTasks();
  }
}

/** Delete a task permanently from either list. */
function deleteTask(id) {
  const listEl = document.querySelector(`.task-item[data-id="${id}"]`);

  const remove = () => {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
  };

  if (listEl) {
    listEl.classList.add('removing');
    listEl.addEventListener('animationend', remove, { once: true });
  } else {
    remove();
  }
}

// ── Event Listeners ──────────────────────────────────────────

// Click the Add Task button
addTaskBtn.addEventListener('click', addTask);

// Press Enter in the input field
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

// Hide error when user starts typing again
taskInput.addEventListener('input', () => {
  if (errorMsg.classList.contains('visible')) {
    errorMsg.classList.remove('visible');
  }
});

// ── Initial Render ───────────────────────────────────────────
renderTasks();   // Render empty state on first load
