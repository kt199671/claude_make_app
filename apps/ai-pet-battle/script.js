// ペットの種類
const petTypes = ['🐱', '🐶', '🐰', '🐼', '🦊', '🐨', '🐸', '🐧', '🦁', '🐯'];
const petNames = ['ニャンコ', 'ワンコ', 'ウサピョン', 'パンダくん', 'キツネさん', 'コアラちゃん', 'ケロッピ', 'ペンペン', 'ライオン王', 'タイガー'];

// ゲーム状態
let gameState = {
    player: {
        name: '',
        pet: '',
        hp: 100,
        maxHp: 100,
        energy: 50,
        maxEnergy: 50,
        defending: false
    },
    enemy: {
        name: '',
        pet: '',
        hp: 100,
        maxHp: 100,
        energy: 50,
        maxEnergy: 50,
        defending: false
    },
    turn: 'player',
    gameOver: false
};

// 初期化
function initGame() {
    // ランダムにペットを選択
    const playerIndex = Math.floor(Math.random() * petTypes.length);
    let enemyIndex = Math.floor(Math.random() * petTypes.length);
    while (enemyIndex === playerIndex) {
        enemyIndex = Math.floor(Math.random() * petTypes.length);
    }
    
    gameState.player.pet = petTypes[playerIndex];
    gameState.player.name = petNames[playerIndex];
    gameState.enemy.pet = petTypes[enemyIndex];
    gameState.enemy.name = petNames[enemyIndex];
    
    // UI更新
    document.getElementById('playerPet').textContent = gameState.player.pet;
    document.getElementById('playerName').textContent = gameState.player.name;
    document.getElementById('enemyPet').textContent = gameState.enemy.pet;
    document.getElementById('enemyName').textContent = gameState.enemy.name;
    
    updateUI();
}

// UI更新
function updateUI() {
    // HP表示
    document.getElementById('playerHp').textContent = `${gameState.player.hp}/${gameState.player.maxHp}`;
    document.getElementById('enemyHp').textContent = `${gameState.enemy.hp}/${gameState.enemy.maxHp}`;
    
    // エネルギー表示
    document.getElementById('playerEnergy').textContent = `${gameState.player.energy}/${gameState.player.maxEnergy}`;
    document.getElementById('enemyEnergy').textContent = `${gameState.enemy.energy}/${gameState.enemy.maxEnergy}`;
    
    // HPバー更新
    document.getElementById('playerHealth').style.width = `${(gameState.player.hp / gameState.player.maxHp) * 100}%`;
    document.getElementById('enemyHealth').style.width = `${(gameState.enemy.hp / gameState.enemy.maxHp) * 100}%`;
    
    // ボタンの有効/無効
    const buttons = document.querySelectorAll('.action-btn');
    buttons.forEach(btn => {
        btn.disabled = gameState.gameOver || gameState.turn !== 'player';
    });
    
    // エネルギー不足のボタンを無効化
    if (gameState.player.energy < 10) buttons[0].disabled = true; // 攻撃
    if (gameState.player.energy < 5) buttons[1].disabled = true;  // 防御
    if (gameState.player.energy < 30) buttons[2].disabled = true; // 必殺技
    if (gameState.player.energy < 20) buttons[3].disabled = true; // 回復
}

// バトルログに追加
function addLog(message) {
    const log = document.getElementById('battleLog');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = message;
    log.insertBefore(entry, log.firstChild);
    
    // ログが多すぎる場合は古いものを削除
    while (log.children.length > 10) {
        log.removeChild(log.lastChild);
    }
}

// エフェクト表示
function showEffect(target, text, color) {
    const pet = document.getElementById(target === 'player' ? 'playerPet' : 'enemyPet');
    const effect = document.createElement('div');
    effect.className = 'effect';
    effect.textContent = text;
    effect.style.color = color;
    effect.style.position = 'fixed';
    effect.style.left = pet.getBoundingClientRect().left + 'px';
    effect.style.top = pet.getBoundingClientRect().top + 'px';
    document.body.appendChild(effect);
    
    setTimeout(() => {
        document.body.removeChild(effect);
    }, 1000);
}

