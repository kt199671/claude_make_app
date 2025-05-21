// DOM要素
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const modeButtons = document.querySelectorAll('.mode-btn');
const sessionCount = document.getElementById('session-count');
const tomatoIcons = document.querySelectorAll('.tomato-icon');
const progressRing = document.querySelector('.progress-ring .progress');
const notification = document.getElementById('notification');
const settingsToggle = document.getElementById('settings-toggle');
const settingsContent = document.getElementById('settings-content');
const saveSettingsBtn = document.getElementById('save-settings');
const pomodoroInput = document.getElementById('pomodoro-input');
const shortBreakInput = document.getElementById('short-break-input');
const longBreakInput = document.getElementById('long-break-input');
const sessionsInput = document.getElementById('sessions-input');
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const tasksList = document.getElementById('tasks-list');

// 設定
let settings = {
    pomodoro: 25, // 分
    shortBreak: 5, // 分
    longBreak: 15, // 分
    sessionsBeforeLongBreak: 4
};

// タイマーの状態
let timerState = {
    mode: 'pomodoro', // 'pomodoro', 'short-break', 'long-break'
    timeLeft: settings.pomodoro * 60, // 秒
    isRunning: false,
    interval: null,
    completedSessions: 0,
    totalSessions: settings.sessionsBeforeLongBreak
};

// タスクの配列
let tasks = JSON.parse(localStorage.getItem('pomodoroTasks')) || [];

// 初期化関数
function initialize() {
    // ローカルストレージから設定を読み込む
    const savedSettings = JSON.parse(localStorage.getItem('pomodoroSettings'));
    if (savedSettings) {
        settings = {...settings, ...savedSettings};
        
        // 設定フォームを更新
        pomodoroInput.value = settings.pomodoro;
        shortBreakInput.value = settings.shortBreak;
        longBreakInput.value = settings.longBreak;
        sessionsInput.value = settings.sessionsBeforeLongBreak;
    }
    
    // タイマーをリセット
    resetTimer();
    
    // プログレスリングの周囲の長さを計算
    const circumference = 2 * Math.PI * 110;
    progressRing.style.strokeDasharray = circumference;
    progressRing.style.strokeDashoffset = 0;
    
    // タスクを読み込んで表示
    renderTasks();
    
    // イベントリスナーを設定
    setupEventListeners();
}

// イベントリスナーの設定
function setupEventListeners() {
    // タイマーコントロール
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    // モード選択
    modeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mode = this.dataset.mode;
            selectMode(mode);
        });
    });
    
    // 設定パネル
    settingsToggle.addEventListener('click', function() {
        settingsContent.classList.toggle('show');
    });
    
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    // タスク管理
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
}

// タイマーを開始
function startTimer() {
    if (timerState.isRunning) return;
    
    timerState.isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    timerState.interval = setInterval(function() {
        if (timerState.timeLeft > 0) {
            timerState.timeLeft--;
            updateDisplay();
        } else {
            clearInterval(timerState.interval);
            timerComplete();
        }
    }, 1000);
}

// タイマーを一時停止
function pauseTimer() {
    if (!timerState.isRunning) return;
    
    timerState.isRunning = false;
    clearInterval(timerState.interval);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// タイマーをリセット
function resetTimer() {
    pauseTimer();
    timerState.timeLeft = getModeTime() * 60;
    updateDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// モードを選択
function selectMode(mode) {
    pauseTimer();
    
    timerState.mode = mode;
    resetTimer();
    
    // 選択されたモードのボタンを強調表示
    modeButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.mode === mode) {
            button.classList.add('active');
        }
    });
    
    // 背景色を更新
    updateBackgroundColor();
}

// 現在のモードに基づいて時間を取得
function getModeTime() {
    switch (timerState.mode) {
        case 'pomodoro':
            return settings.pomodoro;
        case 'short-break':
            return settings.shortBreak;
        case 'long-break':
            return settings.longBreak;
        default:
            return settings.pomodoro;
    }
}

// 表示を更新
function updateDisplay() {
    // 時間表示を更新
    const minutes = Math.floor(timerState.timeLeft / 60);
    const seconds = timerState.timeLeft % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // プログレスリングを更新
    const modeTime = getModeTime() * 60;
    const circumference = 2 * Math.PI * 110;
    const offset = circumference * (1 - timerState.timeLeft / modeTime);
    progressRing.style.strokeDashoffset = offset;
    
    // セッションカウンターを更新
    sessionCount.textContent = `${timerState.completedSessions}/${timerState.totalSessions}`;
    
    // トマトアイコンを更新
    tomatoIcons.forEach((icon, index) => {
        if (index < timerState.completedSessions) {
            icon.classList.add('active');
        } else {
            icon.classList.remove('active');
        }
    });
    
    // ドキュメントタイトルを更新
    document.title = `${timeDisplay.textContent} - ポモドーロタイマー`;
}

