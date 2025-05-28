// ペットの状態
let pet = {
    name: 'たまご',
    age: 0,
    happiness: 100,
    hunger: 50,
    energy: 100,
    isAlive: true,
    stage: 'egg' // egg, baby, child, adult
};

// ペットの絵文字
const petEmojis = {
    egg: '🥚',
    baby: '🐣',
    child: '🐥',
    adult: '🐓',
    dead: '💀',
    sleeping: '😴',
    eating: '😋',
    playing: '😊'
};

// ゲームループ
let gameInterval;
let ageInterval;

// ゲーム開始
function startGame() {
    gameInterval = setInterval(updateGame, 1000);
    ageInterval = setInterval(agePet, 10000); // 10秒ごとに年齢が増える
    updateDisplay();
}

// ゲーム更新
function updateGame() {
    if (!pet.isAlive) return;

    // ステータスの自然減少
    pet.happiness = Math.max(0, pet.happiness - 1);
    pet.hunger = Math.min(100, pet.hunger + 2);
    pet.energy = Math.max(0, pet.energy - 0.5);

    // 死亡判定
    if (pet.happiness <= 0 || pet.hunger >= 100 || pet.energy <= 0) {
        pet.isAlive = false;
        gameOver();
    }

    updateDisplay();
}

// 年齢増加
function agePet() {
    if (!pet.isAlive) return;
    
    pet.age++;
    
    // 成長段階の更新
    if (pet.age >= 3 && pet.stage === 'egg') {
        pet.stage = 'baby';
        pet.name = 'ひよこ';
        showMessage('たまごが孵化しました！');
    } else if (pet.age >= 10 && pet.stage === 'baby') {
        pet.stage = 'child';
        pet.name = 'こっこ';
        showMessage('ひよこが成長しました！');
    } else if (pet.age >= 20 && pet.stage === 'child') {
        pet.stage = 'adult';
        pet.name = 'にわとり';
        showMessage('立派な大人になりました！');
    }
    
    updateDisplay();
}

// 餌をあげる
function feedPet() {
    if (!pet.isAlive) return;
    
    pet.hunger = Math.max(0, pet.hunger - 30);
    pet.happiness = Math.min(100, pet.happiness + 10);
    
    showPetAnimation('eating');
    showMessage('おいしい！');
    updateDisplay();
}

// 遊ぶ
function playWithPet() {
    if (!pet.isAlive) return;
    
    if (pet.energy < 20) {
        showMessage('疲れているみたい...');
        return;
    }
    
    pet.happiness = Math.min(100, pet.happiness + 20);
    pet.energy = Math.max(0, pet.energy - 15);
    pet.hunger = Math.min(100, pet.hunger + 10);
    
    showPetAnimation('playing');
    showMessage('楽しい！');
    updateDisplay();
}

// 寝かせる
function sleepPet() {
    if (!pet.isAlive) return;
    
    pet.energy = Math.min(100, pet.energy + 30);
    pet.happiness = Math.min(100, pet.happiness + 5);
    
    showPetAnimation('sleeping');
    showMessage('ぐっすり...');
    updateDisplay();
}

// 表示更新
function updateDisplay() {
    // ペットの絵文字
    const petEmoji = document.getElementById('pet-emoji');
    if (!pet.isAlive) {
        petEmoji.textContent = petEmojis.dead;
    } else {
        petEmoji.textContent = petEmojis[pet.stage];
    }
    
    // ステータスバー
    document.getElementById('happiness-bar').style.width = pet.happiness + '%';
    document.getElementById('hunger-bar').style.width = pet.hunger + '%';
    document.getElementById('energy-bar').style.width = pet.energy + '%';
    
    // ペット情報
    document.getElementById('pet-name').textContent = pet.name;
    document.getElementById('pet-age').textContent = `年齢: ${pet.age}日`;
}

// ペットのアニメーション
function showPetAnimation(action) {
    const petEmoji = document.getElementById('pet-emoji');
    const originalEmoji = petEmoji.textContent;
    
    petEmoji.textContent = petEmojis[action];
    setTimeout(() => {
        if (pet.isAlive) {
            petEmoji.textContent = petEmojis[pet.stage];
        }
    }, 1500);
}

// メッセージ表示
function showMessage(text) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    setTimeout(() => {
        messageEl.textContent = '';
    }, 3000);
}

// ゲームオーバー
function gameOver() {
    clearInterval(gameInterval);
    clearInterval(ageInterval);
    document.getElementById('game-over').style.display = 'block';
    updateDisplay();
}

// ゲーム再開
function restartGame() {
    pet = {
        name: 'たまご',
        age: 0,
        happiness: 100,
        hunger: 50,
        energy: 100,
        isAlive: true,
        stage: 'egg'
    };
    
    document.getElementById('game-over').style.display = 'none';
    showMessage('新しいペットが生まれました！');
    startGame();
}

// ゲーム開始
startGame();