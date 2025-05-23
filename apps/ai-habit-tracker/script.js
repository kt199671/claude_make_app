// グローバル変数
let habits = [];
let userStats = {
    level: 1,
    experience: 30,
    totalPoints: 0,
    streak: 0,
    completedHabits: 0,
    achievements: []
};

// 週間チャレンジデータ
let weeklyChallenge = {
    id: 'health_week',
    title: '健康週間チャレンジ',
    description: '7日間連続で運動習慣を実行',
    icon: '🏃',
    targetDays: 7,
    completedDays: 0,
    reward: 500,
    isActive: true,
    startDate: new Date().toISOString(),
    category: 'health'
};

// 実績リスト
const achievements = {
    firstHabit: { name: "初めての一歩", desc: "最初の習慣を完了しました", icon: "🏅", points: 100 },
    weekStreak: { name: "週間戦士", desc: "7日連続で習慣を実行", icon: "🔥", points: 500 },
    tenHabits: { name: "習慣マスター", desc: "10個の習慣を完了", icon: "👑", points: 1000 },
    perfectDay: { name: "完璧な一日", desc: "すべての習慣を完了", icon: "⭐", points: 200 },
    earlyBird: { name: "早起き鳥", desc: "朝6時前に習慣を完了", icon: "🌅", points: 300 }
};

// AI分析メッセージ
const aiInsights = {
    performance: [
        "素晴らしい進歩です！あなたの完了率は着実に向上しています。",
        "少し調子が落ちているようですが、大丈夫。明日は新しい日です！",
        "安定したパフォーマンスを維持しています。この調子で続けましょう！"
    ],
    improvement: [
        "朝の習慣から始めることで、1日の勢いをつけることができます。",
        "小さな習慣から始めて、徐々に大きな目標に挑戦しましょう。",
        "習慣を特定の時間に結びつけることで、実行しやすくなります。"
    ],
    nextSteps: [
        "新しい習慣を1つ追加して、さらなる成長を目指しましょう。",
        "現在の習慣を21日間続けて、完全に定着させましょう。",
        "友達をチャレンジに招待して、一緒に成長しましょう！"
    ]
};

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    renderHabits();
    updateStats();
    checkDailyReset();
    renderWeeklyChallenge();
    startReminderSystem();
});

// イベントリスナーの設定
function setupEventListeners() {
    // 習慣追加
    document.getElementById('addHabitBtn').addEventListener('click', addHabit);
    document.getElementById('habitInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addHabit();
    });

    // AIおすすめ習慣
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.getElementById('habitInput').value = chip.dataset.habit;
            addHabit();
        });
    });

    // モーダル
    document.querySelector('.achievement-close').addEventListener('click', () => {
        document.getElementById('achievementModal').classList.remove('show');
    });

    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('aiModal').classList.remove('show');
    });

    // タブ切り替え
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
}

// 習慣を追加
function addHabit() {
    const input = document.getElementById('habitInput');
    const habitName = input.value.trim();

    if (!habitName) return;

    const habit = {
        id: Date.now(),
        name: habitName,
        createdAt: new Date().toISOString(),
        completedDates: [],
        streak: 0,
        isCompletedToday: false
    };

    habits.push(habit);
    input.value = '';
    saveData();
    renderHabits();
    
    // 初回ユーザーへのウェルカムメッセージ
    if (habits.length === 1) {
        showNotification('🎉 最初の習慣を追加しました！毎日コツコツ続けていきましょう！');
    }
}

// 習慣を表示
function renderHabits() {
    const habitsList = document.getElementById('habitsList');
    habitsList.innerHTML = '';

    if (habits.length === 0) {
        habitsList.innerHTML = `
            <div class="empty-state">
                <p>まだ習慣がありません。上のフォームから追加してみましょう！</p>
            </div>
        `;
        return;
    }

    habits.forEach(habit => {
        const habitCard = document.createElement('div');
        habitCard.className = `habit-card ${habit.isCompletedToday ? 'completed' : ''}`;
        
        habitCard.innerHTML = `
            <div class="habit-checkbox" onclick="toggleHabit(${habit.id})">
                ${habit.isCompletedToday ? '✓' : ''}
            </div>
            <div class="habit-info">
                <div class="habit-name" ondblclick="editHabit(${habit.id})" id="habit-name-${habit.id}">${habit.name}</div>
                <div class="habit-streak">🔥 ${habit.streak}日連続</div>
            </div>
            <div class="habit-actions">
                <button class="action-btn" onclick="editHabit(${habit.id})">
                    ✏️ 編集
                </button>
                <button class="action-btn" onclick="showAIAnalysis(${habit.id})">
                    🤖 AI分析
                </button>
                <button class="action-btn delete-btn" onclick="deleteHabit(${habit.id})">
                    🗑️ 削除
                </button>
            </div>
        `;
        
        habitsList.appendChild(habitCard);
    });
}

