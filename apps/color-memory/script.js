// ゲーム状態
let gameState = {
    sequence: [],
    playerSequence: [],
    level: 0,
    score: 0,
    isPlaying: false,
    isShowingSequence: false,
    speed: 1000,
    highScore: parseInt(localStorage.getItem('colorMemoryHighScore') || '0')
};

// DOM要素
const colorButtons = document.querySelectorAll('.color-button');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const levelDisplay = document.getElementById('level');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const messageDisplay = document.getElementById('message');
const centerDisplay = document.getElementById('centerDisplay');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');

// 音の周波数
const tones = {
    red: 261.63,    // C4
    green: 329.63,  // E4
    blue: 392.00,   // G4
    yellow: 523.25  // C5
};

// AudioContext
let audioContext = new (window.AudioContext || window.webkitAudioContext)();

// 初期化
function init() {
    highScoreDisplay.textContent = gameState.highScore;
    
    // カラーボタンのイベント
    colorButtons.forEach(button => {
        button.addEventListener('click', handleColorClick);
    });
    
    // コントロールボタンのイベント
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    
    // 難易度ボタンのイベント
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            gameState.speed = parseInt(e.target.dataset.speed);
        });
    });
}

// 音を再生
function playTone(frequency, duration = 200) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
}

// エラー音
function playErrorSound() {
    playTone(100, 500);
}

// 成功音
function playSuccessSound() {
    [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
        setTimeout(() => playTone(freq, 100), i * 100);
    });
}

// カラーボタンのクリック処理
function handleColorClick(e) {
    if (!gameState.isPlaying || gameState.isShowingSequence) return;
    
    const color = e.target.dataset.color;
    gameState.playerSequence.push(color);
    
    // ボタンのアニメーションと音
    animateButton(color);
    playTone(tones[color]);
    
    // シーケンスチェック
    checkSequence();
}

// ボタンのアニメーション
function animateButton(color, duration = 200) {
    const button = document.querySelector(`[data-color="${color}"]`);
    button.classList.add('active');
    
    setTimeout(() => {
        button.classList.remove('active');
    }, duration);
}

// ゲーム開始
function startGame() {
    gameState.isPlaying = true;
    gameState.level = 0;
    gameState.score = 0;
    gameState.sequence = [];
    gameState.playerSequence = [];
    
    startBtn.disabled = true;
    messageDisplay.textContent = 'ゲーム開始！';
    centerDisplay.textContent = '👀';
    
    updateDisplay();
    setTimeout(nextLevel, 1000);
}

// 次のレベル
function nextLevel() {
    gameState.level++;
    gameState.playerSequence = [];
    
    // 新しい色を追加
    const colors = ['red', 'green', 'blue', 'yellow'];
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    gameState.sequence.push(newColor);
    
    updateDisplay();
    showSequence();
}

// シーケンスを表示
function showSequence() {
    gameState.isShowingSequence = true;
    messageDisplay.textContent = 'よく見て覚えて！';
    centerDisplay.textContent = '👀';
    
    let i = 0;
    const interval = setInterval(() => {
        if (i >= gameState.sequence.length) {
            clearInterval(interval);
            gameState.isShowingSequence = false;
            messageDisplay.textContent = 'あなたの番です！';
            centerDisplay.textContent = '🎮';
            return;
        }
        
        const color = gameState.sequence[i];
        animateButton(color, gameState.speed * 0.8);
        playTone(tones[color], gameState.speed * 0.8);
        
        i++;
    }, gameState.speed);
}

// シーケンスをチェック
function checkSequence() {
    const currentIndex = gameState.playerSequence.length - 1;
    
    if (gameState.playerSequence[currentIndex] !== gameState.sequence[currentIndex]) {
        // 間違い
        gameOver();
        return;
    }
    
    // 正解
    gameState.score += 10 * gameState.level;
    updateDisplay();
    
    if (gameState.playerSequence.length === gameState.sequence.length) {
        // レベルクリア
        messageDisplay.textContent = '正解！次のレベルへ';
        centerDisplay.textContent = '✨';
        playSuccessSound();
        
        setTimeout(nextLevel, 1500);
    }
}

// ゲームオーバー
function gameOver() {
    gameState.isPlaying = false;
    startBtn.disabled = false;
    
    messageDisplay.textContent = '間違い！ゲームオーバー';
    centerDisplay.textContent = '😢';
    playErrorSound();
    
    // ハイスコア更新
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('colorMemoryHighScore', gameState.highScore);
        highScoreDisplay.textContent = gameState.highScore;
        messageDisplay.textContent += ' 🎉 新記録！';
    }
    
    // 間違えた色を表示
    colorButtons.forEach(button => {
        button.classList.add('flash');
    });
    
    setTimeout(() => {
        colorButtons.forEach(button => {
            button.classList.remove('flash');
        });
    }, 1000);
}

// ゲームリセット
function resetGame() {
    gameState.isPlaying = false;
    gameState.level = 0;
    gameState.score = 0;
    gameState.sequence = [];
    gameState.playerSequence = [];
    
    startBtn.disabled = false;
    messageDisplay.textContent = 'スタートボタンを押してゲーム開始！';
    centerDisplay.textContent = '🎮';
    
    updateDisplay();
}

// 表示更新
function updateDisplay() {
    levelDisplay.textContent = gameState.level;
    scoreDisplay.textContent = gameState.score;
}

// 初期化実行
init();