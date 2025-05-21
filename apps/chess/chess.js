// チェス駒の表現
const PIECES = {
    WHITE_KING: '♔',
    WHITE_QUEEN: '♕',
    WHITE_ROOK: '♖',
    WHITE_BISHOP: '♗',
    WHITE_KNIGHT: '♘',
    WHITE_PAWN: '♙',
    BLACK_KING: '♚',
    BLACK_QUEEN: '♛',
    BLACK_ROOK: '♜',
    BLACK_BISHOP: '♝',
    BLACK_KNIGHT: '♞',
    BLACK_PAWN: '♟'
};

// DOM要素
const chessBoard = document.getElementById('chess-board');
const gameStatus = document.getElementById('game-status');
const whiteIndicator = document.getElementById('white-indicator');
const blackIndicator = document.getElementById('black-indicator');
const whiteCaptured = document.getElementById('white-captured');
const blackCaptured = document.getElementById('black-captured');
const moveList = document.getElementById('move-list');
const gameOverModal = document.getElementById('game-over');
const gameResult = document.getElementById('game-result');
const winner = document.getElementById('winner');
const newGameBtn = document.getElementById('new-game-btn');
const undoBtn = document.getElementById('undo-btn');
const resignBtn = document.getElementById('resign-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const promotionModal = document.getElementById('promotion-modal');
const promotionPieces = document.getElementById('promotion-pieces');

// ゲームの状態
let board = [];
let currentTurn = 'white';
let selectedPiece = null;
let possibleMoves = [];
let gameHistory = [];
let whiteCapturedPieces = [];
let blackCapturedPieces = [];
let kings = { white: null, black: null };
let isCheck = { white: false, black: false };
let promotionCallback = null;

// 初期化
function initializeGame() {
    // ボードの初期化
    initializeBoard();
    
    // ボードを描画
    renderBoard();
    
    // ゲームの状態をリセット
    resetGameState();
    
    // イベントリスナーの設定
    setupEventListeners();
}

// ボードの初期化
function initializeBoard() {
    board = Array(8).fill().map(() => Array(8).fill(null));
    
    // ポーンの配置
    for (let col = 0; col < 8; col++) {
        board[1][col] = { type: 'pawn', color: 'black', symbol: PIECES.BLACK_PAWN, moved: false };
        board[6][col] = { type: 'pawn', color: 'white', symbol: PIECES.WHITE_PAWN, moved: false };
    }
    
    // ルーク（飛車）の配置
    board[0][0] = { type: 'rook', color: 'black', symbol: PIECES.BLACK_ROOK, moved: false };
    board[0][7] = { type: 'rook', color: 'black', symbol: PIECES.BLACK_ROOK, moved: false };
    board[7][0] = { type: 'rook', color: 'white', symbol: PIECES.WHITE_ROOK, moved: false };
    board[7][7] = { type: 'rook', color: 'white', symbol: PIECES.WHITE_ROOK, moved: false };
    
    // ナイト（桂馬）の配置
    board[0][1] = { type: 'knight', color: 'black', symbol: PIECES.BLACK_KNIGHT };
    board[0][6] = { type: 'knight', color: 'black', symbol: PIECES.BLACK_KNIGHT };
    board[7][1] = { type: 'knight', color: 'white', symbol: PIECES.WHITE_KNIGHT };
    board[7][6] = { type: 'knight', color: 'white', symbol: PIECES.WHITE_KNIGHT };
    
    // ビショップ（角行）の配置
    board[0][2] = { type: 'bishop', color: 'black', symbol: PIECES.BLACK_BISHOP };
    board[0][5] = { type: 'bishop', color: 'black', symbol: PIECES.BLACK_BISHOP };
    board[7][2] = { type: 'bishop', color: 'white', symbol: PIECES.WHITE_BISHOP };
    board[7][5] = { type: 'bishop', color: 'white', symbol: PIECES.WHITE_BISHOP };
    
    // クイーン（女王）の配置
    board[0][3] = { type: 'queen', color: 'black', symbol: PIECES.BLACK_QUEEN };
    board[7][3] = { type: 'queen', color: 'white', symbol: PIECES.WHITE_QUEEN };
    
    // キング（王）の配置
    board[0][4] = { type: 'king', color: 'black', symbol: PIECES.BLACK_KING, moved: false };
    board[7][4] = { type: 'king', color: 'white', symbol: PIECES.WHITE_KING, moved: false };
    
    // キングの位置を記録
    kings.black = { row: 0, col: 4 };
    kings.white = { row: 7, col: 4 };
}

// ボードを描画
function renderBoard() {
    chessBoard.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        const boardRow = document.createElement('div');
        boardRow.className = 'board-row';
        
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement('div');
            const isWhite = (row + col) % 2 === 0;
            cell.className = `board-cell ${isWhite ? 'white-cell' : 'black-cell'}`;
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // 行と列のラベルを追加
            if (col === 0) {
                const rowLabel = document.createElement('div');
                rowLabel.className = 'row-label';
                rowLabel.textContent = 8 - row;
                cell.appendChild(rowLabel);
            }
            
            if (row === 7) {
                const colLabel = document.createElement('div');
                colLabel.className = 'col-label';
                colLabel.textContent = String.fromCharCode(97 + col); // a, b, c, ...
                cell.appendChild(colLabel);
            }
            
            // 駒を配置
            const piece = board[row][col];
            if (piece) {
                cell.textContent = piece.symbol;
            }
            
            boardRow.appendChild(cell);
        }
        
        chessBoard.appendChild(boardRow);
    }
    
    // 選択中の駒をハイライト
    if (selectedPiece) {
        const cell = chessBoard.querySelector(`[data-row="${selectedPiece.row}"][data-col="${selectedPiece.col}"]`);
        const highlight = document.createElement('div');
        highlight.className = 'highlight';
        cell.appendChild(highlight);
    }
    
    // 可能な移動先をハイライト
    possibleMoves.forEach(move => {
        const cell = chessBoard.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
        const highlight = document.createElement('div');
        
        if (board[move.row][move.col]) {
            highlight.className = 'capture-highlight';
        } else {
            highlight.className = 'move-highlight';
        }
        
        cell.appendChild(highlight);
    });
    
    // チェック状態のキングをハイライト
    if (isCheck.white) {
        const kingCell = chessBoard.querySelector(`[data-row="${kings.white.row}"][data-col="${kings.white.col}"]`);
        const checkHighlight = document.createElement('div');
        checkHighlight.className = 'check-highlight';
        kingCell.appendChild(checkHighlight);
    }
    
    if (isCheck.black) {
        const kingCell = chessBoard.querySelector(`[data-row="${kings.black.row}"][data-col="${kings.black.col}"]`);
        const checkHighlight = document.createElement('div');
        checkHighlight.className = 'check-highlight';
        kingCell.appendChild(checkHighlight);
    }
    
    // ターンインジケーターを更新
    whiteIndicator.classList.toggle('current-turn', currentTurn === 'white');
    blackIndicator.classList.toggle('current-turn', currentTurn === 'black');
    
    // ゲームステータスを更新
    gameStatus.textContent = `${currentTurn === 'white' ? '白' : '黒'}の番`;
}