// 習慣の完了状態を切り替え
function toggleHabit(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const today = new Date().toDateString();

    if (habit.isCompletedToday) {
        // 完了を取り消し
        habit.isCompletedToday = false;
        habit.completedDates = habit.completedDates.filter(date => 
            new Date(date).toDateString() !== today
        );
        if (habit.streak > 0) habit.streak--;
        userStats.completedHabits--;
    } else {
        // 完了にする
        habit.isCompletedToday = true;
        habit.completedDates.push(new Date().toISOString());
        habit.streak++;
        userStats.completedHabits++;
        
        // ポイント追加
        addPoints(50);
        
        // 週間チャレンジ更新
        updateWeeklyChallenge(habit);
        
        // 実績チェック
        checkAchievements();
        
        // エフェクト
        createCompletionEffect(event.target);
    }

    saveData();
    renderHabits();
    updateStats();
    renderWeeklyChallenge();
}

// 習慣を削除
function deleteHabit(habitId) {
    if (!confirm('この習慣を削除しますか？')) return;
    
    habits = habits.filter(h => h.id !== habitId);
    saveData();
    renderHabits();
    updateStats();
}

// AI分析を表示
function showAIAnalysis(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const modal = document.getElementById('aiModal');
    const completionRate = habit.completedDates.length > 0 
        ? Math.round((habit.streak / habit.completedDates.length) * 100) 
        : 0;

    // AI分析結果を生成
    document.getElementById('performanceInsight').textContent = 
        completionRate > 70 ? aiInsights.performance[0] :
        completionRate > 40 ? aiInsights.performance[2] :
        aiInsights.performance[1];

    document.getElementById('improvementSuggestion').textContent = 
        aiInsights.improvement[Math.floor(Math.random() * aiInsights.improvement.length)];

    document.getElementById('nextSteps').textContent = 
        aiInsights.nextSteps[Math.floor(Math.random() * aiInsights.nextSteps.length)];

    modal.classList.add('show');
}

// 統計を更新
function updateStats() {
    const totalHabits = habits.length;
    const completedToday = habits.filter(h => h.isCompletedToday).length;
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    document.getElementById('completionRate').textContent = `${completionRate}%`;
    document.getElementById('totalCompleted').textContent = userStats.completedHabits;
    document.getElementById('achievementCount').textContent = userStats.achievements.length;
    document.getElementById('totalPoints').textContent = userStats.totalPoints.toLocaleString();
    document.getElementById('userLevel').textContent = userStats.level;
    document.getElementById('userScore').textContent = `${userStats.totalPoints.toLocaleString()}pt`;
    
    // 連続日数
    document.querySelector('.streak-days').textContent = userStats.streak;
    
    // 経験値バー
    const expPercentage = (userStats.experience / (userStats.level * 100)) * 100;
    document.querySelector('.experience-fill').style.width = `${expPercentage}%`;

    // 完璧な日チェック
    if (totalHabits > 0 && completedToday === totalHabits) {
        unlockAchievement('perfectDay');
    }
}

// ポイントを追加
function addPoints(points) {
    userStats.totalPoints += points;
    userStats.experience += points;
    
    // レベルアップチェック
    while (userStats.experience >= userStats.level * 100) {
        userStats.experience -= userStats.level * 100;
        userStats.level++;
        showNotification(`🎉 レベル${userStats.level}に到達しました！`);
    }
}

// 実績をチェック
function checkAchievements() {
    // 初めての習慣
    if (userStats.completedHabits === 1 && !userStats.achievements.includes('firstHabit')) {
        unlockAchievement('firstHabit');
    }
    
    // 10個の習慣完了
    if (userStats.completedHabits >= 10 && !userStats.achievements.includes('tenHabits')) {
        unlockAchievement('tenHabits');
    }
    
    // 早起き実績
    const hour = new Date().getHours();
    if (hour < 6 && !userStats.achievements.includes('earlyBird')) {
        unlockAchievement('earlyBird');
    }
}

