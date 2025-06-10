let userScore = 0;
let aiScore = 0;
let currentRound = 1;
let beatPlaying = false;
let battleActive = false;

const startBtn = document.getElementById('startBtn');
const beatBtn = document.getElementById('beatBtn');
const themeInput = document.getElementById('themeInput');
const userLyrics = document.getElementById('userLyrics');
const aiLyrics = document.getElementById('aiLyrics');
const userScoreEl = document.getElementById('userScore');
const aiScoreEl = document.getElementById('aiScore');
const roundEl = document.getElementById('round');
const beatAudio = document.getElementById('beatAudio');
const beatIndicator = document.getElementById('beatIndicator');
const beatDots = beatIndicator.querySelectorAll('.beat-dot');

const rhymeWords = {
    'ai': ['才', '愛', 'fly', 'high', 'sky', 'try', 'bye'],
    'rap': ['tap', 'map', 'gap', 'snap', 'trap', 'cap'],
    'flow': ['go', 'show', 'know', 'grow', 'throw', 'glow'],
    'beat': ['heat', 'meet', 'street', 'sweet', 'feat'],
    'mc': ['see', 'free', 'key', 'tree', 'degree'],
    'yo': ['go', 'flow', 'show', 'know', 'grow'],
    'check': ['tech', 'deck', 'neck', 'respect'],
    'time': ['rhyme', 'prime', 'climb', 'crime'],
    'game': ['fame', 'name', 'same', 'flame', 'frame'],
    'style': ['while', 'mile', 'smile', 'file']
};

const rapTemplates = [
    "Yo, {theme}について語るぜ、\n俺のフロウは{adjective}、誰も止められねぇ\n{rhyme1}みたいに{action}、\nこのビートに乗って{rhyme2}！",
    "Check it out, {theme}の話だ\n{adjective}なライムで{action}\nマイクを握れば{rhyme1}\n最後まで聴けよ、{rhyme2}！",
    "{theme}、それが俺のスタイル\n{adjective}に{action}、一マイル\n{rhyme1}のように輝いて\n最高のフロウで{rhyme2}！",
    "Listen up, {theme}のストーリー\n{adjective}な言葉で作るグローリー\n{rhyme1}みたいに{action}して\nこのステージで{rhyme2}！"
];

const adjectives = ['最高', 'ヤバい', 'アツい', 'クール', 'パワフル', 'スムース', 'ハード', 'フレッシュ', 'リアル', 'ディープ'];
const actions = ['飛ぶ', '燃える', '輝く', '響く', '刻む', '揺らす', '届ける', '叫ぶ', '奏でる', '破壊する'];
const rhymes1 = ['太陽', '稲妻', 'ダイヤモンド', '炎', '嵐', '星', '波', '風', '光', '雷'];
const rhymes2 = ['見せてやるぜ', '証明する', 'かましてやる', '届けるぜ', '示すぜ', '刻むぜ', '響かせる', '伝えるぜ', '叫ぶぜ', '決めるぜ'];

startBtn.addEventListener('click', startBattle);
beatBtn.addEventListener('click', toggleBeat);

userLyrics.addEventListener('input', () => {
    if (battleActive && userLyrics.textContent.trim().length > 50) {
        setTimeout(() => {
            evaluateRound();
        }, 1000);
    }
});

function startBattle() {
    if (!themeInput.value.trim()) {
        themeInput.style.animation = 'shake 0.5s';
        setTimeout(() => themeInput.style.animation = '', 500);
        return;
    }
    
    battleActive = true;
    startBtn.textContent = 'バトル中...';
    startBtn.disabled = true;
    userLyrics.contentEditable = true;
    userLyrics.textContent = '';
    aiLyrics.textContent = 'AIがビートを聴いています...';
    
    document.getElementById('userSection').classList.add('active');
    
    createEmojiRain('🔥', 5);
    
    if (!beatPlaying) {
        toggleBeat();
    }
    
    setTimeout(() => {
        aiRespond();
    }, 2000);
}

function aiRespond() {
    const theme = themeInput.value.trim();
    const template = rapTemplates[Math.floor(Math.random() * rapTemplates.length)];
    
    const aiRap = template
        .replace('{theme}', theme)
        .replace('{adjective}', adjectives[Math.floor(Math.random() * adjectives.length)])
        .replace('{action}', actions[Math.floor(Math.random() * actions.length)])
        .replace('{rhyme1}', rhymes1[Math.floor(Math.random() * rhymes1.length)])
        .replace('{rhyme2}', rhymes2[Math.floor(Math.random() * rhymes2.length)]);
    
    document.getElementById('aiSection').classList.add('active');
    typeWriter(aiRap, aiLyrics);
    
    setTimeout(() => {
        document.getElementById('aiSection').classList.remove('active');
        document.getElementById('userSection').classList.add('active');
    }, 3000);
}