// ゲームの状態をリセット
function resetGameState() {
    currentTurn = 'white';
    selectedPiece = null;
    possibleMoves = [];
    gameHistory = [];
    whiteCapturedPieces = [];
    blackCapturedPieces = [];
    isCheck = { white: false, black: false };
    
    // 捕獲された駒の表示をクリア
    whiteCaptured.innerHTML = '';
    blackCaptured.innerHTML = '';
    
    // 棋譜をクリア
    moveList.innerHTML = '';
    
    // ゲームオーバーモーダルを非表示
    gameOverModal.classList.remove('visible');
    
    // ボードを更新
    renderBoard();
}

// イベントリスナーの設定
function setupEventListeners() {
    // ボードのクリックイベント
    chessBoard.addEventListener('click', handleBoardClick);
    
    // ボタンのイベント
    newGameBtn.addEventListener('click', initializeGame);
    undoBtn.addEventListener('click', undoMove);
    resignBtn.addEventListener('click', resignGame);
    playAgainBtn.addEventListener('click', initializeGame);
}

// ボードクリックの処理
function handleBoardClick(event) {
    const cell = event.target.closest('.board-cell');
    if (!cell) return;
    
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    // 駒を選択または移動
    if (selectedPiece === null) {
        // 駒の選択
        selectPiece(row, col);
    } else {
        // 駒の移動
        const isMoveValid = possibleMoves.some(move => move.row === row && move.col === col);
        
        if (selectedPiece.row === row && selectedPiece.col === col) {
            // 同じ駒をクリックした場合は選択を解除
            deselectPiece();
        } else if (isMoveValid) {
            // 有効な移動先の場合は駒を移動
            movePiece(row, col);
        } else {
            // 他の駒を選択
            const piece = board[row][col];
            if (piece && piece.color === currentTurn) {
                selectPiece(row, col);
            } else {
                deselectPiece();
            }
        }
    }
}

