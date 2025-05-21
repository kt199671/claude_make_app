document.addEventListener('DOMContentLoaded', () => {
    // ゲーム設定
    const config = {
        boardSize: 8,         // ボードの幅と高さ
        colors: ['red', 'orange', 'yellow', 'green', 'blue', 'purple'],
        matchMin: 3,          // マッチする最小の数
        initialMoves: 50,     // 初期の移動回数
        timeLimit: 120,       // 制限時間（秒）
        hintDelay: 3000,      // ヒントを表示するまでの時間（ミリ秒）
        animationSpeed: 300,  // アニメーション速度（ミリ秒）
        levels: [
            { target: 1000, moveBonus: 5 },   // レベル1
            { target: 2000, moveBonus: 5 },   // レベル2
            { target: 3500, moveBonus: 3 },   // レベル3
            { target: 5000, moveBonus: 3 },   // レベル4
            { target: 7500, moveBonus: 2 }    // レベル5
        ]
    };

    // ゲーム状態
    const state = {
        board: [],
        score: 0,
        moves: config.initialMoves,
        timeLeft: config.timeLimit,
        level: 0,
        selected: null,
        processing: false,
        gameOver: false,
        timerId: null,
        hintTimerId: null,
        hintCandies: []
    };

    // DOM要素
    const elements = {
        board: document.getElementById('board'),
        score: document.getElementById('score'),
        moves: document.getElementById('moves'),
        time: document.getElementById('time'),
        newGameBtn: document.getElementById('new-game-btn'),
        hintBtn: document.getElementById('hint-btn'),
        levelComplete: document.getElementById('level-complete'),
        gameOver: document.getElementById('game-over'),
        finalScore: document.getElementById('final-score'),
        gameOverScore: document.getElementById('game-over-score'),
        nextLevelBtn: document.getElementById('next-level-btn'),
        replayBtn: document.getElementById('replay-btn'),
        restartBtn: document.getElementById('restart-btn'),
        shareBtn: document.getElementById('share-btn'),
        tutorial: document.querySelector('.tutorial'),
        closeTutorial: document.getElementById('close-tutorial')
    };

    // ボード初期化
    function initBoard() {
        state.board = [];
        elements.board.innerHTML = '';
        elements.board.style.gridTemplateColumns = `repeat(${config.boardSize}, 1fr)`;

        // ボードを作成
        for (let row = 0; row < config.boardSize; row++) {
            state.board[row] = [];
            for (let col = 0; col < config.boardSize; col++) {
                // 初期状態で3つ以上揃わないように色を決定
                let color;
                do {
                    color = getRandomColor();
                } while (
                    (row >= 2 && state.board[row-1][col]?.color === color && state.board[row-2][col]?.color === color) ||
                    (col >= 2 && state.board[row][col-1]?.color === color && state.board[row][col-2]?.color === color)
                );

                createCandy(row, col, color);
            }
        }

        // 有効な移動があるか確認し、なければボードをリセット
        if (!findValidMoves().length) {
            initBoard();
        }
    }

    // キャンディを作成
    function createCandy(row, col, color, special = '') {
        // キャンディオブジェクト
        const candy = {
            row,
            col,
            color,
            special,
            element: document.createElement('div')
        };

        // HTMLエレメントを設定
        candy.element.className = `candy ${color}${special ? ' special' : ''}`;
        if (special) {
            candy.element.textContent = special;
        }
        candy.element.dataset.row = row;
        candy.element.dataset.col = col;

        // クリックイベント
        candy.element.addEventListener('click', () => handleCandyClick(candy));

        // タッチ操作のサポート
        candy.element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleCandyClick(candy);
        }, { passive: false });

        // ボードに追加
        elements.board.appendChild(candy.element);
        state.board[row][col] = candy;

        return candy;
    }

    // キャンディクリック処理
    function handleCandyClick(candy) {
        if (state.processing || state.gameOver) return;
        
        // キャンディが選択されていない場合
        if (!state.selected) {
            state.selected = candy;
            candy.element.classList.add('selected');
            return;
        }

        // 同じキャンディをクリックした場合は選択解除
        if (state.selected === candy) {
            state.selected.element.classList.remove('selected');
            state.selected = null;
            return;
        }

        // 隣接しているかチェック
        const rowDiff = Math.abs(state.selected.row - candy.row);
        const colDiff = Math.abs(state.selected.col - candy.col);
        const isAdjacent = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);

        if (isAdjacent) {
            // ヒント表示をクリア
            clearHints();
            
            // キャンディを交換
            swapCandies(state.selected, candy);
        } else {
            // 隣接していない場合は選択を変更
            state.selected.element.classList.remove('selected');
            state.selected = candy;
            candy.element.classList.add('selected');
        }
    }

    // キャンディを交換
    function swapCandies(candy1, candy2) {
        state.processing = true;
        
        // 選択解除
        if (candy1.element.classList.contains('selected')) {
            candy1.element.classList.remove('selected');
        }
        
        // 位置データを交換
        const tempRow = candy1.row;
        const tempCol = candy1.col;
        
        candy1.row = candy2.row;
        candy1.col = candy2.col;
        candy2.row = tempRow;
        candy2.col = tempCol;
        
        // データ構造を更新
        state.board[candy1.row][candy1.col] = candy1;
        state.board[candy2.row][candy2.col] = candy2;
        
        // 見た目の位置を更新
        updateCandyPosition(candy1);
        updateCandyPosition(candy2);
        
        // マッチングチェック用のタイムアウト
        setTimeout(() => {
            const matches = findMatches();
            
            if (matches.length > 0) {
                // 移動回数減少
                state.moves--;
                elements.moves.textContent = state.moves;
                
                // マッチ処理
                processMatches(matches);
            } else {
                // マッチしなかったので元に戻す
                candy1.row = candy2.row;
                candy1.col = candy2.col;
                candy2.row = tempRow;
                candy2.col = tempCol;
                
                state.board[candy1.row][candy1.col] = candy1;
                state.board[candy2.row][candy2.col] = candy2;
                
                updateCandyPosition(candy1);
                updateCandyPosition(candy2);
                
                setTimeout(() => {
                    state.processing = false;
                    state.selected = null;
                }, config.animationSpeed);
            }
        }, config.animationSpeed);
    }

    // キャンディの位置を更新
    function updateCandyPosition(candy) {
        candy.element.style.transition = `transform ${config.animationSpeed}ms`;
        candy.element.dataset.row = candy.row;
        candy.element.dataset.col = candy.col;
        candy.element.style.gridRow = candy.row + 1;
        candy.element.style.gridColumn = candy.col + 1;
    }

    // マッチングを検索
    function findMatches() {
        const matches = [];
        const visited = new Set();
        
        // 行方向のマッチを検索
        for (let row = 0; row < config.boardSize; row++) {
            let currentColor = null;
            let count = 1;
            let startCol = 0;
            
            for (let col = 0; col < config.boardSize; col++) {
                const candy = state.board[row][col];
                if (candy.color === currentColor) {
                    count++;
                } else {
                    if (count >= config.matchMin) {
                        // マッチするキャンディのリストを作成
                        const matchList = [];
                        for (let i = 0; i < count; i++) {
                            const matchCandy = state.board[row][startCol + i];
                            matchList.push(matchCandy);
                            visited.add(`${matchCandy.row},${matchCandy.col}`);
                        }
                        matches.push(matchList);
                    }
                    
                    currentColor = candy.color;
                    count = 1;
                    startCol = col;
                }
            }
            
            // 行の最後のマッチを確認
            if (count >= config.matchMin) {
                const matchList = [];
                for (let i = 0; i < count; i++) {
                    const matchCandy = state.board[row][config.boardSize - count + i];
                    matchList.push(matchCandy);
                    visited.add(`${matchCandy.row},${matchCandy.col}`);
                }
                matches.push(matchList);
            }
        }
        
        // 列方向のマッチを検索
        for (let col = 0; col < config.boardSize; col++) {
            let currentColor = null;
            let count = 1;
            let startRow = 0;
            
            for (let row = 0; row < config.boardSize; row++) {
                const candy = state.board[row][col];
                if (candy.color === currentColor) {
                    count++;
                } else {
                    if (count >= config.matchMin) {
                        // マッチするキャンディのリストを作成
                        const matchList = [];
                        for (let i = 0; i < count; i++) {
                            const matchCandy = state.board[startRow + i][col];
                            // 行マッチですでにカウントされていなければ追加
                            if (!visited.has(`${matchCandy.row},${matchCandy.col}`)) {
                                matchList.push(matchCandy);
                            }
                        }
                        if (matchList.length >= config.matchMin) {
                            matches.push(matchList);
                        }
                    }
                    
                    currentColor = candy.color;
                    count = 1;
                    startRow = row;
                }
            }
            
            // 列の最後のマッチを確認
            if (count >= config.matchMin) {
                const matchList = [];
                for (let i = 0; i < count; i++) {
                    const matchCandy = state.board[config.boardSize - count + i][col];
                    // 行マッチですでにカウントされていなければ追加
                    if (!visited.has(`${matchCandy.row},${matchCandy.col}`)) {
                        matchList.push(matchCandy);
                    }
                }
                if (matchList.length >= config.matchMin) {
                    matches.push(matchList);
                }
            }
        }
        
        // 特殊パターンを検出（L字型、T字型など）
        detectSpecialPatterns(matches);
        
        return matches;
    }

    // 特殊パターンの検出
    function detectSpecialPatterns(matches) {
        // 交差するマッチを見つける
        const crossPoints = new Map();
        
        for (const match of matches) {
            for (const candy of match) {
                const key = `${candy.row},${candy.col}`;
                if (crossPoints.has(key)) {
                    crossPoints.get(key).push(match);
                } else {
                    crossPoints.set(key, [match]);
                }
            }
        }
        
        // 交差する点で特殊なキャンディを作成
        for (const [key, matchesList] of crossPoints.entries()) {
            if (matchesList.length >= 2) {
                // 交差点の座標を取得
                const [row, col] = key.split(',').map(Number);
                const candy = state.board[row][col];
                
                // 特殊なキャンディの種類を決定
                let specialType = '';
                let totalLength = 0;
                
                for (const match of matchesList) {
                    totalLength += match.length;
                }
                
                // 交差点を二重にカウントしているので調整
                totalLength -= (matchesList.length - 1);
                
                if (totalLength >= 5) {
                    specialType = '5'; // 5つ以上のマッチ
                } else if (totalLength === 4) {
                    specialType = '4'; // 4つのマッチ
                } else {
                    specialType = 'L'; // L字型のマッチ
                }
                
                // キャンディに特殊属性を設定
                candy.special = specialType;
                candy.element.classList.add('special');
                candy.element.textContent = specialType;
            }
        }
    }

    // マッチングを処理
    function processMatches(matches) {
        let totalScore = 0;
        const matchedCandies = new Set();
        
        // 特殊キャンディの効果を適用
        for (const match of matches) {
            for (const candy of match) {
                matchedCandies.add(candy);
                
                // 特殊キャンディの処理
                if (candy.special) {
                    applySpecialCandyEffect(candy);
                }
            }
            
            // スコア計算
            const matchScore = calculateMatchScore(match);
            totalScore += matchScore;
            
            // コンボテキスト表示
            if (match.length > 3) {
                showComboText(match, matchScore);
            }
        }
        
        // マッチしたキャンディに消滅アニメーションを適用
        matchedCandies.forEach(candy => {
            candy.element.classList.add('matched');
        });
        
        // スコア更新
        state.score += totalScore;
        elements.score.textContent = state.score;
        
        // アニメーション後にキャンディを削除し、新しいキャンディを生成
        setTimeout(() => {
            // マッチしたキャンディを上から順に処理するためにソート
            const matchedArray = Array.from(matchedCandies).sort((a, b) => a.row - b.row);
            
            for (const candy of matchedArray) {
                elements.board.removeChild(candy.element);
                state.board[candy.row][candy.col] = null;
            }
            
            // 落下処理とキャンディ補充
            fillBoard().then(() => {
                // 連鎖反応をチェック
                const newMatches = findMatches();
                if (newMatches.length > 0) {
                    processMatches(newMatches);
                } else {
                    state.processing = false;
                    state.selected = null;
                    
                    // ゲームオーバーチェック
                    checkGameState();
                }
            });
        }, config.animationSpeed);
    }

    // 特殊キャンディの効果を適用
    function applySpecialCandyEffect(candy) {
        const { row, col, special, color } = candy;
        
        switch (special) {
            case 'L': // L字型: 周囲のキャンディを爆発
                for (let r = Math.max(0, row - 1); r <= Math.min(config.boardSize - 1, row + 1); r++) {
                    for (let c = Math.max(0, col - 1); c <= Math.min(config.boardSize - 1, col + 1); c++) {
                        const nearbyCandy = state.board[r][c];
                        if (nearbyCandy && !nearbyCandy.element.classList.contains('matched')) {
                            nearbyCandy.element.classList.add('matched');
                        }
                    }
                }
                break;
                
            case '4': // 4つ揃え: 同じ行または列を消去
                for (let i = 0; i < config.boardSize; i++) {
                    // 行を消去
                    const rowCandy = state.board[row][i];
                    if (rowCandy && !rowCandy.element.classList.contains('matched')) {
                        rowCandy.element.classList.add('matched');
                    }
                    
                    // 列を消去
                    const colCandy = state.board[i][col];
                    if (colCandy && !colCandy.element.classList.contains('matched')) {
                        colCandy.element.classList.add('matched');
                    }
                }
                break;
                
            case '5': // 5つ揃え: 同じ色をすべて消去
                for (let r = 0; r < config.boardSize; r++) {
                    for (let c = 0; c < config.boardSize; c++) {
                        const targetCandy = state.board[r][c];
                        if (targetCandy && targetCandy.color === color && !targetCandy.element.classList.contains('matched')) {
                            targetCandy.element.classList.add('matched');
                        }
                    }
                }
                break;
        }
    }

    // ボードを埋める（落下とキャンディ補充）
    function fillBoard() {
        return new Promise(resolve => {
            // 各列ごとに処理
            for (let col = 0; col < config.boardSize; col++) {
                // 下から上へ走査して空のセルを見つける
                for (let row = config.boardSize - 1; row >= 0; row--) {
                    if (!state.board[row][col]) {
                        // 空のセルより上にあるキャンディを下に移動
                        let fallDistance = 0;
                        for (let r = row; r >= 0; r--) {
                            if (!state.board[r][col]) {
                                fallDistance++;
                            } else {
                                // 上にキャンディがあれば落下させる
                                const fallingCandy = state.board[r][col];
                                const newRow = r + fallDistance;
                                
                                fallingCandy.row = newRow;
                                state.board[newRow][col] = fallingCandy;
                                state.board[r][col] = null;
                                
                                // アニメーション適用
                                fallingCandy.element.classList.add('falling');
                                updateCandyPosition(fallingCandy);
                            }
                        }
                        
                        // 一番上の行に新しいキャンディを追加
                        for (let r = fallDistance - 1; r >= 0; r--) {
                            const newColor = getRandomColor();
                            const newCandy = createCandy(r, col, newColor);
                            
                            // 最初は画面外に配置
                            newCandy.element.style.transform = `translateY(-${(fallDistance - r) * 100}%)`;
                            
                            // アニメーション適用
                            setTimeout(() => {
                                newCandy.element.classList.add('falling');
                                newCandy.element.style.transform = '';
                            }, 50);
                        }
                    }
                }
            }
            
            // アニメーション完了を待つ
            setTimeout(() => {
                // fallingクラスを削除
                document.querySelectorAll('.candy.falling').forEach(elem => {
                    elem.classList.remove('falling');
                });
                
                resolve();
            }, config.animationSpeed + 100);
        });
    }

    // スコア計算
    function calculateMatchScore(match) {
        // 基本スコア: マッチしたキャンディの数 * 20
        let baseScore = match.length * 20;
        
        // ボーナス: 3つ以上のマッチでボーナス
        if (match.length > 3) {
            baseScore *= (match.length - 2); // 4つで2倍、5つで3倍
        }
        
        // 特殊キャンディボーナス
        let specialBonus = 0;
        for (const candy of match) {
            if (candy.special) {
                switch (candy.special) {
                    case 'L': specialBonus += 50; break;
                    case '4': specialBonus += 80; break;
                    case '5': specialBonus += 120; break;
                }
            }
        }
        
        return baseScore + specialBonus;
    }

    // コンボテキスト表示
    function showComboText(match, score) {
        // 中央位置を計算
        let centerRow = 0;
        let centerCol = 0;
        
        for (const candy of match) {
            centerRow += candy.row;
            centerCol += candy.col;
        }
        
        centerRow = Math.floor(centerRow / match.length);
        centerCol = Math.floor(centerCol / match.length);
        
        // コンボテキスト作成
        const comboText = document.createElement('div');
        comboText.className = 'combo-text';
        
        // コンボメッセージ
        let message;
        if (match.length >= 5) {
            message = 'スーパー！';
        } else if (match.length === 4) {
            message = 'すごい！';
        } else {
            message = 'グッド！';
        }
        
        comboText.textContent = `${message} +${score}`;
        
        // 位置設定
        const board = elements.board.getBoundingClientRect();
        const cellSize = board.width / config.boardSize;
        
        comboText.style.left = `${board.left + centerCol * cellSize}px`;
        comboText.style.top = `${board.top + centerRow * cellSize}px`;
        
        document.body.appendChild(comboText);
        
        // アニメーション後に削除
        setTimeout(() => {
            document.body.removeChild(comboText);
        }, 1500);
    }

    // ゲーム状態チェック
    function checkGameState() {
        // 有効な移動があるかチェック
        const validMoves = findValidMoves();
        
        if (state.moves <= 0 || state.timeLeft <= 0 || validMoves.length === 0) {
            // ゲームオーバー
            gameOver();
            return;
        }
        
        // レベルクリアチェック
        const currentLevel = config.levels[state.level];
        if (state.score >= currentLevel.target) {
            levelComplete();
            return;
        }
        
        // ヒントタイマー設定
        resetHintTimer();
    }

    // レベルクリア処理
    function levelComplete() {
        clearInterval(state.timerId);
        clearTimeout(state.hintTimerId);
        state.gameOver = true;
        
        elements.finalScore.textContent = state.score;
        elements.levelComplete.classList.add('active');
    }

    // ゲームオーバー処理
    function gameOver() {
        clearInterval(state.timerId);
        clearTimeout(state.hintTimerId);
        state.gameOver = true;
        
        elements.gameOverScore.textContent = state.score;
        elements.gameOver.classList.add('active');
    }

    // ヒントタイマーリセット
    function resetHintTimer() {
        clearTimeout(state.hintTimerId);
        clearHints();
        
        state.hintTimerId = setTimeout(() => {
            showHint();
        }, config.hintDelay);
    }

    // ヒント表示
    function showHint() {
        if (state.processing || state.gameOver) return;
        
        const validMoves = findValidMoves();
        if (validMoves.length > 0) {
            // ランダムな有効な移動を選択
            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            
            // ヒントとしてキャンディをハイライト
            state.hintCandies = [randomMove.candy1, randomMove.candy2];
            state.hintCandies.forEach(candy => {
                candy.element.classList.add('hint');
            });
        }
    }

    // ヒントクリア
    function clearHints() {
        if (state.hintCandies.length > 0) {
            state.hintCandies.forEach(candy => {
                candy.element.classList.remove('hint');
            });
            state.hintCandies = [];
        }
    }

    // 有効な移動を見つける
    function findValidMoves() {
        const validMoves = [];
        
        // すべてのキャンディペアをチェック
        for (let row = 0; row < config.boardSize; row++) {
            for (let col = 0; col < config.boardSize; col++) {
                const candy = state.board[row][col];
                
                // 右と下の隣接キャンディをチェック
                const directions = [
                    { dr: 0, dc: 1 }, // 右
                    { dr: 1, dc: 0 }  // 下
                ];
                
                for (const { dr, dc } of directions) {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    
                    if (newRow < config.boardSize && newCol < config.boardSize) {
                        const adjacentCandy = state.board[newRow][newCol];
                        
                        // キャンディを仮に交換
                        swapInBoard(candy, adjacentCandy);
                        
                        // マッチがあるかチェック
                        const matches = findMatches();
                        
                        // キャンディを元に戻す
                        swapInBoard(adjacentCandy, candy);
                        
                        if (matches.length > 0) {
                            validMoves.push({
                                candy1: candy,
                                candy2: adjacentCandy,
                                matches: matches.length
                            });
                        }
                    }
                }
            }
        }
        
        return validMoves;
    }

    // ボード上でキャンディを交換（表示位置は変更しない）
    function swapInBoard(candy1, candy2) {
        const tempRow = candy1.row;
        const tempCol = candy1.col;
        
        candy1.row = candy2.row;
        candy1.col = candy2.col;
        candy2.row = tempRow;
        candy2.col = tempCol;
        
        state.board[candy1.row][candy1.col] = candy1;
        state.board[candy2.row][candy2.col] = candy2;
    }

    // タイマー更新
    function updateTimer() {
        state.timeLeft--;
        
        const minutes = Math.floor(state.timeLeft / 60);
        const seconds = state.timeLeft % 60;
        
        elements.time.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (state.timeLeft <= 0) {
            clearInterval(state.timerId);
            clearTimeout(state.hintTimerId);
            gameOver();
        }
    }

    // ランダムな色を取得
    function getRandomColor() {
        return config.colors[Math.floor(Math.random() * config.colors.length)];
    }

    // 次のレベルへ進む
    function nextLevel() {
        state.level++;
        if (state.level >= config.levels.length) {
            // 最終レベル達成
            alert('おめでとうございます！すべてのレベルをクリアしました！');
            startNewGame();
        } else {
            // 次のレベル
            const bonusMoves = config.levels[state.level - 1].moveBonus;
            state.moves += bonusMoves;
            elements.moves.textContent = state.moves;
            
            resetGame(false);
            elements.levelComplete.classList.remove('active');
        }
    }

    // 新しいゲームを開始
    function startNewGame() {
        state.score = 0;
        state.moves = config.initialMoves;
        state.timeLeft = config.timeLimit;
        state.level = 0;
        
        elements.score.textContent = state.score;
        elements.moves.textContent = state.moves;
        updateTimer();
        
        resetGame(true);
    }

    // ゲームをリセット
    function resetGame(fullReset) {
        // モーダルを閉じる
        elements.levelComplete.classList.remove('active');
        elements.gameOver.classList.remove('active');
        
        state.gameOver = false;
        state.processing = false;
        state.selected = null;
        clearHints();
        
        // タイマーをクリア
        if (state.timerId) {
            clearInterval(state.timerId);
        }
        if (state.hintTimerId) {
            clearTimeout(state.hintTimerId);
        }
        
        // ボードを初期化
        initBoard();
        
        // タイマーを開始
        if (fullReset) {
            elements.time.textContent = '02:00';
        }
        
        state.timerId = setInterval(updateTimer, 1000);
        resetHintTimer();
        
        // 最初のゲーム開始時にチュートリアルを表示
        if (fullReset && localStorage.getItem('candyCrushTutorialShown') !== 'true') {
            setTimeout(() => {
                elements.tutorial.classList.add('active');
                localStorage.setItem('candyCrushTutorialShown', 'true');
            }, 500);
        }
    }

    // 結果をシェア
    function shareResults() {
        const text = `キャンディクラッシュ風パズルゲームで${state.score}点獲得しました！挑戦してみませんか？ #キャンディパズル`;
        
        if (navigator.share) {
            navigator.share({
                title: 'キャンディクラッシュ風パズルゲーム',
                text: text,
                url: window.location.href
            }).catch(err => {
                console.error('共有に失敗しました:', err);
                copyToClipboard(text);
            });
        } else {
            copyToClipboard(text);
        }
    }

    // クリップボードにテキストをコピー
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('結果をクリップボードにコピーしました！');
    }

    // イベントリスナー
    elements.newGameBtn.addEventListener('click', startNewGame);
    elements.hintBtn.addEventListener('click', showHint);
    elements.nextLevelBtn.addEventListener('click', nextLevel);
    elements.replayBtn.addEventListener('click', () => resetGame(true));
    elements.restartBtn.addEventListener('click', startNewGame);
    elements.shareBtn.addEventListener('click', shareResults);
    elements.closeTutorial.addEventListener('click', () => elements.tutorial.classList.remove('active'));

    // キーボード操作
    document.addEventListener('keydown', event => {
        if (state.processing || state.gameOver || !state.selected) return;
        
        const { row, col } = state.selected;
        let newRow = row;
        let newCol = col;
        
        switch (event.key) {
            case 'ArrowUp': newRow = Math.max(0, row - 1); break;
            case 'ArrowDown': newRow = Math.min(config.boardSize - 1, row + 1); break;
            case 'ArrowLeft': newCol = Math.max(0, col - 1); break;
            case 'ArrowRight': newCol = Math.min(config.boardSize - 1, col + 1); break;
            default: return;
        }
        
        if (newRow !== row || newCol !== col) {
            const newCandy = state.board[newRow][newCol];
            state.selected.element.classList.remove('selected');
            handleCandyClick(newCandy);
            event.preventDefault();
        }
    });

    // スワイプ操作のサポート
    let touchStartX, touchStartY, touchStartRow, touchStartCol;
    
    elements.board.addEventListener('touchstart', function(e) {
        if (state.processing || state.gameOver) return;
        
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        
        // タッチした位置のキャンディを特定
        const board = elements.board.getBoundingClientRect();
        const cellSize = board.width / config.boardSize;
        
        touchStartCol = Math.floor((touchStartX - board.left) / cellSize);
        touchStartRow = Math.floor((touchStartY - board.top) / cellSize);
    }, { passive: true });
    
    elements.board.addEventListener('touchmove', function(e) {
        e.preventDefault(); // スクロール防止
    }, { passive: false });
    
    elements.board.addEventListener('touchend', function(e) {
        if (state.processing || state.gameOver || touchStartX === undefined) return;
        
        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;
        
        // スワイプ距離を計算
        const deltaX = endX - touchStartX;
        const deltaY = endY - touchStartY;
        const board = elements.board.getBoundingClientRect();
        const cellSize = board.width / config.boardSize;
        
        // 十分なスワイプ距離があるか確認（セルサイズの30%以上）
        const threshold = cellSize * 0.3;
        
        if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
            // スワイプ方向を判定
            let newRow = touchStartRow;
            let newCol = touchStartCol;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平スワイプ
                newCol += (deltaX > 0) ? 1 : -1;
            } else {
                // 垂直スワイプ
                newRow += (deltaY > 0) ? 1 : -1;
            }
            
            // 範囲内に収める
            newRow = Math.max(0, Math.min(config.boardSize - 1, newRow));
            newCol = Math.max(0, Math.min(config.boardSize - 1, newCol));
            
            // スワイプが有効な移動かチェック
            const startCandy = state.board[touchStartRow][touchStartCol];
            const targetCandy = state.board[newRow][newCol];
            
            // 隣接するキャンディでなければ無効
            const rowDiff = Math.abs(startCandy.row - targetCandy.row);
            const colDiff = Math.abs(startCandy.col - targetCandy.col);
            
            if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
                // クリック操作をシミュレート
                state.selected = startCandy;
                startCandy.element.classList.add('selected');
                handleCandyClick(targetCandy);
            }
        }
        
        // タッチデータをリセット
        touchStartX = undefined;
        touchStartY = undefined;
    }, { passive: true });

    // ゲーム初期化
    startNewGame();
});