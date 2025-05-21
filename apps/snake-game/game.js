// ゲームの設定
const settings = {
    boardWidth: 400,          // ボードの幅
    boardHeight: 400,         // ボードの高さ
    gridSize: 20,             // グリッドサイズ
    snakeColor: '#43cea2',    // ヘビの色
    headColor: '#2eaf8a',     // ヘビの頭の色
    foodColor: '#e74c3c',     // えさの色
    gridColor: '#f0f0f0',     // グリッドの色
    speed: {                  // 難易度ごとの速度（ミリ秒）
        easy: 180,
        medium: 120,
        hard: 80
    }
};

// DOM要素
const gameBoard = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const difficultySelect = document.getElementById('difficulty');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// ゲームの状態
let snake = [];                  // ヘビの位置を保持する配列
let food = null;                 // えさの位置
let direction = 'right';         // 現在の進行方向
let newDirection = 'right';      // 次の進行方向
let gameInterval = null;         // ゲームループのインターバル
let isGameRunning = false;       // ゲームが実行中かどうか
let score = 0;                   // 現在のスコア
let highScore = localStorage.getItem('snakeHighScore') || 0; // ハイスコア
let lastRenderTime = 0;          // 最後の描画時間
let gridCells = [];              // グリッドのセル

// ゲームボードの初期化
function initializeGameBoard() {
    // ボードのサイズを設定
    gameBoard.style.width = `${settings.boardWidth}px`;
    gameBoard.style.height = `${settings.boardHeight}px`;
    
    // グリッドを描画
    drawGrid();
    
    // モバイル用にボードのサイズを調整
    adjustBoardSize();
    
    // ウィンドウサイズ変更時のリサイズイベント
    window.addEventListener('resize', adjustBoardSize);
    
    // ハイスコアを表示
    highScoreElement.textContent = highScore;
}

// モバイル用にボードのサイズを調整
function adjustBoardSize() {
    const containerWidth = gameBoard.parentElement.offsetWidth;
    
    // コンテナの幅がボードの幅より小さい場合、ボードをリサイズ
    if (containerWidth < settings.boardWidth) {
        const scale = containerWidth / settings.boardWidth;
        
        gameBoard.style.transform = `scale(${scale})`;
        gameBoard.style.transformOrigin = 'top left';
        
        // ボードの親要素の高さを調整
        gameBoard.parentElement.style.height = `${settings.boardHeight * scale}px`;
    } else {
        gameBoard.style.transform = 'none';
        gameBoard.parentElement.style.height = `${settings.boardHeight}px`;
    }
}

// グリッドを描画
function drawGrid() {
    // 既存のグリッドセルをクリア
    gridCells = [];
    
    // グリッドのセルを作成
    for (let x = 0; x < settings.boardWidth; x += settings.gridSize) {
        for (let y = 0; y < settings.boardHeight; y += settings.gridSize) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.style.width = `${settings.gridSize}px`;
            cell.style.height = `${settings.gridSize}px`;
            cell.style.left = `${x}px`;
            cell.style.top = `${y}px`;
            
            gameBoard.appendChild(cell);
            gridCells.push(cell);
        }
    }
}

// ゲームをスタート
function startGame() {
    // すでに実行中の場合は一時停止中のゲームを再開
    if (snake.length > 0 && !isGameRunning) {
        resumeGame();
        return;
    }
    
    // ゲームの状態をリセット
    resetGame();
    
    // ヘビの初期位置を設定
    const startX = Math.floor(settings.boardWidth / (2 * settings.gridSize)) * settings.gridSize;
    const startY = Math.floor(settings.boardHeight / (2 * settings.gridSize)) * settings.gridSize;
    
    snake = [
        { x: startX, y: startY },
        { x: startX - settings.gridSize, y: startY },
        { x: startX - (2 * settings.gridSize), y: startY }
    ];
    
    // 最初のえさを生成
    generateFood();
    
    // スコアをリセット
    score = 0;
    scoreElement.textContent = '0';
    
    // ゲームを開始
    isGameRunning = true;
    
    // ボタンの状態を更新
    updateButtonStates();
    
    // フレームレートに基づいてゲームループを開始
    requestAnimationFrame(gameLoop);
}