// 駒を選択
function selectPiece(row, col) {
    const piece = board[row][col];
    
    if (!piece || piece.color !== currentTurn) return;
    
    selectedPiece = { row, col, piece };
    possibleMoves = getValidMoves(row, col, piece);
    
    renderBoard();
}

// 駒の選択を解除
function deselectPiece() {
    selectedPiece = null;
    possibleMoves = [];
    
    renderBoard();
}

// 駒を移動
function movePiece(toRow, toCol) {
    const fromRow = selectedPiece.row;
    const fromCol = selectedPiece.col;
    const piece = board[fromRow][fromCol];
    
    // 移動前の状態を保存
    const moveState = {
        fromRow,
        fromCol,
        toRow,
        toCol,
        capturedPiece: board[toRow][toCol],
        piece: { ...piece },
        kings: JSON.parse(JSON.stringify(kings)),
        isCheck: { ...isCheck },
    };
    
    // 駒を捕獲した場合
    if (board[toRow][toCol]) {
        const capturedPiece = board[toRow][toCol];
        if (capturedPiece.color === 'white') {
            blackCapturedPieces.push(capturedPiece);
        } else {
            whiteCapturedPieces.push(capturedPiece);
        }
    }
    
    // 駒を移動
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;
    
    // 駒が動いたことを記録
    piece.moved = true;
    
    // キングの位置を更新
    if (piece.type === 'king') {
        kings[piece.color] = { row: toRow, col: toCol };
    }
    
    // ポーンの昇格処理
    if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
        showPromotionModal(toRow, toCol, currentTurn, (promotedPiece) => {
            board[toRow][toCol] = promotedPiece;
            
            // 移動履歴に昇格情報を追加
            moveState.promotion = promotedPiece;
            gameHistory.push(moveState);
            
            // 棋譜に追加
            addMoveToHistory(fromRow, fromCol, toRow, toCol, piece, board[toRow][toCol].type);
            
            // ターンを切り替え
            switchTurn();
        });
        return;
    }
    
    // 移動履歴に追加
    gameHistory.push(moveState);
    
    // 棋譜に追加
    addMoveToHistory(fromRow, fromCol, toRow, toCol, piece);
    
    // 選択を解除
    deselectPiece();
    
    // ターンを切り替え
    switchTurn();
}

// ターンを切り替え
function switchTurn() {
    currentTurn = currentTurn === 'white' ? 'black' : 'white';
    
    // チェック状態を更新
    updateCheckStatus();
    
    // チェックメイトかスタルメイトをチェック
    if (isCheckmate()) {
        gameResult.textContent = 'チェックメイト！';
        winner.textContent = `${currentTurn === 'white' ? '黒' : '白'}の勝利`;
        gameOverModal.classList.add('visible');
    } else if (isStalemate()) {
        gameResult.textContent = 'ステイルメイト！';
        winner.textContent = '引き分け';
        gameOverModal.classList.add('visible');
    }
    
    // 捕獲された駒を表示
    renderCapturedPieces();
    
    // ボードを更新
    renderBoard();
}

// 駒の有効な移動先を取得
function getValidMoves(row, col, piece) {
    let moves = [];
    
    switch (piece.type) {
        case 'pawn':
            moves = getPawnMoves(row, col, piece);
            break;
        case 'rook':
            moves = getRookMoves(row, col, piece);
            break;
        case 'knight':
            moves = getKnightMoves(row, col, piece);
            break;
        case 'bishop':
            moves = getBishopMoves(row, col, piece);
            break;
        case 'queen':
            moves = getQueenMoves(row, col, piece);
            break;
        case 'king':
            moves = getKingMoves(row, col, piece);
            break;
    }
    
    // 自分のキングがチェックされるような移動を除外
    return moves.filter(move => !wouldResultInCheck(row, col, move.row, move.col, piece));
}