// 実績を解除
function unlockAchievement(achievementId) {
    if (userStats.achievements.includes(achievementId)) return;
    
    const achievement = achievements[achievementId];
    userStats.achievements.push(achievementId);
    addPoints(achievement.points);
    
    // モーダル表示
    document.getElementById('achievementName').textContent = achievement.name;
    document.getElementById('achievementDesc').textContent = achievement.desc;
    document.querySelector('.achievement-icon').textContent = achievement.icon;
    document.getElementById('achievementModal').classList.add('show');
    
    saveData();
    updateStats();
}

// 完了エフェクト
function createCompletionEffect(element) {
    const rect = element.getBoundingClientRect();
    const effect = document.createElement('div');
    effect.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
        font-size: 2rem;
        animation: floatUp 1s ease-out forwards;
        pointer-events: none;
        z-index: 1000;
    `;
    effect.textContent = '+50';
    document.body.appendChild(effect);
    
    setTimeout(() => effect.remove(), 1000);
}

// 通知を表示
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        padding: 15px 25px;
        border-radius: 15px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease-out;
        z-index: 1001;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 日次リセットチェック
function checkDailyReset() {
    const lastReset = localStorage.getItem('lastReset');
    const today = new Date().toDateString();
    
    if (lastReset !== today) {
        // 新しい日の処理
        habits.forEach(habit => {
            if (!habit.isCompletedToday) {
                // 連続記録が途切れた
                habit.streak = 0;
            }
            habit.isCompletedToday = false;
        });
        
        // 連続ログインチェック
        if (lastReset && new Date(lastReset).toDateString() === 
            new Date(Date.now() - 86400000).toDateString()) {
            userStats.streak++;
            if (userStats.streak === 7) {
                unlockAchievement('weekStreak');
            }
        } else {
            userStats.streak = 1;
        }
        
        localStorage.setItem('lastReset', today);
        saveData();
        renderHabits();
        updateStats();
    }
}

// データを保存
function saveData() {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('userStats', JSON.stringify(userStats));
    localStorage.setItem('weeklyChallenge', JSON.stringify(weeklyChallenge));
}

// データを読み込み
function loadData() {
    const savedHabits = localStorage.getItem('habits');
    const savedStats = localStorage.getItem('userStats');
    const savedChallenge = localStorage.getItem('weeklyChallenge');
    
    if (savedHabits) {
        habits = JSON.parse(savedHabits);
    }
    
    if (savedStats) {
        userStats = { ...userStats, ...JSON.parse(savedStats) };
    }
    
    if (savedChallenge) {
        weeklyChallenge = { ...weeklyChallenge, ...JSON.parse(savedChallenge) };
    }
}

// データをエクスポート
function exportData() {
    const exportData = {
        habits: habits,
        userStats: userStats,
        weeklyChallenge: weeklyChallenge,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('📁 データをエクスポートしました');
}

// データをインポート
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (importedData.habits) habits = importedData.habits;
            if (importedData.userStats) userStats = { ...userStats, ...importedData.userStats };
            if (importedData.weeklyChallenge) weeklyChallenge = { ...weeklyChallenge, ...importedData.weeklyChallenge };
            
            saveData();
            renderHabits();
            updateStats();
            renderWeeklyChallenge();
            
            showNotification('📥 データをインポートしました');
        } catch (error) {
            showNotification('❌ ファイルの読み込みに失敗しました');
        }
    };
    reader.readAsText(file);
}

// 統計レポートを生成
function generateStatsReport() {
    const totalDays = Math.max(1, Math.floor((Date.now() - new Date(habits[0]?.createdAt || Date.now())) / (1000 * 60 * 60 * 24)));
    const averageCompletion = habits.length > 0 ? (userStats.completedHabits / (habits.length * totalDays) * 100).toFixed(1) : 0;
    
    const report = {
        summary: {
            totalHabits: habits.length,
            totalCompletedHabits: userStats.completedHabits,
            currentStreak: userStats.streak,
            totalPoints: userStats.totalPoints,
            currentLevel: userStats.level,
            averageCompletionRate: averageCompletion
        },
        habits: habits.map(habit => ({
            name: habit.name,
            streak: habit.streak,
            totalCompletions: habit.completedDates.length,
            createdAt: habit.createdAt,
            completionRate: habit.completedDates.length > 0 ? 
                ((habit.completedDates.length / totalDays) * 100).toFixed(1) : 0
        })),
        achievements: userStats.achievements.map(id => achievements[id]),
        generatedAt: new Date().toISOString()
    };
    
    const reportStr = JSON.stringify(report, null, 2);
    const reportBlob = new Blob([reportStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(reportBlob);
    link.download = `habit-tracker-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('📊 統計レポートを生成しました');
}

