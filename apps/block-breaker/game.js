// ネオンブレイカー - 超進化ブロック崩しゲーム
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ゲーム状態
let gameState = {
    running: false,
    paused: false,
    level: 1,
    score: 0,
    lives: 3,
    combo: 0,
    maxCombo: 0,
    startTime: Date.now(),
    difficulty: 'normal',
    specialPower: 0,
    currentPowerUp: null,
    powerUpDuration: 0
};

// ボール設定
let balls = [];
const ballRadius = 8;

// パドル設定
let paddle = {
    x: canvas.width / 2 - 75,
    y: canvas.height - 30,
    width: 150,
    height: 12,
    speed: 10,
    normalWidth: 150
};

// ブロック設定
const brickRows = 8;
const brickCols = 12;
const brickWidth = 70;
const brickHeight = 25;
const brickPadding = 5;
const brickOffsetTop = 80;
const brickOffsetLeft = 15;

let bricks = [];
let particles = [];
let powerUps = [];

// パワーアップの種類
const powerUpTypes = {
    SPEED: { icon: '🚀', color: '#ff4444', duration: 5000 },
    WIDE_PADDLE: { icon: '📏', color: '#44ff44', duration: 8000 },
    LASER: { icon: '⚡', color: '#ffff44', duration: 6000 },
    BOMB: { icon: '💥', color: '#ff8844', duration: 10000 },
    MULTI_BALL: { icon: '🌟', color: '#8844ff', duration: 0 },
    FIRE_BALL: { icon: '🔥', color: '#ff0088', duration: 7000 }
};

// 実績システム
let achievements = JSON.parse(localStorage.getItem('neonBreakerAchievements')) || [];
const achievementDefinitions = [
    { id: 'first_block', name: '初撃破', description: '最初のブロックを破壊', icon: '🎯' },
    { id: 'combo_10', name: 'コンボマスター', description: '10コンボ達成', icon: '⚡' },
    { id: 'level_5', name: 'レベル5突破', description: 'レベル5に到達', icon: '🏆' },
    { id: 'score_10000', name: 'スコアマスター', description: '10000点獲得', icon: '💎' },
    { id: 'perfect_level', name: 'パーフェクト', description: 'ライフを減らさずにレベルクリア', icon: '👑' },
    { id: 'multi_ball_master', name: 'マルチボールマスター', description: 'マルチボール中に50ブロック破壊', icon: '🌟' }
];

// 入力処理
let keys = {};
let mouseX = canvas.width / 2;

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ') {
        e.preventDefault();
        if (!gameState.running) startGame();
        else pauseGame();
    }
    if (e.key === 'Enter') {
        e.preventDefault();
        activateSpecialPower();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
});

// 難易度設定
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameState.difficulty = btn.dataset.difficulty;
        resetGame();
    });
});

// ゲーム初期化
function initGame() {
    // ボール初期化
    balls = [{
        x: canvas.width / 2,
        y: canvas.height - 60,
        dx: 4,
        dy: -4,
        radius: ballRadius,
        type: 'normal',
        trail: []
    }];
    
    // ブロック初期化
    initBricks();
    
    // パドル初期化
    paddle.x = canvas.width / 2 - paddle.width / 2;
    paddle.width = paddle.normalWidth;
    
    // UI更新
    updateUI();
}

function initBricks() {
    bricks = [];
    for (let row = 0; row < brickRows; row++) {
        for (let col = 0; col < brickCols; col++) {
            const x = col * (brickWidth + brickPadding) + brickOffsetLeft;
            const y = row * (brickHeight + brickPadding) + brickOffsetTop;
            
            // 特殊ブロックの確率
            let type = 'normal';
            const rand = Math.random();
            if (rand < 0.1) type = 'strong';
            else if (rand < 0.15) type = 'powerup';
            else if (rand < 0.2) type = 'bomb';
            
            bricks.push({
                x, y,
                width: brickWidth,
                height: brickHeight,
                type,
                health: type === 'strong' ? 3 : 1,
                maxHealth: type === 'strong' ? 3 : 1,
                destroyed: false,
                animation: 0
            });
        }
    }
}

// ゲーム開始
function startGame() {
    if (!gameState.running) {
        gameState.running = true;
        gameState.startTime = Date.now();
        gameLoop();
    }
}