// ペットアニメーション
function animatePet(target, animation) {
    const pet = document.getElementById(target === 'player' ? 'playerPet' : 'enemyPet');
    pet.classList.add(animation);
    setTimeout(() => {
        pet.classList.remove(animation);
    }, 500);
}

// プレイヤーアクション
function playerAction(action) {
    if (gameState.gameOver || gameState.turn !== 'player') return;
    
    gameState.player.defending = false;
    
    switch (action) {
        case 'attack':
            if (gameState.player.energy >= 10) {
                const damage = Math.floor(Math.random() * 15) + 15;
                const actualDamage = gameState.enemy.defending ? Math.floor(damage / 2) : damage;
                gameState.enemy.hp = Math.max(0, gameState.enemy.hp - actualDamage);
                gameState.player.energy -= 10;
                
                animatePet('player', 'attacking');
                animatePet('enemy', 'hurt');
                showEffect('enemy', `-${actualDamage}`, '#ff6b6b');
                
                addLog(`${gameState.player.name}の攻撃！ <span class="damage">${actualDamage}ダメージ</span>${gameState.enemy.defending ? ' (防御中)' : ''}`);
            }
            break;
            
        case 'defend':
            if (gameState.player.energy >= 5) {
                gameState.player.defending = true;
                gameState.player.energy -= 5;
                gameState.player.energy = Math.min(gameState.player.maxEnergy, gameState.player.energy + 10);
                
                showEffect('player', '🛡️', '#4ecdc4');
                addLog(`${gameState.player.name}は防御態勢を取った！エネルギーも少し回復`);
            }
            break;
            
        case 'special':
            if (gameState.player.energy >= 30) {
                const damage = Math.floor(Math.random() * 20) + 35;
                const actualDamage = gameState.enemy.defending ? Math.floor(damage / 2) : damage;
                gameState.enemy.hp = Math.max(0, gameState.enemy.hp - actualDamage);
                gameState.player.energy -= 30;
                
                animatePet('player', 'attacking');
                animatePet('enemy', 'hurt');
                showEffect('enemy', `-${actualDamage}`, '#ffd93d');
                
                addLog(`${gameState.player.name}の<span class="special">必殺技</span>！ <span class="damage">${actualDamage}ダメージ</span>${gameState.enemy.defending ? ' (防御中)' : ''}`);
            }
            break;
            
        case 'heal':
            if (gameState.player.energy >= 20) {
                const healAmount = Math.floor(Math.random() * 20) + 25;
                gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + healAmount);
                gameState.player.energy -= 20;
                
                showEffect('player', `+${healAmount}`, '#4ecdc4');
                addLog(`${gameState.player.name}は<span class="heal">${healAmount}HP回復</span>した！`);
            }
            break;
    }
    
    updateUI();
    checkGameOver();
    
    if (!gameState.gameOver) {
        gameState.turn = 'enemy';
        setTimeout(enemyTurn, 1000);
    }
}

