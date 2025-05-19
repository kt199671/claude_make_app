const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverDiv = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// ゲーム設定
const ballRadius = 10;
const paddleHeight = 10;
const paddleWidth = 100;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballSpeedX = 4;
let ballSpeedY = -4;
let paddleX = (canvas.width - paddleWidth) / 2;
let score = 0;
let gameRunning = true;

// ブロック設定
const brickRowCount = 5;
const brickColumnCount = 10;
const brickWidth = 70;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 60;
const brickOffsetLeft = 35;

// ブロック配列
let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// キー入力
let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
restartBtn.addEventListener("click", restartGame);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    let relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

// ボール描画
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// パドル描画
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// ブロック描画
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = `hsl(${r * 60}, 70%, 50%)`;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// 衝突検出
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                if (ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight) {
                    ballSpeedY = -ballSpeedY;
                    b.status = 0;
                    score++;
                    scoreElement.textContent = score;
                    
                    // 全てのブロックを破壊したらクリア
                    if (score === brickRowCount * brickColumnCount) {
                        gameOver(true);
                    }
                }
            }
        }
    }
}

// ゲームオーバー
function gameOver(victory = false) {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverDiv.style.display = 'block';
    if (victory) {
        gameOverDiv.querySelector('h2').textContent = 'クリア！おめでとうございます！';
    }
}

// ゲームリスタート
function restartGame() {
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    ballSpeedX = 4;
    ballSpeedY = -4;
    paddleX = (canvas.width - paddleWidth) / 2;
    score = 0;
    scoreElement.textContent = score;
    gameRunning = true;
    gameOverDiv.style.display = 'none';
    
    // ブロックをリセット
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r].status = 1;
        }
    }
}

// ゲームループ
function draw() {
    if (!gameRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    
    // ボールの移動
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    
    // 壁との衝突
    if (ballX + ballSpeedX > canvas.width - ballRadius || ballX + ballSpeedX < ballRadius) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballY + ballSpeedY < ballRadius) {
        ballSpeedY = -ballSpeedY;
    } else if (ballY + ballSpeedY > canvas.height - ballRadius) {
        // パドルとの衝突検出
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            // パドルのどこに当たったかで角度を変える
            let relativeIntersectX = ballX - (paddleX + paddleWidth / 2);
            let normalizedRelativeIntersectionX = relativeIntersectX / (paddleWidth / 2);
            let bounceAngle = normalizedRelativeIntersectionX * Math.PI / 3;
            
            ballSpeedX = 5 * Math.sin(bounceAngle);
            ballSpeedY = -5 * Math.cos(bounceAngle);
        } else {
            gameOver();
        }
    }
    
    // パドル移動
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }
    
    requestAnimationFrame(draw);
}

draw();