// ポーンの移動
function getPawnMoves(row, col, piece) {
    const moves = [];
    const direction = piece.color === 'white' ? -1 : 1;
    
    // 前に1マス
    if (isValidPosition(row + direction, col) && !board[row + direction][col]) {
        moves.push({ row: row + direction, col });
        
        // 初期位置から2マス
        if (!piece.moved && isValidPosition(row + 2 * direction, col) && !board[row + 2 * direction][col]) {
            moves.push({ row: row + 2 * direction, col });
        }
    }
    
    // 斜めの駒取り
    for (let colOffset of [-1, 1]) {
        const newCol = col + colOffset;
        const newRow = row + direction;
        
        if (isValidPosition(newRow, newCol) && board[newRow][newCol] && board[newRow][newCol].color !== piece.color) {
            moves.push({ row: newRow, col: newCol });
        }
    }
    
    return moves;
}

// ルークの移動
function getRookMoves(row, col, piece) {
    return getStraightMoves(row, col, piece);
}

// ナイトの移動
function getKnightMoves(row, col, piece) {
    const moves = [];
    const knightMoves = [
        { row: -2, col: -1 }, { row: -2, col: 1 },
        { row: -1, col: -2 }, { row: -1, col: 2 },
        { row: 1, col: -2 }, { row: 1, col: 2 },
        { row: 2, col: -1 }, { row: 2, col: 1 }
    ];
    
    for (const move of knightMoves) {
        const newRow = row + move.row;
        const newCol = col + move.col;
        
        if (isValidPosition(newRow, newCol) && (!board[newRow][newCol] || board[newRow][newCol].color !== piece.color)) {
            moves.push({ row: newRow, col: newCol });
        }
    }
    
    return moves;
}

// ビショップの移動
function getBishopMoves(row, col, piece) {
    return getDiagonalMoves(row, col, piece);
}

// クイーンの移動
function getQueenMoves(row, col, piece) {
    return [...getStraightMoves(row, col, piece), ...getDiagonalMoves(row, col, piece)];
}

// キングの移動
function getKingMoves(row, col, piece) {
    const moves = [];
    
    // 8方向の移動
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
            if (rowOffset === 0 && colOffset === 0) continue;
            
            const newRow = row + rowOffset;
            const newCol = col + colOffset;
            
            if (isValidPosition(newRow, newCol) && (!board[newRow][newCol] || board[newRow][newCol].color !== piece.color)) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    }
    
    return moves;
}

// 直線方向の移動（ルーク、クイーン）
function getStraightMoves(row, col, piece) {
    const moves = [];
    const directions = [
        { row: -1, col: 0 }, // 上
        { row: 1, col: 0 },  // 下
        { row: 0, col: -1 }, // 左
        { row: 0, col: 1 }   // 右
    ];
    
    for (const dir of directions) {
        let newRow = row + dir.row;
        let newCol = col + dir.col;
        
        while (isValidPosition(newRow, newCol)) {
            if (!board[newRow][newCol]) {
                // 空のマスは移動可能
                moves.push({ row: newRow, col: newCol });
            } else {
                // 他の駒がある場合
                if (board[newRow][newCol].color !== piece.color) {
                    // 相手の駒なら捕獲可能
                    moves.push({ row: newRow, col: newCol });
                }
                break;
            }
            
            newRow += dir.row;
            newCol += dir.col;
        }
    }
    
    return moves;
}

// 斜め方向の移動（ビショップ、クイーン）
function getDiagonalMoves(row, col, piece) {
    const moves = [];
    const directions = [
        { row: -1, col: -1 }, // 左上
        { row: -1, col: 1 },  // 右上
        { row: 1, col: -1 },  // 左下
        { row: 1, col: 1 }    // 右下
    ];
    
    for (const dir of directions) {
        let newRow = row + dir.row;
        let newCol = col + dir.col;
        
        while (isValidPosition(newRow, newCol)) {
            if (!board[newRow][newCol]) {
                // 空のマスは移動可能
                moves.push({ row: newRow, col: newCol });
            } else {
                // 他の駒がある場合
                if (board[newRow][newCol].color !== piece.color) {
                    // 相手の駒なら捕獲可能
                    moves.push({ row: newRow, col: newCol });
                }
                break;
            }
            
            newRow += dir.row;
            newCol += dir.col;
        }
    }
    
    return moves;
}

