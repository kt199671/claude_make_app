// タスクデータの管理
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// DOM要素
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const filterButtons = document.querySelectorAll('.filter-btn');
const totalTasksElement = document.getElementById('total-tasks');
const activeTasksElement = document.getElementById('active-tasks');
const completedTasksElement = document.getElementById('completed-tasks');

// イベントリスナー
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// タスクを追加
function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;
    
    const task = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(task);
    taskInput.value = '';
    saveTasks();
    renderTasks();
}

// タスクを削除
function deleteTask(id) {
    if (confirm('このタスクを削除しますか？')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }
}

// タスクの完了状態を切り替え
function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// タスクを編集
function editTask(id) {
    const taskItem = document.querySelector(`[data-id="${id}"]`);
    const textElement = taskItem.querySelector('.task-text');
    
    textElement.contentEditable = true;
    textElement.focus();
    
    const saveEdit = () => {
        const newText = textElement.textContent.trim();
        if (newText) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.text = newText;
                saveTasks();
            }
        }
        textElement.contentEditable = false;
        renderTasks();
    };
    
    textElement.addEventListener('blur', saveEdit, { once: true });
    textElement.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            textElement.blur();
        }
    });
}

// タスクを表示
function renderTasks() {
    const filteredTasks = filterTasks();
    
    if (filteredTasks.length === 0) {
        taskList.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        taskList.style.display = 'block';
        emptyState.style.display = 'none';
        
        taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="toggleComplete(${task.id})"
                />
                <span class="task-text" ondblclick="editTask(${task.id})">${task.text}</span>
                <div class="task-actions">
                    <button class="task-btn edit-btn" onclick="editTask(${task.id})">✏️</button>
                    <button class="task-btn delete-btn" onclick="deleteTask(${task.id})">🗑️</button>
                </div>
            </li>
        `).join('');
    }
    
    updateStats();
}

// タスクをフィルタリング
function filterTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(t => !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        default:
            return tasks;
    }
}

// 統計を更新
function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const activeTasks = totalTasks - completedTasks;
    
    totalTasksElement.textContent = totalTasks;
    activeTasksElement.textContent = activeTasks;
    completedTasksElement.textContent = completedTasks;
}

// ローカルストレージに保存
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 初期化
renderTasks();

// ダークモード対応
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
}

// ページのフォーカスを失ったときにタスクを表示し直す
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        renderTasks();
    }
});