// ゲームループ
function gameLoop() {
    if (!gameState.running) return;
    
    if (!gameState.paused) {
        update();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// ゲーム更新
function update() {
    // パドル移動
    if (keys['a'] || keys['arrowleft']) {
        paddle.x = Math.max(0, paddle.x - paddle.speed);
    }
    if (keys['d'] || keys['arrowright']) {
        paddle.x = Math.min(canvas.width - paddle.width, paddle.x + paddle.speed);
    }
    
    // マウスでパドル操作
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, mouseX - paddle.width / 2));
    
    // ボール更新
    balls.forEach((ball, ballIndex) => {
        // 軌跡の更新
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 10) ball.trail.shift();
        
        ball.x += ball.dx;
        ball.y += ball.dy;
        
        // 壁との衝突
        if (ball.x <= ball.radius || ball.x >= canvas.width - ball.radius) {
            ball.dx = -ball.dx;
            createParticles(ball.x, ball.y, '#00ffff', 5);
        }
        if (ball.y <= ball.radius) {
            ball.dy = -ball.dy;
            createParticles(ball.x, ball.y, '#00ffff', 5);
        }
        
        // パドルとの衝突
        if (ball.y + ball.radius >= paddle.y && 
            ball.x >= paddle.x && 
            ball.x <= paddle.x + paddle.width &&
            ball.dy > 0) {
            
            // パドルの位置によって反射角度を変更
            const relativeIntersectX = ball.x - (paddle.x + paddle.width / 2);
            const normalizedIntersectX = relativeIntersectX / (paddle.width / 2);
            const bounceAngle = normalizedIntersectX * Math.PI / 3;
            
            const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            ball.dx = speed * Math.sin(bounceAngle);
            ball.dy = -speed * Math.cos(bounceAngle);
            
            createParticles(ball.x, ball.y, '#ffff00', 8);
            playSound('paddle');
        }
        
        // ボールが下に落ちた場合
        if (ball.y > canvas.height + 50) {
            balls.splice(ballIndex, 1);
        }
    });
    
    // ボールがすべてなくなった場合
    if (balls.length === 0) {
        gameState.lives--;
        gameState.combo = 0;
        
        if (gameState.lives <= 0) {
            gameOver();
        } else {
            // 新しいボールを作成
            balls.push({
                x: canvas.width / 2,
                y: canvas.height - 60,
                dx: 4,
                dy: -4,
                radius: ballRadius,
                type: 'normal',
                trail: []
            });
        }
    }
    
    // ブロックとの衝突検出
    balls.forEach(ball => {
        bricks.forEach(brick => {
            if (!brick.destroyed && isColliding(ball, brick)) {
                handleBrickCollision(ball, brick);
            }
        });
    });
    
    // パワーアップの更新
    updatePowerUps();
    
    // パーティクルの更新
    updateParticles();
    
    // レベルクリアチェック
    if (bricks.every(brick => brick.destroyed)) {
        nextLevel();
    }
    
    // UI更新
    updateUI();
}

// 衝突検出
function isColliding(ball, brick) {
    return ball.x + ball.radius >= brick.x &&
           ball.x - ball.radius <= brick.x + brick.width &&
           ball.y + ball.radius >= brick.y &&
           ball.y - ball.radius <= brick.y + brick.height;
}

// ブロック衝突処理
function handleBrickCollision(ball, brick) {
    // ボール反射
    const ballCenterX = ball.x;
    const ballCenterY = ball.y;
    const brickCenterX = brick.x + brick.width / 2;
    const brickCenterY = brick.y + brick.height / 2;
    
    const deltaX = ballCenterX - brickCenterX;
    const deltaY = ballCenterY - brickCenterY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        ball.dx = -ball.dx;
    } else {
        ball.dy = -ball.dy;
    }
    
    // ブロックダメージ
    brick.health--;
    
    if (brick.health <= 0) {
        brick.destroyed = true;
        gameState.score += 100 * gameState.level;
        gameState.combo++;
        
        // スペシャルパワーチャージ
        gameState.specialPower = Math.min(100, gameState.specialPower + 10);
        
        // コンボボーナス
        if (gameState.combo > 5) {
            gameState.score += gameState.combo * 50;
            showComboText(gameState.combo);
        }
        
        // パワーアップドロップ
        if (brick.type === 'powerup' || Math.random() < 0.15) {
            createPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);
        }
        
        // 爆弾ブロック
        if (brick.type === 'bomb') {
            explodeBricks(brick.x + brick.width / 2, brick.y + brick.height / 2, 100);
        }
        
        // パーティクル生成
        createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, 
                       getBrickColor(brick), 15);
        
        checkAchievements();
        playSound('break');
    } else {
        // ダメージエフェクト
        createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2,
                       getBrickColor(brick), 5);
        playSound('hit');
    }
}