// ゲームをリセット
function resetGame() {
    // 既存のヘビとえさの要素を削除
    const snakeParts = document.querySelectorAll('.snake-part');
    const foodElement = document.querySelector('.food');
    
    snakeParts.forEach(part => part.remove());
    if (foodElement) foodElement.remove();
    
    // ゲームのパラメータをリセット
    snake = [];
    food = null;
    direction = 'right';
    newDirection = 'right';
    isGameRunning = false;
    score = 0;
    
    // ゲームオーバー画面を非表示
    gameOverElement.classList.remove('visible');
}

// ゲームを一時停止
function pauseGame() {
    if (!isGameRunning) return;
    
    isGameRunning = false;
    updateButtonStates();
}

// ゲームを再開
function resumeGame() {
    if (isGameRunning) return;
    
    isGameRunning = true;
    lastRenderTime = 0;
    updateButtonStates();
    requestAnimationFrame(gameLoop);
}

// ボタンの状態を更新
function updateButtonStates() {
    if (isGameRunning) {
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        difficultySelect.disabled = true;
    } else {
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        difficultySelect.disabled = false;
    }
}

// ゲームのメインループ
function gameLoop(currentTime) {
    if (!isGameRunning) return;
    
    // 次のフレームをリクエスト
    requestAnimationFrame(gameLoop);
    
    // 現在の難易度に基づく速度を取得
    const currentSpeed = settings.speed[difficultySelect.value];
    
    // 前回の描画からの経過時間をチェック
    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    
    // 設定された速度より短い時間しか経過していない場合は何もしない
    if (secondsSinceLastRender < 1 / (1000 / currentSpeed)) return;
    
    // 最後の描画時間を更新
    lastRenderTime = currentTime;
    
    // ゲームの状態を更新
    updateGame();
    
    // ゲームの状態を描画
    renderGame();
}

// ゲームの状態を更新
function updateGame() {
    // 方向を更新
    direction = newDirection;
    
    // ヘビを移動
    moveSnake();
    
    // 衝突判定
    checkCollisions();
    
    // えさを食べたかチェック
    checkFood();
}

// ヘビを移動
function moveSnake() {
    // ヘビの新しい頭の位置を計算
    const head = { ...snake[0] };
    
    switch (direction) {
        case 'up':
            head.y -= settings.gridSize;
            break;
        case 'down':
            head.y += settings.gridSize;
            break;
        case 'left':
            head.x -= settings.gridSize;
            break;
        case 'right':
            head.x += settings.gridSize;
            break;
    }
    
    // 新しい頭を追加
    snake.unshift(head);
    
    // えさを食べていない場合は末尾を削除
    if (!(food && head.x === food.x && head.y === food.y)) {
        snake.pop();
    }
}

// 衝突判定
function checkCollisions() {
    const head = snake[0];
    
    // 壁との衝突
    if (
        head.x < 0 || 
        head.x >= settings.boardWidth || 
        head.y < 0 || 
        head.y >= settings.boardHeight
    ) {
        gameOver();
        return;
    }
    
    // 自分自身との衝突（頭と他の体の部分）
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
}

// えさを食べたかチェック
function checkFood() {
    const head = snake[0];
    
    if (food && head.x === food.x && head.y === food.y) {
        // スコアを更新
        score++;
        scoreElement.textContent = score;
        
        // ハイスコアを更新
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // 新しいえさを生成
        generateFood();
        
        // 効果音を再生
        playEatSound();
    }
}

// 効果音を再生
function playEatSound() {
    // Web Audio APIを使って簡単な効果音を生成
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 640;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        
        // 0.1秒後に音を止める
        setTimeout(() => {
            oscillator.stop();
        }, 100);
    } catch (e) {
        console.log('Audio playback failed:', e);
    }
}

// ゲームオーバー
function gameOver() {
    isGameRunning = false;
    updateButtonStates();
    
    // ゲームオーバー画面を表示
    finalScoreElement.textContent = score;
    gameOverElement.classList.add('visible');
    
    // ゲームオーバー効果音を再生
    playGameOverSound();
}

// ゲームオーバー効果音を再生
function playGameOverSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 220;
        gainNode.gain.value = 0.2;
        
        oscillator.start();
        
        // 周波数を下げながら音量も下げる
        oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
        
        // 0.5秒後に音を止める
        setTimeout(() => {
            oscillator.stop();
        }, 500);
    } catch (e) {
        console.log('Audio playback failed:', e);
    }
}