function typeWriter(text, element) {
    element.textContent = '';
    element.classList.add('typing-effect');
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, 50);
        } else {
            element.classList.remove('typing-effect');
        }
    }
    
    type();
}

function evaluateRound() {
    const userText = userLyrics.textContent.trim();
    const userWords = userText.toLowerCase().split(/\s+/);
    
    let userRhymes = 0;
    let userFlow = userText.length > 100 ? 2 : 1;
    let userCreativity = new Set(userWords).size > 20 ? 2 : 1;
    
    for (let word of userWords) {
        for (let key in rhymeWords) {
            if (rhymeWords[key].includes(word)) {
                userRhymes++;
            }
        }
    }
    
    const userRoundScore = userRhymes + userFlow + userCreativity;
    const aiRoundScore = Math.floor(Math.random() * 4) + 3;
    
    userScore += userRoundScore;
    aiScore += aiRoundScore;
    
    updateScores();
    
    if (currentRound < 3) {
        currentRound++;
        roundEl.textContent = currentRound;
        
        setTimeout(() => {
            userLyrics.textContent = '';
            aiRespond();
        }, 2000);
    } else {
        endBattle();
    }
}

function updateScores() {
    userScoreEl.textContent = userScore;
    aiScoreEl.textContent = aiScore;
    
    userScoreEl.style.animation = 'pulse 0.5s';
    aiScoreEl.style.animation = 'pulse 0.5s';
    
    setTimeout(() => {
        userScoreEl.style.animation = '';
        aiScoreEl.style.animation = '';
    }, 500);
}

function endBattle() {
    battleActive = false;
    startBtn.textContent = 'もう一度バトル！';
    startBtn.disabled = false;
    userLyrics.contentEditable = false;
    
    const winner = userScore > aiScore ? 'あなたの勝利！' : aiScore > userScore ? 'AIの勝利！' : '引き分け！';
    const winnerEl = document.createElement('div');
    winnerEl.className = 'winner-announcement';
    winnerEl.innerHTML = `
        <h2>🏆 ${winner} 🏆</h2>
        <p>あなた: ${userScore} vs AI: ${aiScore}</p>
        <button onclick="resetGame()">新しいバトル</button>
    `;
    document.body.appendChild(winnerEl);
    
    createEmojiRain(userScore > aiScore ? '🎉' : '😭', 20);
    
    if (beatPlaying) {
        toggleBeat();
    }
}

function resetGame() {
    userScore = 0;
    aiScore = 0;
    currentRound = 1;
    updateScores();
    roundEl.textContent = currentRound;
    userLyrics.textContent = 'ここにあなたのラップを入力...';
    aiLyrics.textContent = 'AIの返答を待っています...';
    themeInput.value = '';
    
    const winnerEl = document.querySelector('.winner-announcement');
    if (winnerEl) {
        winnerEl.remove();
    }
}

function toggleBeat() {
    beatPlaying = !beatPlaying;
    
    if (beatPlaying) {
        beatAudio.play();
        beatBtn.textContent = 'ビート OFF';
        startBeatAnimation();
    } else {
        beatAudio.pause();
        beatBtn.textContent = 'ビート ON';
        stopBeatAnimation();
    }
}

let beatInterval;

function startBeatAnimation() {
    let currentDot = 0;
    
    beatInterval = setInterval(() => {
        beatDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentDot);
        });
        currentDot = (currentDot + 1) % beatDots.length;
    }, 500);
}

function stopBeatAnimation() {
    clearInterval(beatInterval);
    beatDots.forEach(dot => dot.classList.remove('active'));
}

function createEmojiRain(emoji, count) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const emojiEl = document.createElement('div');
            emojiEl.className = 'emoji-rain';
            emojiEl.textContent = emoji;
            emojiEl.style.left = Math.random() * window.innerWidth + 'px';
            emojiEl.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(emojiEl);
            
            setTimeout(() => emojiEl.remove(), 4000);
        }, i * 200);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.shiftKey && battleActive) {
        evaluateRound();
    }
});

beatAudio.volume = 0.3;