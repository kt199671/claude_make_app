// ゲームの状態
let grid = [];
let score = 0;
let bestScore = localStorage.getItem('2048Best') || 0;

// DOM要素
const gridElement = document.getElementById('grid');
const scoreElement = document.getElementById('score');
const bestElement = document.getElementById('best');
const newGameBtn = document.getElementById('new-game');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const playAgainBtn = document.getElementById('play-again');

// イベントリスナー
document.addEventListener('keydown', handleKeyPress);
newGameBtn.addEventListener('click', startNewGame);
playAgainBtn.addEventListener('click', startNewGame);

// スワイプ対応
let touchStartX = 0;
let touchStartY = 0;
document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', e => {
    if (!e.changedTouches.length) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
            move('right');
        } else {
            move('left');
        }
    } else {
        if (diffY > 0) {
            move('down');
        } else {
            move('up');
        }
    }
});

// ゲーム初期化
function initGrid() {
    grid = Array(4).fill().map(() => Array(4).fill(0));
    score = 0;
    updateDisplay();
    addRandomTile();
    addRandomTile();
    updateDisplay();
}

// ランダムなタイルを追加
function addRandomTile() {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) {
                emptyCells.push({row: i, col: j});
            }
        }
    }
    
    if (emptyCells.length === 0) return;
    
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
}

// 表示更新
function updateDisplay() {
    gridElement.innerHTML = '';
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const tileDiv = document.createElement('div');
            tileDiv.className = 'tile';
            
            if (grid[i][j] !== 0) {
                tileDiv.textContent = grid[i][j];
                tileDiv.classList.add(`tile-${grid[i][j]}`);
            }
            
            gridElement.appendChild(tileDiv);
        }
    }
    
    scoreElement.textContent = score;
    bestElement.textContent = bestScore;
}

// キー入力処理
function handleKeyPress(e) {
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        move('up');
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        move('down');
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        move('left');
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        move('right');
    }
}

// 移動処理
function move(direction) {
    const oldGrid = JSON.stringify(grid);
    
    if (direction === 'left') {
        for (let i = 0; i < 4; i++) {
            grid[i] = moveLineLeft(grid[i]);
        }
    } else if (direction === 'right') {
        for (let i = 0; i < 4; i++) {
            grid[i] = moveLineRight(grid[i]);
        }
    } else if (direction === 'up') {
        for (let j = 0; j < 4; j++) {
            const column = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
            const newColumn = moveLineLeft(column);
            for (let i = 0; i < 4; i++) {
                grid[i][j] = newColumn[i];
            }
        }
    } else if (direction === 'down') {
        for (let j = 0; j < 4; j++) {
            const column = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
            const newColumn = moveLineRight(column);
            for (let i = 0; i < 4; i++) {
                grid[i][j] = newColumn[i];
            }
        }
    }
    
    if (oldGrid !== JSON.stringify(grid)) {
        addRandomTile();
        updateDisplay();
        
        if (isGameOver()) {
            showGameOver();
        }
    }
}

// 左移動処理
function moveLineLeft(line) {
    const filteredLine = line.filter(cell => cell !== 0);
    const mergedLine = [];
    
    for (let i = 0; i < filteredLine.length; i++) {
        if (filteredLine[i] === filteredLine[i + 1]) {
            mergedLine.push(filteredLine[i] * 2);
            score += filteredLine[i] * 2;
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('2048Best', bestScore);
            }
            i++;
        } else {
            mergedLine.push(filteredLine[i]);
        }
    }
    
    while (mergedLine.length < 4) {
        mergedLine.push(0);
    }
    
    return mergedLine;
}

// 右移動処理
function moveLineRight(line) {
    const reversedLine = line.slice().reverse();
    const movedLine = moveLineLeft(reversedLine);
    return movedLine.reverse();
}

// ゲームオーバー判定
function isGameOver() {
    // 空のセルがある場合
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) return false;
        }
    }
    
    // 隣接する同じ数字がある場合
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (j < 3 && grid[i][j] === grid[i][j + 1]) return false;
            if (i < 3 && grid[i][j] === grid[i + 1][j]) return false;
        }
    }
    
    return true;
}

// ゲームオーバー表示
function showGameOver() {
    finalScoreElement.textContent = score;
    gameOverElement.classList.add('show');
}

// 新しいゲーム開始
function startNewGame() {
    gameOverElement.classList.remove('show');
    initGrid();
}

// 初期化
initGrid();