// アニメーションCSS
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -150%) scale(1.5);
            opacity: 0;
        }
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .empty-state {
        text-align: center;
        padding: 40px;
        color: var(--text-secondary);
    }
`;
document.head.appendChild(style);

// 週間チャレンジを更新
function updateWeeklyChallenge(habit) {
    if (!weeklyChallenge.isActive) return;
    
    // 運動関連の習慣かチェック
    const exerciseKeywords = ['運動', '歩く', 'ウォーキング', 'ランニング', 'ジム', '筋トレ', 'ヨガ', 'ストレッチ'];
    const isExerciseHabit = exerciseKeywords.some(keyword => 
        habit.name.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (isExerciseHabit) {
        const today = new Date().toDateString();
        const challengeStartDate = new Date(weeklyChallenge.startDate).toDateString();
        const daysSinceStart = Math.floor((new Date(today) - new Date(challengeStartDate)) / (1000 * 60 * 60 * 24));
        
        if (daysSinceStart < 7) {
            weeklyChallenge.completedDays = Math.min(weeklyChallenge.completedDays + 1, weeklyChallenge.targetDays);
            
            // チャレンジ完了チェック
            if (weeklyChallenge.completedDays >= weeklyChallenge.targetDays) {
                completeWeeklyChallenge();
            }
        }
    }
}

// 週間チャレンジ完了
function completeWeeklyChallenge() {
    if (!weeklyChallenge.isActive) return;
    
    weeklyChallenge.isActive = false;
    addPoints(weeklyChallenge.reward);
    showNotification(`🎉 ${weeklyChallenge.title}を完了しました！${weeklyChallenge.reward}ポイント獲得！`);
    
    // 新しいチャレンジを生成
    generateNewWeeklyChallenge();
}

// 新しい週間チャレンジを生成
function generateNewWeeklyChallenge() {
    const challenges = [
        {
            id: 'mindfulness_week',
            title: 'マインドフルネス週間',
            description: '7日間連続で瞑想習慣を実行',
            icon: '🧘',
            category: 'mindfulness'
        },
        {
            id: 'learning_week',
            title: '学習週間チャレンジ',
            description: '7日間連続で学習習慣を実行',
            icon: '📚',
            category: 'learning'
        },
        {
            id: 'hydration_week',
            title: '水分補給週間',
            description: '7日間連続で水分補給習慣を実行',
            icon: '💧',
            category: 'health'
        }
    ];
    
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    weeklyChallenge = {
        ...randomChallenge,
        targetDays: 7,
        completedDays: 0,
        reward: 500,
        isActive: true,
        startDate: new Date().toISOString()
    };
}

// 週間チャレンジをレンダリング
function renderWeeklyChallenge() {
    const challengeCard = document.querySelector('.challenge-card');
    if (!challengeCard) return;
    
    const progressPercentage = (weeklyChallenge.completedDays / weeklyChallenge.targetDays) * 100;
    
    challengeCard.innerHTML = `
        <div class="challenge-icon">${weeklyChallenge.icon}</div>
        <div class="challenge-info">
            <h3 class="challenge-title">${weeklyChallenge.title}</h3>
            <p class="challenge-desc">${weeklyChallenge.description}</p>
            <div class="challenge-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
                <span class="progress-text">${weeklyChallenge.completedDays}/${weeklyChallenge.targetDays}日</span>
            </div>
        </div>
        <div class="challenge-reward">
            <span class="reward-icon">🎁</span>
            <span class="reward-text">${weeklyChallenge.reward}pt</span>
        </div>
    `;
    
    // 完了済みの場合はスタイルを変更
    if (!weeklyChallenge.isActive) {
        challengeCard.classList.add('completed');
    } else {
        challengeCard.classList.remove('completed');
    }
}

// 習慣を編集
function editHabit(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const habitNameElement = document.getElementById(`habit-name-${habitId}`);
    const currentName = habit.name;
    
    // 入力フィールドに変更
    habitNameElement.innerHTML = `
        <input type="text" 
               class="habit-edit-input" 
               value="${currentName}" 
               onblur="saveHabitEdit(${habitId}, this.value)"
               onkeypress="handleEditKeypress(event, ${habitId}, this.value)"
               autofocus>
    `;
    
    // 入力フィールドにフォーカス
    const input = habitNameElement.querySelector('.habit-edit-input');
    input.focus();
    input.select();
}

// 習慣編集の保存
function saveHabitEdit(habitId, newName) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const trimmedName = newName.trim();
    if (trimmedName && trimmedName !== habit.name) {
        habit.name = trimmedName;
        saveData();
        showNotification('✏️ 習慣名を更新しました');
    }
    
    renderHabits();
}

// 編集時のキー操作
function handleEditKeypress(event, habitId, value) {
    if (event.key === 'Enter') {
        saveHabitEdit(habitId, value);
    } else if (event.key === 'Escape') {
        renderHabits(); // 編集をキャンセル
    }
}

// リマインダーシステムを開始
function startReminderSystem() {
    // 30分ごとにリマインダーをチェック
    setInterval(checkReminders, 30 * 60 * 1000);
    
    // 初回チェック（5分後）
    setTimeout(checkReminders, 5 * 60 * 1000);
}

// リマインダーをチェック
function checkReminders() {
    const now = new Date();
    const hour = now.getHours();
    
    // 朝のリマインダー（8-10時）
    if (hour >= 8 && hour <= 10) {
        const incompleteHabits = habits.filter(h => !h.isCompletedToday);
        if (incompleteHabits.length > 0) {
            showReminderNotification(
                '🌅 おはようございます！',
                `今日も${incompleteHabits.length}個の習慣で素晴らしい一日を始めましょう！`
            );
        }
    }
    
    // 夕方のリマインダー（18-20時）
    else if (hour >= 18 && hour <= 20) {
        const incompleteHabits = habits.filter(h => !h.isCompletedToday);
        if (incompleteHabits.length > 0) {
            showReminderNotification(
                '🌆 お疲れ様です！',
                `まだ${incompleteHabits.length}個の習慣が残っています。今日中に完了させましょう！`
            );
        }
    }
    
    // 夜のリマインダー（21-22時）
    else if (hour >= 21 && hour <= 22) {
        const completedToday = habits.filter(h => h.isCompletedToday).length;
        const totalHabits = habits.length;
        
        if (completedToday === totalHabits && totalHabits > 0) {
            showReminderNotification(
                '🎉 完璧な一日！',
                'すべての習慣を完了しました。素晴らしい成果です！'
            );
        } else if (completedToday > 0) {
            showReminderNotification(
                '🌙 今日もお疲れ様！',
                `${completedToday}個の習慣を完了しました。明日も頑張りましょう！`
            );
        }
    }
}

// リマインダー通知を表示
function showReminderNotification(title, message) {
    // 最後の通知から1時間以上経過している場合のみ表示
    const lastNotification = localStorage.getItem('lastReminderTime');
    const now = Date.now();
    
    if (!lastNotification || now - parseInt(lastNotification) > 60 * 60 * 1000) {
        const notification = document.createElement('div');
        notification.className = 'reminder-notification';
        notification.innerHTML = `
            <div class="reminder-header">
                <span class="reminder-title">${title}</span>
                <button class="reminder-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="reminder-message">${message}</div>
            <div class="reminder-actions">
                <button class="reminder-btn" onclick="this.parentElement.parentElement.remove()">確認</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 自動で10秒後に消去
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
        
        localStorage.setItem('lastReminderTime', now.toString());
    }
}

// モチベーション向上メッセージを生成
function getMotivationalMessage() {
    const messages = [
        '小さな一歩が大きな変化を生み出します 🌱',
        '継続は力なり。今日も頑張りましょう！ 💪',
        'あなたの努力は必ず実を結びます 🌟',
        '習慣は第二の天性。着実に成長しています 📈',
        '今日の自分は昨日の自分より素晴らしい ✨',
        '目標に向かって一歩ずつ進んでいます 🎯',
        '変化は小さな習慣から始まります 🔄'
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
}