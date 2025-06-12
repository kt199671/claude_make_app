const emojiCategories = {
    adventure: ['🗺️', '⛰️', '🏔️', '🌋', '🏕️', '🎒', '🧭', '⛺', '🔦', '🗿', '🏰', '🗼', '🌉', '🚁', '🛶'],
    romance: ['💕', '❤️', '💖', '💗', '💘', '💝', '💌', '💐', '🌹', '🌺', '🌸', '💏', '👫', '💑', '🥰'],
    mystery: ['🔍', '🕵️', '🔎', '🗝️', '🔐', '🔓', '📜', '🕯️', '💎', '🎭', '🌫️', '🌙', '🦉', '🚪', '❓'],
    comedy: ['😂', '🤣', '😄', '😆', '🤪', '😜', '🤡', '🎪', '🎨', '🎭', '🍌', '🥸', '🤸', '🎉', '🎊'],
    horror: ['👻', '💀', '☠️', '🧟', '🧛', '🦇', '🕷️', '🕸️', '⚰️', '🪦', '🌑', '🔪', '🩸', '😱', '👹'],
    fantasy: ['🧙', '🧚', '🦄', '🐉', '🏰', '⚔️', '🛡️', '🔮', '✨', '🌟', '💫', '🧝', '🧞', '🦅', '🌈']
};

const storyTemplates = {
    adventure: [
        "ある日、{0}を手に入れた主人公は{1}へ向かった。途中で{2}に遭遇し、{3}を使って切り抜けた。最後には{4}を発見した！",
        "{0}と{1}を持って冒険に出た勇者。{2}で道に迷ったが、{3}の助けで{4}にたどり着いた。",
        "伝説の{0}を求めて{1}を越えた探検家。{2}と{3}に守られた{4}で大発見をした！"
    ],
    romance: [
        "{0}に一目惚れした主人公。{1}をプレゼントして、{2}で告白。{3}の下で{4}な結末を迎えた。",
        "運命の出会いは{0}だった。{1}と{2}を交わし、{3}に包まれて{4}になった。",
        "{0}な気持ちを抱えて、{1}を贈った。{2}の返事は{3}で、二人は{4}に包まれた。"
    ],
    mystery: [
        "{0}を使って事件を調査。{1}で重要な手がかりを発見し、{2}の謎を解いた。犯人は{3}を持った{4}だった！",
        "深夜の{0}で{1}を発見。{2}を手がかりに{3}を調べると、{4}という真実が明らかに。",
        "{0}が消えた謎。{1}と{2}を調べた探偵は、{3}の場所で{4}を見つけた。"
    ],
    comedy: [
        "{0}な主人公が{1}でやらかした！{2}になって{3}したら、みんな{4}になった。",
        "今日も{0}な一日。{1}を間違えて{2}に！{3}な展開に{4}が止まらない。",
        "{0}しようとして{1}になった主人公。{2}と{3}のせいで{4}な結末に！"
    ],
    horror: [
        "真夜中の{0}で{1}に遭遇。{2}が現れ、{3}の音が響く中、{4}が待っていた...",
        "{0}の館で{1}を発見。{2}に追われながら{3}を探すと、{4}という恐怖が...",
        "呪われた{0}を手にした瞬間、{1}が現れた。{2}と{3}に囲まれ、{4}の運命に..."
    ],
    fantasy: [
        "{0}の力を持つ主人公は、{1}と共に{2}を倒した。{3}の祝福を受けて{4}となった。",
        "魔法の{0}を求めて{1}の国へ。{2}と{3}の試練を乗り越え、{4}を手に入れた！",
        "{0}が支配する世界で、{1}と{2}が立ち上がった。{3}の力で{4}を実現した。"
    ]
};

let selectedGenre = 'adventure';
let selectedEmojis = [];
let savedStories = JSON.parse(localStorage.getItem('emojiStories')) || [];
let gameStats = JSON.parse(localStorage.getItem('gameStats')) || {
    storyCount: 0,
    creativityScore: 0,
    streakCount: 0,
    achievements: []
};
let challengeMode = false;
let challengeTimer = null;
let challengeTimeLeft = 60;

const challenges = [
    { text: '3つの異なるジャンルを使って3つのストーリーを作成してください', type: 'multi-genre', target: 3 },
    { text: '60秒以内に5つのストーリーを生成してください', type: 'speed', target: 5 },
    { text: 'すべてのジャンルから最低1つずつ絵文字を使ってストーリーを作成してください', type: 'variety', target: 6 },
    { text: '同じ絵文字を2回以上使わずに3つのストーリーを作成してください', type: 'unique', target: 3 }
];

const achievements = [
    { id: 'first_story', name: '初めてのストーリー', description: '最初のストーリーを生成', icon: '🎯', unlocked: false },
    { id: 'story_master', name: 'ストーリーマスター', description: '10個のストーリーを生成', icon: '📚', unlocked: false },
    { id: 'creative_genius', name: '創造の天才', description: '創造性スコア100達成', icon: '🧠', unlocked: false },
    { id: 'speed_writer', name: 'スピードライター', description: 'チャレンジモードをクリア', icon: '⚡', unlocked: false },
    { id: 'genre_explorer', name: 'ジャンル探検家', description: 'すべてのジャンルでストーリー生成', icon: '🗺️', unlocked: false }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupGenreButtons();
    updateEmojiPalette();
    setupActionButtons();
    displaySavedStories();
    updateStats();
    setupAchievements();
    setupChallengeMode();
});

function setupGenreButtons() {
    const genreButtons = document.querySelectorAll('.genre-btn');
    genreButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            genreButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedGenre = btn.dataset.genre;
            updateEmojiPalette();
        });
    });
    // Set default genre
    genreButtons[0].classList.add('active');
}

