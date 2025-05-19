// ゲームの状態
let gameState = {
    isPlaying: false,
    currentText: '',
    typedText: '',
    startTime: null,
    timeLimit: 60,
    correctChars: 0,
    totalChars: 0,
    texts: [
        'The quick brown fox jumps over the lazy dog',
        'Practice makes perfect',
        'Never give up on your dreams',
        'Success is not final failure is not fatal',
        'The only way to do great work is to love what you do',
        'Believe you can and you are halfway there',
        'Life is what happens when you are busy making other plans',
        'The future belongs to those who believe in the beauty of their dreams',
        'It always seems impossible until it is done',
        'The best time to plant a tree was 20 years ago'
    ]
};

// DOM要素
const displayText = document.getElementById('display-text');
const inputText = document.getElementById('input-text');
const startBtn = document.getElementById('start-btn');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timeDisplay = document.getElementById('time');
const resultDisplay = document.getElementById('result');

// イベントリスナー
startBtn.addEventListener('click', startGame);
inputText.addEventListener('input', handleInput);

// ゲーム開始
function startGame() {
    gameState.isPlaying = true;
    gameState.startTime = Date.now();
    gameState.correctChars = 0;
    gameState.totalChars = 0;
    gameState.typedText = '';
    
    inputText.disabled = false;
    inputText.value = '';
    inputText.focus();
    startBtn.disabled = true;
    resultDisplay.classList.remove('show');
    
    // ランダムなテキストを選択
    gameState.currentText = gameState.texts[Math.floor(Math.random() * gameState.texts.length)];
    displayText.textContent = gameState.currentText;
    
    // タイマー開始
    updateTimer();
}

// 入力処理
function handleInput(e) {
    if (!gameState.isPlaying) return;
    
    const typed = e.target.value;
    gameState.typedText = typed;
    gameState.totalChars = typed.length;
    
    // 文字ごとの正誤判定
    let displayHtml = '';
    let correct = 0;
    
    for (let i = 0; i < gameState.currentText.length; i++) {
        const char = gameState.currentText[i];
        
        if (i < typed.length) {
            if (typed[i] === char) {
                displayHtml += `<span class="correct">${char}</span>`;
                correct++;
            } else {
                displayHtml += `<span class="incorrect">${char}</span>`;
            }
        } else {
            displayHtml += char;
        }
    }
    
    displayText.innerHTML = displayHtml;
    gameState.correctChars = correct;
    
    // 統計更新
    updateStats();
    
    // テキスト完了チェック
    if (typed === gameState.currentText) {
        // 新しいテキストを表示
        gameState.currentText = gameState.texts[Math.floor(Math.random() * gameState.texts.length)];
        displayText.textContent = gameState.currentText;
        inputText.value = '';
        gameState.typedText = '';
    }
}

// 統計更新
function updateStats() {
    // WPM計算
    const timeElapsed = (Date.now() - gameState.startTime) / 1000 / 60; // 分
    const words = gameState.correctChars / 5; // 1単語 = 5文字と仮定
    const wpm = Math.round(words / timeElapsed) || 0;
    wpmDisplay.textContent = wpm;
    
    // 正確率計算
    const accuracy = gameState.totalChars > 0 
        ? Math.round((gameState.correctChars / gameState.totalChars) * 100) 
        : 100;
    accuracyDisplay.textContent = accuracy;
}

// タイマー更新
function updateTimer() {
    if (!gameState.isPlaying) return;
    
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const remaining = gameState.timeLimit - elapsed;
    
    if (remaining <= 0) {
        endGame();
        return;
    }
    
    timeDisplay.textContent = remaining;
    requestAnimationFrame(updateTimer);
}

// ゲーム終了
function endGame() {
    gameState.isPlaying = false;
    inputText.disabled = true;
    startBtn.disabled = false;
    
    const finalWPM = wpmDisplay.textContent;
    const finalAccuracy = accuracyDisplay.textContent;
    
    resultDisplay.innerHTML = `
        <h2>ゲーム終了！</h2>
        <p>最終WPM: ${finalWPM}</p>
        <p>最終正確率: ${finalAccuracy}%</p>
    `;
    resultDisplay.classList.add('show');
}

// 初期化
displayText.textContent = 'スタートボタンを押してください';