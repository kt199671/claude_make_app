class TimeTravelGame {
    constructor() {
        this.currentEra = 'present';
        this.adventurePoints = 0;
        this.erasVisited = 0;
        this.inventory = ['⏰ タイムマシン'];
        this.visitedEras = new Set();
        
        this.stories = {
            present: {
                text: 'あなたは謎の時空装置を発見しました！この装置を使って様々な時代を冒険することができます。どの時代に旅立ちますか？',
                avatar: '🧑‍🚀',
                choices: [
                    { text: '🦕 先史時代へ', action: () => this.travelTo('prehistoric') },
                    { text: '🏛️ 古代エジプトへ', action: () => this.travelTo('ancient') },
                    { text: '🏰 中世ヨーロッパへ', action: () => this.travelTo('medieval') },
                    { text: '🚀 未来世界へ', action: () => this.travelTo('future') }
                ]
            },
            prehistoric: {
                text: '先史時代に到着！巨大な恐竜たちが闊歩する危険な世界です。原始人の集落を発見しました。',
                avatar: '🦕',
                era: '先史時代 - 6500万年前',
                choices: [
                    { text: '🔥 火の作り方を教える', action: () => this.makeChoice('prehistoric', 'fire') },
                    { text: '🏹 狩りを手伝う', action: () => this.makeChoice('prehistoric', 'hunt') },
                    { text: '🖼️ 壁画を描く', action: () => this.makeChoice('prehistoric', 'art') },
                    { text: '🏠 現代に戻る', action: () => this.returnToPresent() }
                ]
            },
            ancient: {
                text: '古代エジプトに到着！ピラミッドの建設現場で働く人々を見つけました。ファラオの宮殿が見えます。',
                avatar: '🏛️',
                era: '古代エジプト - 紀元前2500年',
                choices: [
                    { text: '📐 建築技術を伝える', action: () => this.makeChoice('ancient', 'architecture') },
                    { text: '📜 象形文字を学ぶ', action: () => this.makeChoice('ancient', 'hieroglyphs') },
                    { text: '💎 宝探しをする', action: () => this.makeChoice('ancient', 'treasure') },
                    { text: '🏠 現代に戻る', action: () => this.returnToPresent() }
                ]
            },
            medieval: {
                text: '中世ヨーロッパに到着！騎士たちの城とドラゴンの伝説が残る時代です。村人たちが困っているようです。',
                avatar: '🏰',
                era: '中世ヨーロッパ - 1200年',
                choices: [
                    { text: '⚔️ ドラゴンと戦う', action: () => this.makeChoice('medieval', 'dragon') },
                    { text: '🛡️ 騎士になる', action: () => this.makeChoice('medieval', 'knight') },
                    { text: '🧙‍♂️ 魔法を学ぶ', action: () => this.makeChoice('medieval', 'magic') },
                    { text: '🏠 現代に戻る', action: () => this.returnToPresent() }
                ]
            },
            future: {
                text: '未来世界に到着！空飛ぶ車とロボットが共存する高度な文明です。AIが話しかけてきました。',
                avatar: '🚀',
                era: '未来世界 - 3024年',
                choices: [
                    { text: '🤖 ロボットと友達になる', action: () => this.makeChoice('future', 'robot') },
                    { text: '🌌 宇宙旅行をする', action: () => this.makeChoice('future', 'space') },
                    { text: '💡 新技術を学ぶ', action: () => this.makeChoice('future', 'tech') },
                    { text: '🏠 現代に戻る', action: () => this.returnToPresent() }
                ]
            }
        };
        
        this.outcomes = {
            prehistoric: {
                fire: { text: '原始人たちに火の作り方を教えました！彼らは大喜びで、感謝の印に石のお守りをくれました。', reward: '🪨 石のお守り', points: 50 },
                hunt: { text: 'マンモス狩りを手伝いました！勇敢な戦いぶりに感動した族長から、骨の槍をもらいました。', reward: '🦴 骨の槍', points: 40 },
                art: { text: '洞窟に美しい壁画を描きました！この絵は何千年も後の考古学者を驚かせることでしょう。', reward: '🎨 古代の絵具', points: 60 }
            },
            ancient: {
                architecture: { text: 'ピラミッド建設に革新的なアイデアを提供しました！建築家たちから黄金のアンクをもらいました。', reward: '☥ 黄金のアンク', points: 70 },
                hieroglyphs: { text: '象形文字の秘密を解き明かしました！神官から神聖なパピルスを授かりました。', reward: '📜 神聖なパピルス', points: 55 },
                treasure: { text: 'ピラミッドの隠された宝物庫を発見しました！ファラオの指輪を見つけました。', reward: '💍 ファラオの指輪', points: 80 }
            },
            medieval: {
                dragon: { text: '伝説のドラゴンを倒しました！村人たちから英雄として称えられ、魔法の剣を授かりました。', reward: '⚔️ 魔法の剣', points: 100 },
                knight: { text: '立派な騎士として認められました！王様から騎士の盾を授与されました。', reward: '🛡️ 騎士の盾', points: 65 },
                magic: { text: '古い魔導書から失われた魔法を学びました！魔法使いから水晶玉をもらいました。', reward: '🔮 魔法の水晶玉', points: 75 }
            },
            future: {
                robot: { text: 'AIロボットと友情を築きました！お礼にホログラムデバイスをもらいました。', reward: '📱 ホログラムデバイス', points: 60 },
                space: { text: '銀河系を巡る宇宙旅行を楽しみました！宇宙ステーションでエネルギークリスタルを発見しました。', reward: '💎 エネルギークリスタル', points: 90 },
                tech: { text: '反重力技術の秘密を学びました！科学者から量子コンピュータのチップをもらいました。', reward: '🔬 量子チップ', points: 85 }
            }
        };
    }
    
    travelTo(era) {
        this.currentEra = era;
        if (!this.visitedEras.has(era)) {
            this.visitedEras.add(era);
            this.erasVisited++;
            this.adventurePoints += 20;
        }
        this.updateDisplay();
    }
    
    makeChoice(era, choice) {
        const outcome = this.outcomes[era][choice];
        this.adventurePoints += outcome.points;
        this.inventory.push(outcome.reward);
        
        // アニメーション効果
        this.showOutcome(outcome.text);
        
        setTimeout(() => {
            this.updateDisplay();
        }, 2000);
    }
    
    showOutcome(text) {
        const storyPanel = document.getElementById('storyPanel');
        const originalClass = storyPanel.className;
        
        storyPanel.style.background = 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)';
        document.getElementById('storyText').innerHTML = `
            <div style="font-size: 1.5em; margin-bottom: 15px;">🎉 冒険成功！</div>
            ${text}
        `;
        
        setTimeout(() => {
            storyPanel.style.background = '';
            storyPanel.className = originalClass;
        }, 2000);
    }
    
    returnToPresent() {
        this.currentEra = 'present';
        this.updateDisplay();
    }
    
    resetGame() {
        this.currentEra = 'present';
        this.adventurePoints = 0;
        this.erasVisited = 0;
        this.inventory = ['⏰ タイムマシン'];
        this.visitedEras.clear();
        this.updateDisplay();
    }
    
    updateDisplay() {
        const story = this.stories[this.currentEra];
        const storyPanel = document.getElementById('storyPanel');
        
        // 時代に応じた背景色の変更
        storyPanel.className = `story-panel era-${this.currentEra}`;
        
        document.getElementById('currentEra').textContent = story.era || '現代 - 2024年';
        document.getElementById('avatar').textContent = story.avatar;
        document.getElementById('storyText').textContent = story.text;
        document.getElementById('adventurePoints').textContent = this.adventurePoints;
        document.getElementById('erasVisited').textContent = this.erasVisited;
        
        // 選択肢の更新
        const choicesPanel = document.getElementById('choicesPanel');
        choicesPanel.innerHTML = '';
        
        story.choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.onclick = choice.action;
            choicesPanel.appendChild(button);
        });
        
        // インベントリの更新
        const inventory = document.getElementById('inventory');
        inventory.innerHTML = '';
        
        this.inventory.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.textContent = item;
            inventory.appendChild(itemDiv);
        });
    }
}

// ゲームインスタンスの作成
const game = new TimeTravelGame();

// グローバル関数（HTMLから呼び出されるため）
function travelTo(era) {
    game.travelTo(era);
}

function returnToPresent() {
    game.returnToPresent();
}

function resetGame() {
    game.resetGame();
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    game.updateDisplay();
    
    // キーボードショートカット
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case '1':
                if (game.currentEra === 'present') game.travelTo('prehistoric');
                break;
            case '2':
                if (game.currentEra === 'present') game.travelTo('ancient');
                break;
            case '3':
                if (game.currentEra === 'present') game.travelTo('medieval');
                break;
            case '4':
                if (game.currentEra === 'present') game.travelTo('future');
                break;
            case 'h':
                game.returnToPresent();
                break;
            case 'r':
                game.resetGame();
                break;
        }
    });
});