// 背景色を更新
function updateBackgroundColor() {
    document.body.classList.remove('work-mode', 'break-mode');
    
    if (timerState.mode === 'pomodoro') {
        document.body.classList.add('work-mode');
        progressRing.style.stroke = 'var(--primary-color)';
    } else {
        document.body.classList.add('break-mode');
        progressRing.style.stroke = 'var(--secondary-color)';
    }
}

// タイマー完了時の処理
function timerComplete() {
    playSound();
    showNotification();
    
    if (timerState.mode === 'pomodoro') {
        timerState.completedSessions++;
        
        // セッションカウンターが設定値に達したら長い休憩に移行
        if (timerState.completedSessions >= timerState.totalSessions) {
            timerState.completedSessions = 0;
            selectMode('long-break');
        } else {
            selectMode('short-break');
        }
    } else {
        selectMode('pomodoro');
    }
}

// 通知音を再生
function playSound() {
    const audio = new Audio('https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav');
    audio.play().catch(e => console.log('Audio play failed:', e));
}

// 通知を表示
function showNotification() {
    let message = '';
    let icon = '';
    
    if (timerState.mode === 'pomodoro') {
        message = 'ポモドーロ完了！休憩タイムです';
        icon = '✅';
        notification.classList.add('break');
        notification.classList.remove('work');
    } else {
        message = '休憩終了！作業を再開しましょう';
        icon = '🚀';
        notification.classList.add('work');
        notification.classList.remove('break');
    }
    
    notification.querySelector('.notification-icon').textContent = icon;
    notification.querySelector('.notification-text').textContent = message;
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
    
    // ブラウザ通知が許可されていれば表示
    if (Notification.permission === 'granted') {
        const browserNotification = new Notification('ポモドーロタイマー', {
            body: message,
            icon: 'https://images.emojiterra.com/google/android-10/512px/1f345.png'
        });
        
        setTimeout(() => browserNotification.close(), 5000);
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

// 設定を保存
function saveSettings() {
    const pomodoroValue = parseInt(pomodoroInput.value);
    const shortBreakValue = parseInt(shortBreakInput.value);
    const longBreakValue = parseInt(longBreakInput.value);
    const sessionsValue = parseInt(sessionsInput.value);
    
    if (isNaN(pomodoroValue) || isNaN(shortBreakValue) || isNaN(longBreakValue) || isNaN(sessionsValue)) {
        alert('数値を入力してください');
        return;
    }
    
    // 最小値と最大値をチェック
    if (pomodoroValue < 1 || shortBreakValue < 1 || longBreakValue < 1 || sessionsValue < 1) {
        alert('すべての値は1以上である必要があります');
        return;
    }
    
    settings.pomodoro = pomodoroValue;
    settings.shortBreak = shortBreakValue;
    settings.longBreak = longBreakValue;
    settings.sessionsBeforeLongBreak = sessionsValue;
    
    timerState.totalSessions = settings.sessionsBeforeLongBreak;
    
    // ローカルストレージに保存
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    
    // タイマーをリセット
    resetTimer();
    
    // トマトアイコンの表示を更新
    updateSessionIcons();
    
    // 設定パネルを閉じる
    settingsContent.classList.remove('show');
    
    // 保存成功の通知
    notification.querySelector('.notification-icon').textContent = '⚙️';
    notification.querySelector('.notification-text').textContent = '設定を保存しました';
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// セッションアイコンの更新
function updateSessionIcons() {
    const container = document.querySelector('.tomato-icons');
    container.innerHTML = '';
    
    for (let i = 0; i < settings.sessionsBeforeLongBreak; i++) {
        const icon = document.createElement('div');
        icon.className = 'tomato-icon';
        icon.textContent = '🍅';
        
        if (i < timerState.completedSessions) {
            icon.classList.add('active');
        }
        
        container.appendChild(icon);
    }
}

// タスクを追加
function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) return;
    
    const task = {
        id: Date.now().toString(),
        text: taskText,
        completed: false
    };
    
    tasks.push(task);
    taskInput.value = '';
    
    saveTasks();
    renderTasks();
}

// タスクの完了状態を切り替え
function toggleTaskComplete(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
    }
}

// タスクを削除
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// タスクを保存
function saveTasks() {
    localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
}

// タスクを表示
function renderTasks() {
    tasksList.innerHTML = '';
    
    if (tasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.textContent = 'タスクがありません';
        emptyMessage.style.padding = '10px';
        emptyMessage.style.color = '#999';
        emptyMessage.style.textAlign = 'center';
        tasksList.appendChild(emptyMessage);
        return;
    }
    
    tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
        
        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'task-delete';
        deleteButton.textContent = '×';
        deleteButton.addEventListener('click', () => deleteTask(task.id));
        
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskText);
        taskItem.appendChild(deleteButton);
        
        tasksList.appendChild(taskItem);
    });
}

// ブラウザ通知の許可を要求
function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('このブラウザは通知をサポートしていません');
        return;
    }
    
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

// ページが読み込まれたときに初期化
document.addEventListener('DOMContentLoaded', function() {
    initialize();
    requestNotificationPermission();
});