// 敵AI
function enemyTurn() {
    if (gameState.gameOver) return;
    
    gameState.enemy.defending = false;
    
    // AI戦略
    const hp_ratio = gameState.enemy.hp / gameState.enemy.maxHp;
    const energy = gameState.enemy.energy;
    
    let action;
    
    if (hp_ratio < 0.3 && energy >= 20) {
        action = 'heal';
    } else if (energy >= 30 && Math.random() < 0.3) {
        action = 'special';
    } else if (hp_ratio < 0.5 && Math.random() < 0.4 && energy >= 5) {
        action = 'defend';
    } else if (energy >= 10) {
        action = 'attack';
    } else {
        action = 'defend';
    }
    
    // アクション実行
    switch (action) {
        case 'attack':
            if (energy >= 10) {
                const damage = Math.floor(Math.random() * 15) + 15;
                const actualDamage = gameState.player.defending ? Math.floor(damage / 2) : damage;
                gameState.player.hp = Math.max(0, gameState.player.hp - actualDamage);
                gameState.enemy.energy -= 10;
                
                animatePet('enemy', 'attacking');
                animatePet('player', 'hurt');
                showEffect('player', `-${actualDamage}`, '#ff6b6b');
                
                addLog(`${gameState.enemy.name}の攻撃！ <span class="damage">${actualDamage}ダメージ</span>${gameState.player.defending ? ' (防御中)' : ''}`);
            }
            break;
            
        case 'defend':
            gameState.enemy.defending = true;
            gameState.enemy.energy -= 5;
            gameState.enemy.energy = Math.min(gameState.enemy.maxEnergy, gameState.enemy.energy + 10);
            
            showEffect('enemy', '🛡️', '#4ecdc4');
            addLog(`${gameState.enemy.name}は防御態勢を取った！エネルギーも少し回復`);
            break;
            
        case 'special':
            if (energy >= 30) {
                const damage = Math.floor(Math.random() * 20) + 35;
                const actualDamage = gameState.player.defending ? Math.floor(damage / 2) : damage;
                gameState.player.hp = Math.max(0, gameState.player.hp - actualDamage);
                gameState.enemy.energy -= 30;
                
                animatePet('enemy', 'attacking');
                animatePet('player', 'hurt');
                showEffect('player', `-${actualDamage}`, '#ffd93d');
                
                addLog(`${gameState.enemy.name}の<span class="special">必殺技</span>！ <span class="damage">${actualDamage}ダメージ</span>${gameState.player.defending ? ' (防御中)' : ''}`);
            }
            break;
            
        case 'heal':
            if (energy >= 20) {
                const healAmount = Math.floor(Math.random() * 20) + 25;
                gameState.enemy.hp = Math.min(gameState.enemy.maxHp, gameState.enemy.hp + healAmount);
                gameState.enemy.energy -= 20;
                
                showEffect('enemy', `+${healAmount}`, '#4ecdc4');
                addLog(`${gameState.enemy.name}は<span class="heal">${healAmount}HP回復</span>した！`);
            }
            break;
    }
    
    // エネルギー回復
    gameState.player.energy = Math.min(gameState.player.maxEnergy, gameState.player.energy + 5);
    gameState.enemy.energy = Math.min(gameState.enemy.maxEnergy, gameState.enemy.energy + 5);
    
    updateUI();
    checkGameOver();
    
    gameState.turn = 'player';
}

// ゲーム終了チェック
function checkGameOver() {
    if (gameState.player.hp <= 0 || gameState.enemy.hp <= 0) {
        gameState.gameOver = true;
        
        const gameOverSection = document.getElementById('gameOverSection');
        const gameOverText = document.getElementById('gameOverText');
        
        if (gameState.player.hp <= 0) {
            gameOverText.textContent = `${gameState.enemy.name}の勝利！`;
            addLog(`<span class="damage">${gameState.player.name}は倒れた...</span>`);
        } else {
            gameOverText.textContent = `${gameState.player.name}の勝利！`;
            addLog(`<span class="special">${gameState.enemy.name}を倒した！</span>`);
        }
        
        gameOverSection.style.display = 'block';
        updateUI();
    }
}

// ゲームリスタート
function restartGame() {
    gameState = {
        player: {
            name: '',
            pet: '',
            hp: 100,
            maxHp: 100,
            energy: 50,
            maxEnergy: 50,
            defending: false
        },
        enemy: {
            name: '',
            pet: '',
            hp: 100,
            maxHp: 100,
            energy: 50,
            maxEnergy: 50,
            defending: false
        },
        turn: 'player',
        gameOver: false
    };
    
    document.getElementById('gameOverSection').style.display = 'none';
    document.getElementById('battleLog').innerHTML = '<div class="log-entry">バトル開始！</div>';
    
    initGame();
}

// ゲーム開始
initGame();