function updateEmojiPalette() {
    const emojiGrid = document.querySelector('.emoji-grid');
    emojiGrid.innerHTML = '';
    
    const emojis = emojiCategories[selectedGenre];
    emojis.forEach(emoji => {
        const emojiItem = document.createElement('div');
        emojiItem.className = 'emoji-item';
        emojiItem.textContent = emoji;
        emojiItem.addEventListener('click', () => addEmoji(emoji));
        emojiGrid.appendChild(emojiItem);
    });
}

function addEmoji(emoji) {
    if (selectedEmojis.length < 5) {
        selectedEmojis.push(emoji);
        updateEmojiSequence();
        playSound('clickSound');
        
        // Add visual feedback
        const emojiItems = document.querySelectorAll('.emoji-item');
        emojiItems.forEach(item => {
            if (item.textContent === emoji) {
                item.style.transform = 'scale(1.5)';
                setTimeout(() => {
                    item.style.transform = 'scale(1)';
                }, 200);
            }
        });
    }
}

function updateEmojiSequence() {
    const emojiSequence = document.querySelector('.emoji-sequence');
    emojiSequence.innerHTML = '';
    
    selectedEmojis.forEach((emoji, index) => {
        const span = document.createElement('span');
        span.className = 'emoji-in-story';
        span.textContent = emoji;
        span.style.animationDelay = `${index * 0.1}s`;
        emojiSequence.appendChild(span);
    });
}

function setupActionButtons() {
    document.getElementById('generateBtn').addEventListener('click', generateStory);
    document.getElementById('clearBtn').addEventListener('click', clearStory);
    document.getElementById('shareBtn').addEventListener('click', shareStory);
    document.getElementById('randomBtn').addEventListener('click', randomStory);
    document.getElementById('challengeBtn').addEventListener('click', toggleChallengeMode);
}

function setupChallengeMode() {
    document.getElementById('startChallengeBtn').addEventListener('click', startChallenge);
    document.getElementById('exitChallengeBtn').addEventListener('click', exitChallengeMode);
}

function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {}); // Ignore errors if autoplay is blocked
    }
}

function generateStory() {
    if (selectedEmojis.length < 3) {
        alert('最低3つの絵文字を選んでください！');
        return;
    }
    
    const templates = storyTemplates[selectedGenre];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    let story = template;
    selectedEmojis.forEach((emoji, index) => {
        story = story.replace(`{${index}}`, emoji);
    });
    
    // Fill remaining placeholders with random emojis
    for (let i = selectedEmojis.length; i < 5; i++) {
        const randomEmoji = emojiCategories[selectedGenre][Math.floor(Math.random() * emojiCategories[selectedGenre].length)];
        story = story.replace(`{${i}}`, randomEmoji);
    }
    
    playSound('generateSound');
    displayStory(story);
    saveStory(story);
    updateGameStats();
    checkAchievements();
}

function displayStory(story) {
    const storyText = document.querySelector('.story-text');
    storyText.textContent = story;
    
    // Add animation
    storyText.style.opacity = '0';
    setTimeout(() => {
        storyText.style.transition = 'opacity 0.5s ease';
        storyText.style.opacity = '1';
    }, 100);
}

function clearStory() {
    selectedEmojis = [];
    updateEmojiSequence();
    document.querySelector('.story-text').textContent = '';
}

function shareStory() {
    const story = document.querySelector('.story-text').textContent;
    if (!story) {
        alert('先にストーリーを生成してください！');
        return;
    }
    
    if (navigator.share) {
        navigator.share({
            title: '絵文字ストーリー',
            text: story,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(story).then(() => {
            alert('ストーリーをクリップボードにコピーしました！');
        });
    }
}

function randomStory() {
    // Select random genre
    const genres = Object.keys(emojiCategories);
    selectedGenre = genres[Math.floor(Math.random() * genres.length)];
    
    // Update genre button
    document.querySelectorAll('.genre-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.genre === selectedGenre);
    });
    
    // Select random emojis
    selectedEmojis = [];
    const emojis = emojiCategories[selectedGenre];
    for (let i = 0; i < 5; i++) {
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        selectedEmojis.push(randomEmoji);
    }
    
    updateEmojiPalette();
    updateEmojiSequence();
    generateStory();
}

function saveStory(story) {
    const storyObj = {
        id: Date.now(),
        story: story,
        emojis: selectedEmojis.join(''),
        genre: selectedGenre,
        date: new Date().toLocaleDateString('ja-JP')
    };
    
    savedStories.unshift(storyObj);
    if (savedStories.length > 10) {
        savedStories = savedStories.slice(0, 10);
    }
    
    localStorage.setItem('emojiStories', JSON.stringify(savedStories));
    displaySavedStories();
}

function displaySavedStories() {
    const storiesList = document.querySelector('.stories-list');
    storiesList.innerHTML = '';
    
    savedStories.forEach(story => {
        const storyCard = document.createElement('div');
        storyCard.className = 'story-card';
        storyCard.innerHTML = `
            <div class="story-card-title">${story.date} - ${getGenreName(story.genre)}</div>
            <div class="story-card-preview">${story.emojis}</div>
        `;
        storyCard.addEventListener('click', () => {
            displayStory(story.story);
            selectedEmojis = story.emojis.split('');
            updateEmojiSequence();
        });
        storiesList.appendChild(storyCard);
    });
}

function getGenreName(genre) {
    const names = {
        adventure: '冒険',
        romance: 'ロマンス',
        mystery: 'ミステリー',
        comedy: 'コメディ',
        horror: 'ホラー',
        fantasy: 'ファンタジー'
    };
    return names[genre] || genre;
}