// 有効な位置かチェック
function isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// 指定した駒の移動がキングをチェック状態にするかどうか
function wouldResultInCheck(fromRow, fromCol, toRow, toCol, piece) {
    // 仮の移動を行う
    const originalPiece = board[toRow][toCol];
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;
    
    // キングの位置を仮更新
    let kingPosition = kings[piece.color];
    if (piece.type === 'king') {
        kingPosition = { row: toRow, col: toCol };
    }
    
    // チェック状態かをチェック
    const isInCheck = isKingInCheck(kingPosition.row, kingPosition.col, piece.color);
    
    // 元に戻す
    board[fromRow][fromCol] = piece;
    board[toRow][toCol] = originalPiece;
    
    return isInCheck;
}

// キングがチェック状態かチェック
function isKingInCheck(kingRow, kingCol, kingColor) {
    // すべての相手の駒について、キングを捕獲できるかチェック
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (!piece || piece.color === kingColor) continue;
            
            let moves = [];
            switch (piece.type) {
                case 'pawn':
                    moves = getPawnMoves(row, col, piece);
                    break;
                case 'rook':
                    moves = getRookMoves(row, col, piece);
                    break;
                case 'knight':
                    moves = getKnightMoves(row, col, piece);
                    break;
                case 'bishop':
                    moves = getBishopMoves(row, col, piece);
                    break;
                case 'queen':
                    moves = getQueenMoves(row, col, piece);
                    break;
                case 'king':
                    moves = getKingMoves(row, col, piece);
                    break;
            }
            
            for (const move of moves) {
                if (move.row === kingRow && move.col === kingCol) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

// チェック状態を更新
function updateCheckStatus() {
    isCheck.white = isKingInCheck(kings.white.row, kings.white.col, 'white');
    isCheck.black = isKingInCheck(kings.black.row, kings.black.col, 'black');
}

// チェックメイトかどうかチェック
function isCheckmate() {
    // 現在のプレイヤーがチェック状態でない場合はチェックメイトではない
    if ((currentTurn === 'white' && !isCheck.white) || (currentTurn === 'black' && !isCheck.black)) {
        return false;
    }
    
    // すべての駒について、有効な移動があるかチェック
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (!piece || piece.color !== currentTurn) continue;
            
            const moves = getValidMoves(row, col, piece);
            if (moves.length > 0) {
                return false;
            }
        }
    }
    
    // 有効な移動がなければチェックメイト
    return true;
}

// スタルメイト（ステイルメイト）かどうかチェック
function isStalemate() {
    // 現在のプレイヤーがチェック状態の場合はスタルメイトではない
    if ((currentTurn === 'white' && isCheck.white) || (currentTurn === 'black' && isCheck.black)) {
        return false;
    }
    
    // すべての駒について、有効な移動があるかチェック
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (!piece || piece.color !== currentTurn) continue;
            
            const moves = getValidMoves(row, col, piece);
            if (moves.length > 0) {
                return false;
            }
        }
    }
    
    // 有効な移動がなければスタルメイト
    return true;
}

// 駒の昇格モーダルを表示
function showPromotionModal(row, col, color, callback) {
    const promotionOptions = [
        { type: 'queen', symbol: color === 'white' ? PIECES.WHITE_QUEEN : PIECES.BLACK_QUEEN },
        { type: 'rook', symbol: color === 'white' ? PIECES.WHITE_ROOK : PIECES.BLACK_ROOK },
        { type: 'bishop', symbol: color === 'white' ? PIECES.WHITE_BISHOP : PIECES.BLACK_BISHOP },
        { type: 'knight', symbol: color === 'white' ? PIECES.WHITE_KNIGHT : PIECES.BLACK_KNIGHT }
    ];
    
    promotionPieces.innerHTML = '';
    
    promotionOptions.forEach(option => {
        const pieceElement = document.createElement('div');
        pieceElement.className = 'promotion-piece';
        pieceElement.textContent = option.symbol;
        
        pieceElement.addEventListener('click', () => {
            const promotedPiece = {
                type: option.type,
                color,
                symbol: option.symbol
            };
            
            promotionModal.style.display = 'none';
            callback(promotedPiece);
        });
        
        promotionPieces.appendChild(pieceElement);
    });
    
    promotionModal.style.display = 'block';
}