// パワーアップ生成
function createPowerUp(x, y) {
    const types = Object.keys(powerUpTypes);
    const type = types[Math.floor(Math.random() * types.length)];
    
    powerUps.push({
        x, y,
        type,
        dy: 2,
        width: 30,
        height: 30,
        rotation: 0
    });
}

// パワーアップ更新
function updatePowerUps() {
    powerUps.forEach((powerUp, index) => {
        powerUp.y += powerUp.dy;
        powerUp.rotation += 0.1;
        
        // パドルとの衝突
        if (powerUp.y + powerUp.height >= paddle.y &&
            powerUp.x + powerUp.width >= paddle.x &&
            powerUp.x <= paddle.x + paddle.width) {
            
            activatePowerUp(powerUp.type);
            powerUps.splice(index, 1);
            playSound('powerup');
        }
        
        // 画面外に出た場合
        if (powerUp.y > canvas.height) {
            powerUps.splice(index, 1);
        }
    });
    
    // パワーアップ効果の持続時間
    if (gameState.currentPowerUp && gameState.powerUpDuration > 0) {
        gameState.powerUpDuration -= 16; // 60FPSでの1フレーム時間
        
        if (gameState.powerUpDuration <= 0) {
            deactivatePowerUp();
        }
    }
}

// パワーアップ発動
function activatePowerUp(type) {
    gameState.currentPowerUp = type;
    gameState.powerUpDuration = powerUpTypes[type].duration;
    
    switch (type) {
        case 'SPEED':
            balls.forEach(ball => {
                ball.dx *= 1.5;
                ball.dy *= 1.5;
            });
            break;
            
        case 'WIDE_PADDLE':
            paddle.width = paddle.normalWidth * 1.5;
            break;
            
        case 'LASER':
            balls.forEach(ball => ball.type = 'laser');
            break;
            
        case 'BOMB':
            balls.forEach(ball => ball.type = 'bomb');
            break;
            
        case 'MULTI_BALL':
            const originalBall = balls[0];
            if (originalBall) {
                for (let i = 0; i < 2; i++) {
                    balls.push({
                        x: originalBall.x,
                        y: originalBall.y,
                        dx: originalBall.dx + (Math.random() - 0.5) * 4,
                        dy: originalBall.dy + (Math.random() - 0.5) * 2,
                        radius: ballRadius,
                        type: originalBall.type,
                        trail: []
                    });
                }
            }
            break;
            
        case 'FIRE_BALL':
            balls.forEach(ball => ball.type = 'fire');
            break;
    }
}

// パワーアップ解除
function deactivatePowerUp() {
    switch (gameState.currentPowerUp) {
        case 'SPEED':
            balls.forEach(ball => {
                ball.dx /= 1.5;
                ball.dy /= 1.5;
            });
            break;
            
        case 'WIDE_PADDLE':
            paddle.width = paddle.normalWidth;
            break;
            
        case 'LASER':
        case 'BOMB':
        case 'FIRE_BALL':
            balls.forEach(ball => ball.type = 'normal');
            break;
    }
    
    gameState.currentPowerUp = null;
    gameState.powerUpDuration = 0;
}

// 爆発効果
function explodeBricks(x, y, radius) {
    bricks.forEach(brick => {
        const brickCenterX = brick.x + brick.width / 2;
        const brickCenterY = brick.y + brick.height / 2;
        const distance = Math.sqrt((x - brickCenterX) ** 2 + (y - brickCenterY) ** 2);
        
        if (distance <= radius && !brick.destroyed) {
            brick.destroyed = true;
            gameState.score += 150 * gameState.level;
            createParticles(brickCenterX, brickCenterY, getBrickColor(brick), 20);
        }
    });
    
    // 爆発パーティクル
    createParticles(x, y, '#ff8800', 30);
}

// パーティクルシステム
function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            dx: (Math.random() - 0.5) * 10,
            dy: (Math.random() - 0.5) * 10,
            life: 60,
            maxLife: 60,
            color,
            size: Math.random() * 4 + 2
        });
    }
}

