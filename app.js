const STORAGE_KEY = 'little-by-little-todos';
const priorities = ['low', 'medium', 'high'];
const starterTodos = [
    { id: 'starter-docs', text: 'Complete project documentation', completed: false, priority: 'medium' },
    { id: 'starter-reviews', text: 'Review pull requests', completed: true, priority: 'high' },
    { id: 'starter-update', text: 'Update team on progress', completed: false, priority: 'low' }
];

const form = document.getElementById('todoForm');
const input = document.getElementById('todoInput');
const priorityInput = document.getElementById('priorityInput');
const todoList = document.getElementById('todoList');
const itemsLeft = document.getElementById('itemsLeft');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const emptyMessage = document.getElementById('emptyMessage');
const formMessage = document.getElementById('formMessage');
const storageMessage = document.getElementById('storageMessage');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const filterButtons = document.querySelectorAll('.filter-btn');

let todos = loadTodos();
let activeFilter = 'all';

function isTodoList(value) {
    if (!Array.isArray(value)) {
        return false;
    }

    const ids = new Set();
    return value.every((todo) => {
        if (
            !todo ||
            typeof todo.id !== 'string' ||
            todo.id.length === 0 ||
            ids.has(todo.id) ||
            typeof todo.text !== 'string' ||
            todo.text.trim().length === 0 ||
            typeof todo.completed !== 'boolean' ||
            !priorities.includes(todo.priority)
        ) {
            return false;
        }

        ids.add(todo.id);
        return true;
    });
}

function loadTodos() {
    let savedTodos;
    try {
        savedTodos = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
        console.error('Unable to load the saved todo list.', error);
        reportStorageIssue('Saving is unavailable right now. You can still use this list until you leave the page.');
        return starterTodos.map((todo) => ({ ...todo }));
    }

    if (savedTodos === null) {
        return starterTodos.map((todo) => ({ ...todo }));
    }

    let parsedTodos;
    try {
        parsedTodos = JSON.parse(savedTodos);
    } catch (error) {
        console.error('The saved todo list contains invalid JSON.', error);
        reportStorageIssue('Your saved list could not be read. The starter list is shown instead.');
        return starterTodos.map((todo) => ({ ...todo }));
    }

    if (isTodoList(parsedTodos)) {
        return parsedTodos;
    }

    reportStorageIssue('Your saved list has an invalid format. The starter list is shown instead.');
    return starterTodos.map((todo) => ({ ...todo }));
}

function saveTodos() {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
        console.error('Unable to save the todo list.', error);
        reportStorageIssue('Your changes are only saved for this visit because browser storage is unavailable.');
    }
}

function reportStorageIssue(message) {
    storageMessage.textContent = message;
    storageMessage.hidden = false;
}

function makeTodoId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
    }

    return `todo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function renderTodos() {
    const visibleTodos = todos.filter((todo) => {
        if (activeFilter === 'active') {
            return !todo.completed;
        }
        if (activeFilter === 'completed') {
            return todo.completed;
        }
        return true;
    });

    todoList.replaceChildren();
    visibleTodos.forEach((todo) => {
        const item = document.createElement('li');
        item.className = 'todo-item';
        if (todo.completed) {
            item.classList.add('completed');
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.setAttribute('aria-label', `Mark ${todo.text} ${todo.completed ? 'as not done' : 'as done'}`);
        checkbox.addEventListener('change', () => {
            todo.completed = checkbox.checked;
            saveTodos();
            renderTodos();
        });

        const text = document.createElement('span');
        text.className = 'todo-text';
        text.textContent = todo.text;

        const priority = document.createElement('span');
        priority.className = `priority-badge priority-${todo.priority}`;
        priority.textContent = todo.priority;

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'delete-btn';
        deleteButton.textContent = '×';
        deleteButton.setAttribute('aria-label', `Delete ${todo.text}`);
        deleteButton.addEventListener('click', () => {
            todos = todos.filter((itemTodo) => itemTodo.id !== todo.id);
            saveTodos();
            renderTodos();
        });

        item.append(checkbox, text, priority, deleteButton);
        todoList.append(item);
    });

    const completedCount = todos.filter((todo) => todo.completed).length;
    const remainingCount = todos.length - completedCount;
    const completionPercent = todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100);

    itemsLeft.textContent = `${remainingCount} ${remainingCount === 1 ? 'task' : 'tasks'} left`;
    progressText.textContent = `${completedCount} of ${todos.length} done`;
    progressBar.value = completionPercent;
    clearCompletedBtn.disabled = completedCount === 0;

    if (visibleTodos.length > 0) {
        emptyMessage.hidden = true;
        emptyMessage.textContent = '';
    } else {
        emptyMessage.textContent = todos.length === 0
            ? 'A fresh page. Add one small thing to get started.'
            : 'Nothing here right now. Try another view.';
        emptyMessage.hidden = false;
    }
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
        formMessage.textContent = 'Add a few words so you know what to do.';
        input.focus();
        return;
    }

    todos.push({
        id: makeTodoId(),
        text,
        completed: false,
        priority: priorities.includes(priorityInput.value) ? priorityInput.value : 'medium'
    });
    activeFilter = 'all';
    filterButtons.forEach((button) => {
        const isActive = button.dataset.filter === activeFilter;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
    formMessage.textContent = '';
    input.value = '';
    priorityInput.value = 'medium';
    saveTodos();
    renderTodos();
    input.focus();
});

input.addEventListener('input', () => {
    formMessage.textContent = '';
});

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        activeFilter = button.dataset.filter;
        filterButtons.forEach((filterButton) => {
            const isActive = filterButton === button;
            filterButton.classList.toggle('active', isActive);
            filterButton.setAttribute('aria-pressed', String(isActive));
        });
        renderTodos();
    });
});

clearCompletedBtn.addEventListener('click', () => {
    todos = todos.filter((todo) => !todo.completed);
    saveTodos();
    renderTodos();
});

renderTodos();