// 新しいえさを生成
function generateFood() {
    // ランダムな位置を生成
    let x, y;
    let validPosition = false;
    
    // ヘビと重ならない位置を見つける
    while (!validPosition) {
        x = Math.floor(Math.random() * (settings.boardWidth / settings.gridSize)) * settings.gridSize;
        y = Math.floor(Math.random() * (settings.boardHeight / settings.gridSize)) * settings.gridSize;
        
        validPosition = true;
        
        // ヘビの各部分とチェック
        for (const part of snake) {
            if (part.x === x && part.y === y) {
                validPosition = false;
                break;
            }
        }
    }
    
    // 既存のえさを削除
    const oldFood = document.querySelector('.food');
    if (oldFood) oldFood.remove();
    
    // 新しいえさの位置を保存
    food = { x, y };
}

// ゲームの状態を描画
function renderGame() {
    // 既存のヘビを削除
    const snakeParts = document.querySelectorAll('.snake-part');
    snakeParts.forEach(part => part.remove());
    
    // ヘビを描画
    snake.forEach((part, index) => {
        const snakePart = document.createElement('div');
        snakePart.className = 'snake-part';
        if (index === 0) snakePart.classList.add('snake-head');
        
        snakePart.style.width = `${settings.gridSize}px`;
        snakePart.style.height = `${settings.gridSize}px`;
        snakePart.style.left = `${part.x}px`;
        snakePart.style.top = `${part.y}px`;
        
        if (index === 0) {
            snakePart.style.background = settings.headColor;
        } else {
            snakePart.style.background = settings.snakeColor;
        }
        
        gameBoard.appendChild(snakePart);
    });
    
    // えさを描画
    if (food) {
        let foodElement = document.querySelector('.food');
        
        if (!foodElement) {
            foodElement = document.createElement('div');
            foodElement.className = 'food';
            
            foodElement.style.width = `${settings.gridSize}px`;
            foodElement.style.height = `${settings.gridSize}px`;
            foodElement.style.background = settings.foodColor;
            
            gameBoard.appendChild(foodElement);
        }
        
        foodElement.style.left = `${food.x}px`;
        foodElement.style.top = `${food.y}px`;
    }
}

// キーボード入力のイベントリスナー
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') newDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') newDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') newDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') newDirection = 'right';
            break;
        case ' ':  // スペースキー
            if (isGameRunning) {
                pauseGame();
            } else {
                if (snake.length > 0) {
                    resumeGame();
                } else {
                    startGame();
                }
            }
            break;
    }
});

// 方向ボタンのイベントリスナー
upBtn.addEventListener('click', () => {
    if (direction !== 'down') newDirection = 'up';
});

downBtn.addEventListener('click', () => {
    if (direction !== 'up') newDirection = 'down';
});

leftBtn.addEventListener('click', () => {
    if (direction !== 'right') newDirection = 'left';
});

rightBtn.addEventListener('click', () => {
    if (direction !== 'left') newDirection = 'right';
});

// ゲームコントロールボタンのイベントリスナー
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', startGame);

// 難易度変更のイベントリスナー
difficultySelect.addEventListener('change', () => {
    // ゲームが実行中の場合は一度停止する
    if (isGameRunning) {
        pauseGame();
    }
});

// タッチイベントの防止（画面スクロールを防ぐ）
gameBoard.addEventListener('touchstart', (e) => {
    e.preventDefault();
}, { passive: false });

gameBoard.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// スワイプ検出
let touchStartX = 0;
let touchStartY = 0;

gameBoard.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

gameBoard.addEventListener('touchend', (e) => {
    if (!isGameRunning) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // 水平方向のスワイプが垂直方向よりも大きい場合
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0 && direction !== 'left') {
            newDirection = 'right';
        } else if (diffX < 0 && direction !== 'right') {
            newDirection = 'left';
        }
    } 
    // 垂直方向のスワイプが水平方向よりも大きい場合
    else {
        if (diffY > 0 && direction !== 'up') {
            newDirection = 'down';
        } else if (diffY < 0 && direction !== 'down') {
            newDirection = 'up';
        }
    }
});

// ページの読み込みが完了したときに初期化
window.addEventListener('load', () => {
    initializeGameBoard();
});