function updateParticles() {
    particles.forEach((particle, index) => {
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.dx *= 0.98;
        particle.dy *= 0.98;
        particle.life--;
        
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
}

// 描画関数群
function draw() {
    // 背景クリア
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // ブロック描画
    drawBricks();
    
    // ボール描画
    drawBalls();
    
    // パドル描画
    drawPaddle();
    
    // パワーアップ描画
    drawPowerUps();
    
    // パーティクル描画
    drawParticles();
    
    // UI効果描画
    drawEffects();
}

function drawBricks() {
    bricks.forEach(brick => {
        if (!brick.destroyed) {
            const alpha = brick.health / brick.maxHealth;
            ctx.save();
            ctx.globalAlpha = alpha;
            
            // ブロックのグロー効果
            ctx.shadowColor = getBrickColor(brick);
            ctx.shadowBlur = 10;
            
            ctx.fillStyle = getBrickColor(brick);
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            
            // ボーダー
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            
            // 特殊ブロックアイコン
            if (brick.type !== 'normal') {
                ctx.fillStyle = '#ffffff';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                const iconX = brick.x + brick.width / 2;
                const iconY = brick.y + brick.height / 2 + 6;
                
                switch (brick.type) {
                    case 'strong': ctx.fillText('💪', iconX, iconY); break;
                    case 'powerup': ctx.fillText('🎁', iconX, iconY); break;
                    case 'bomb': ctx.fillText('💣', iconX, iconY); break;
                }
            }
            
            ctx.restore();
        }
    });
}

function drawBalls() {
    balls.forEach(ball => {
        // 軌跡描画
        if (ball.trail.length > 1) {
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ball.trail.forEach((point, index) => {
                ctx.globalAlpha = index / ball.trail.length * 0.5;
                if (index === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        // ボール描画
        ctx.save();
        ctx.shadowColor = getBallColor(ball);
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = getBallColor(ball);
        ctx.fill();
        
        // ボールタイプ別エフェクト
        if (ball.type === 'fire') {
            ctx.fillStyle = '#ff4400';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🔥', ball.x, ball.y + 4);
        }
        
        ctx.restore();
    });
}

function drawPaddle() {
    ctx.save();
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    
    // パドルグラデーション
    const gradient = ctx.createLinearGradient(paddle.x, paddle.y, 
                                            paddle.x + paddle.width, paddle.y);
    gradient.addColorStop(0, '#ff00ff');
    gradient.addColorStop(0.5, '#00ffff');
    gradient.addColorStop(1, '#ffff00');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // パドルボーダー
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    ctx.restore();
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        ctx.save();
        ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
        ctx.rotate(powerUp.rotation);
        
        ctx.shadowColor = powerUpTypes[powerUp.type].color;
        ctx.shadowBlur = 15;
        
        ctx.fillStyle = powerUpTypes[powerUp.type].color;
        ctx.fillRect(-powerUp.width / 2, -powerUp.height / 2, powerUp.width, powerUp.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(powerUpTypes[powerUp.type].icon, 0, 6);
        
        ctx.restore();
    });
}

function drawParticles() {
    particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        ctx.globalAlpha = alpha;
        
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function drawEffects() {
    // パワーアップ効果の視覚表示
    if (gameState.currentPowerUp) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
}

// ユーティリティ関数
function getBrickColor(brick) {
    const colors = {
        normal: '#00ffff',
        strong: '#ff8800',
        powerup: '#ff00ff',
        bomb: '#ff4444'
    };
    return colors[brick.type] || '#00ffff';
}

function getBallColor(ball) {
    const colors = {
        normal: '#00ffff',
        laser: '#ffff00',
        bomb: '#ff8800',
        fire: '#ff4400'
    };
    return colors[ball.type] || '#00ffff';
}

// UI更新
function updateUI() {
    document.getElementById('score').textContent = gameState.score.toLocaleString();
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('combo').textContent = gameState.combo;
    
    // ライフ表示
    const heartsText = '❤️'.repeat(gameState.lives) + '🖤'.repeat(3 - gameState.lives);
    document.getElementById('lives').textContent = heartsText;
    
    // 時間表示
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // スペシャルパワー表示
    document.getElementById('powerFill').style.width = gameState.specialPower + '%';
    document.getElementById('powerText').textContent = 
        gameState.specialPower >= 100 ? '発動可能！' : 'チャージ中...';
}

// ゲーム制御関数
function pauseGame() {
    gameState.paused = !gameState.paused;
    document.getElementById('pauseBtn').textContent = gameState.paused ? '▶️ 再開' : '⏸️ ポーズ';
}

function activateSpecialPower() {
    if (gameState.specialPower >= 100) {
        gameState.specialPower = 0;
        
        // 全ブロックに大ダメージ
        bricks.forEach(brick => {
            if (!brick.destroyed) {
                brick.health = Math.max(0, brick.health - 2);
                if (brick.health <= 0) {
                    brick.destroyed = true;
                    gameState.score += 200 * gameState.level;
                    createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2,
                                   getBrickColor(brick), 10);
                }
            }
        });
        
        playSound('special');
        showComboText('SPECIAL ATTACK!');
    }
}

function nextLevel() {
    gameState.level++;
    gameState.combo = 0;
    
    // 難易度上昇
    balls.forEach(ball => {
        ball.dx *= 1.1;
        ball.dy *= 1.1;
    });
    
    initBricks();
    playSound('levelup');
}

function gameOver() {
    gameState.running = false;
    
    // 最終スコア保存
    const stats = JSON.parse(localStorage.getItem('neonBreakerStats')) || [];
    stats.push({
        score: gameState.score,
        level: gameState.level,
        date: new Date().toISOString(),
        difficulty: gameState.difficulty
    });
    
    // 上位10位まで保存
    stats.sort((a, b) => b.score - a.score);
    stats.splice(10);
    localStorage.setItem('neonBreakerStats', JSON.stringify(stats));
    
    // ゲームオーバー画面表示
    document.getElementById('finalScore').textContent = gameState.score.toLocaleString();
    document.getElementById('finalLevel').textContent = gameState.level;
    document.getElementById('finalCombo').textContent = gameState.maxCombo;
    
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('finalTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    showModal('gameOverModal');
}

function resetGame() {
    gameState = {
        running: false,
        paused: false,
        level: 1,
        score: 0,
        lives: 3,
        combo: 0,
        maxCombo: 0,
        startTime: Date.now(),
        difficulty: gameState.difficulty,
        specialPower: 0,
        currentPowerUp: null,
        powerUpDuration: 0
    };
    
    balls = [];
    particles = [];
    powerUps = [];
    
    initGame();
}

function restartGame() {
    closeModal('gameOverModal');
    resetGame();
    startGame();
}

// モーダル制御
function showModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function showInstructions() {
    showModal('instructionsModal');
}

// 実績システム
function checkAchievements() {
    achievementDefinitions.forEach(achievement => {
        if (achievements.includes(achievement.id)) return;
        
        let unlocked = false;
        
        switch (achievement.id) {
            case 'first_block':
                unlocked = gameState.score > 0;
                break;
            case 'combo_10':
                unlocked = gameState.combo >= 10;
                break;
            case 'level_5':
                unlocked = gameState.level >= 5;
                break;
            case 'score_10000':
                unlocked = gameState.score >= 10000;
                break;
            case 'perfect_level':
                unlocked = gameState.lives === 3 && gameState.level > 1;
                break;
        }
        
        if (unlocked) {
            achievements.push(achievement.id);
            localStorage.setItem('neonBreakerAchievements', JSON.stringify(achievements));
            showAchievement(achievement);
        }
    });
    
    updateAchievementsDisplay();
}

function showAchievement(achievement) {
    // 実績解除通知の表示
    console.log(`Achievement unlocked: ${achievement.name}`);
}

function updateAchievementsDisplay() {
    const list = document.getElementById('achievementsList');
    list.innerHTML = '';
    
    achievements.forEach(id => {
        const achievement = achievementDefinitions.find(a => a.id === id);
        if (achievement) {
            const item = document.createElement('div');
            item.className = 'achievement-item';
            item.innerHTML = `
                <span>${achievement.icon}</span>
                <div>
                    <div style="font-weight: bold;">${achievement.name}</div>
                    <div style="font-size: 0.8rem; opacity: 0.8;">${achievement.description}</div>
                </div>
            `;
            list.appendChild(item);
        }
    });
}

// コンボ表示
function showComboText(text) {
    const display = document.getElementById('comboDisplay');
    display.textContent = text;
    display.style.opacity = '1';
    display.style.transform = 'translate(-50%, -50%) scale(1.2)';
    
    setTimeout(() => {
        display.style.opacity = '0';
        display.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 1000);
    
    if (gameState.combo > gameState.maxCombo) {
        gameState.maxCombo = gameState.combo;
    }
}

// 音楽制御
let musicEnabled = false;

function toggleMusic() {
    musicEnabled = !musicEnabled;
    const music = document.getElementById('bgMusic');
    
    if (musicEnabled) {
        music.play().catch(() => {});
        document.querySelector('button[onclick="toggleMusic()"]').textContent = '🔇 音楽';
    } else {
        music.pause();
        document.querySelector('button[onclick="toggleMusic()"]').textContent = '🎵 音楽';
    }
}

// サウンド再生
function playSound(type) {
    if (!musicEnabled) return;
    
    // プレースホルダー - 実際のサウンドファイルが必要
    console.log(`Playing sound: ${type}`);
}

// ランキング表示
function showLeaderboard() {
    const stats = JSON.parse(localStorage.getItem('neonBreakerStats')) || [];
    alert(`ハイスコア:\n${stats.slice(0, 5).map((s, i) => `${i + 1}. ${s.score.toLocaleString()}点 (Lv.${s.level})`).join('\n')}`);
}

// 初期化
initGame();
updateAchievementsDisplay();