// 捕獲された駒を表示
function renderCapturedPieces() {
    whiteCaptured.innerHTML = '';
    blackCaptured.innerHTML = '';
    
    whiteCapturedPieces.forEach(piece => {
        const pieceElement = document.createElement('span');
        pieceElement.textContent = piece.symbol;
        whiteCaptured.appendChild(pieceElement);
    });
    
    blackCapturedPieces.forEach(piece => {
        const pieceElement = document.createElement('span');
        pieceElement.textContent = piece.symbol;
        blackCaptured.appendChild(pieceElement);
    });
}

// 棋譜に手を追加
function addMoveToHistory(fromRow, fromCol, toRow, toCol, piece, promotionType = null) {
    const fromFile = String.fromCharCode(97 + fromCol); // a, b, c, ...
    const fromRank = 8 - fromRow;
    const toFile = String.fromCharCode(97 + toCol);
    const toRank = 8 - toRow;
    
    let pieceSymbol = '';
    switch (piece.type) {
        case 'king': pieceSymbol = 'K'; break;
        case 'queen': pieceSymbol = 'Q'; break;
        case 'rook': pieceSymbol = 'R'; break;
        case 'bishop': pieceSymbol = 'B'; break;
        case 'knight': pieceSymbol = 'N'; break;
        case 'pawn': pieceSymbol = ''; break;
    }
    
    let moveText = `${pieceSymbol}${fromFile}${fromRank}-${toFile}${toRank}`;
    
    // 昇格の場合
    if (promotionType) {
        let promotionSymbol = '';
        switch (promotionType) {
            case 'queen': promotionSymbol = 'Q'; break;
            case 'rook': promotionSymbol = 'R'; break;
            case 'bishop': promotionSymbol = 'B'; break;
            case 'knight': promotionSymbol = 'N'; break;
        }
        moveText += `=${promotionSymbol}`;
    }
    
    // チェックやチェックメイトの表記
    if (isCheckmate()) {
        moveText += '#';
    } else if ((currentTurn === 'black' && isCheck.white) || (currentTurn === 'white' && isCheck.black)) {
        moveText += '+';
    }
    
    const moveItem = document.createElement('div');
    moveItem.className = 'move-item';
    moveItem.innerHTML = `<span>${gameHistory.length}.</span>${moveText}`;
    moveList.appendChild(moveItem);
    
    // スクロールを一番下に
    moveList.scrollTop = moveList.scrollHeight;
}

// 一手戻る
function undoMove() {
    if (gameHistory.length === 0) return;
    
    const lastMove = gameHistory.pop();
    
    // 元の位置に戻す
    board[lastMove.fromRow][lastMove.fromCol] = lastMove.piece;
    board[lastMove.toRow][lastMove.toCol] = lastMove.capturedPiece;
    
    // キングの位置を戻す
    kings = lastMove.kings;
    
    // チェック状態を戻す
    isCheck = lastMove.isCheck;
    
    // ターンを戻す
    currentTurn = currentTurn === 'white' ? 'black' : 'white';
    
    // 捕獲された駒のリストを更新
    if (lastMove.capturedPiece) {
        if (lastMove.capturedPiece.color === 'white') {
            blackCapturedPieces.pop();
        } else {
            whiteCapturedPieces.pop();
        }
    }
    
    // 棋譜から最後の手を削除
    if (moveList.lastChild) {
        moveList.removeChild(moveList.lastChild);
    }
    
    // 表示を更新
    renderCapturedPieces();
    renderBoard();
}

// 投了
function resignGame() {
    if (confirm(`${currentTurn === 'white' ? '白' : '黒'}が投了します。よろしいですか？`)) {
        gameResult.textContent = '投了';
        winner.textContent = `${currentTurn === 'white' ? '黒' : '白'}の勝利`;
        gameOverModal.classList.add('visible');
    }
}

// ゲームの初期化
initializeGame();