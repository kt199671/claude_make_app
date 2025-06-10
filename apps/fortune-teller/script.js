const fortunes = {
    general: [
        "今日は素晴らしい出会いが待っています。心を開いて新しい経験を受け入れましょう。",
        "思いがけない幸運があなたの扉を叩くでしょう。準備はできていますか？",
        "小さな親切が大きな報いとなって返ってきます。笑顔を忘れずに。",
        "今は耐える時期ですが、もうすぐ明るい未来が訪れます。",
        "あなたの直感を信じてください。それが正しい道を示しています。",
        "周りの人々への感謝の気持ちを忘れずに。それが幸運を呼び込みます。",
        "新しいチャレンジの時が来ました。恐れずに一歩を踏み出しましょう。",
        "過去の経験があなたを導きます。学んだことを活かす時です。"
    ],
    love: [
        "運命の人との出会いが近づいています。自分らしさを大切に。",
        "既にあなたの近くに大切な人がいます。よく周りを見てみましょう。",
        "愛は忍耐です。今は相手を理解する努力をする時期です。",
        "新しい恋の予感。過去を手放して前に進みましょう。",
        "パートナーとの絆が深まる出来事が起こるでしょう。",
        "自分を愛することから始めましょう。それが真の愛を引き寄せます。",
        "コミュニケーションが鍵となります。素直な気持ちを伝えて。",
        "恋愛運上昇中！積極的に行動することで道が開けます。"
    ],
    money: [
        "臨時収入の予感。でも無駄遣いには注意しましょう。",
        "投資のチャンス到来。しかし慎重な判断が必要です。",
        "節約の努力が実を結びます。コツコツが大切です。",
        "金運上昇！でも他人との金銭の貸し借りは避けましょう。",
        "新しい収入源が見つかるかもしれません。アンテナを張って。",
        "今は蓄える時期。将来への投資を考えましょう。",
        "思わぬ出費に注意。緊急用の資金を確保しておきましょう。",
        "あなたの才能がお金に変わる時が来ました。自信を持って。"
    ],
    work: [
        "大きなプロジェクトの成功が見えています。チームワークを大切に。",
        "新しいスキルを身につける絶好の機会です。学びを楽しんで。",
        "上司や同僚からの評価が上がるでしょう。謙虚さを忘れずに。",
        "転職や異動のチャンス。自分の本当にやりたいことを考えて。",
        "困難な課題も必ず解決できます。諦めないことが大切。",
        "アイデアが評価される時。積極的に提案してみましょう。",
        "ワークライフバランスを見直す時期。健康も仕事の一部です。",
        "昇進や昇給の可能性大。今の努力を続けてください。"
    ],
    health: [
        "エネルギーに満ち溢れた一日になるでしょう。アクティブに過ごして。",
        "休息が必要です。無理をせず、体の声に耳を傾けましょう。",
        "新しい健康習慣を始める良い時期。小さなことから始めて。",
        "ストレス解消が大切。好きなことをする時間を作りましょう。",
        "食生活の見直しが健康運を上げます。バランスを考えて。",
        "運動を始めるベストタイミング。楽しみながら続けましょう。",
        "睡眠の質を高めることで、全体的な健康が向上します。",
        "定期健診を受ける良い機会。予防が最良の薬です。"
    ]
};

let audioContext;
let soundEnabled = true;
let historyData = [];

document.addEventListener('DOMContentLoaded', () => {
    const crystalBall = document.querySelector('.crystal-ball');
    const fortuneText = document.getElementById('fortuneText');
    const nameInput = document.getElementById('nameInput');
    const fortuneType = document.getElementById('fortuneType');
    const askButton = document.getElementById('askButton');
    const mist = document.querySelector('.mist');
    const particles = document.getElementById('particles');
    const historyList = document.getElementById('historyList');
    const soundToggle = document.getElementById('soundToggle');

    soundToggle.addEventListener('change', (e) => {
        soundEnabled = e.target.checked;
    });

    askButton.addEventListener('click', tellFortune);
    crystalBall.addEventListener('click', () => {
        if (!crystalBall.classList.contains('active')) {
            tellFortune();
        }
    });

    function tellFortune() {
        const name = nameInput.value.trim() || 'あなた';
        const type = fortuneType.value;
        
        crystalBall.classList.add('active');
        mist.classList.add('active');
        askButton.disabled = true;
        fortuneText.classList.remove('show');
        
        createParticles();
        
        if (soundEnabled) {
            playMysticalSound();
        }
        
        setTimeout(() => {
            const fortune = getRandomFortune(type);
            const personalizedFortune = `${name}様、${fortune}`;
            
            fortuneText.textContent = personalizedFortune;
            fortuneText.classList.add('show');
            
            addToHistory(name, type, fortune);
            
            setTimeout(() => {
                crystalBall.classList.remove('active');
                mist.classList.remove('active');
                askButton.disabled = false;
            }, 3000);
        }, 2000);
    }

    function getRandomFortune(type) {
        const fortuneList = fortunes[type];
        return fortuneList[Math.floor(Math.random() * fortuneList.length)];
    }

    function createParticles() {
        particles.innerHTML = '';
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.bottom = '0';
                particle.style.animationDelay = Math.random() * 0.5 + 's';
                particles.appendChild(particle);
                
                setTimeout(() => particle.remove(), 3000);
            }, i * 100);
        }
    }

    function playMysticalSound() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const duration = 3;
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(220, audioContext.currentTime);
        oscillator1.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + duration);
        
        oscillator2.type = 'triangle';
        oscillator2.frequency.setValueAtTime(110, audioContext.currentTime);
        oscillator2.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + duration);
        oscillator2.stop(audioContext.currentTime + duration);
    }

    function addToHistory(name, type, fortune) {
        const now = new Date();
        const historyItem = {
            name,
            type,
            fortune,
            date: now.toLocaleString('ja-JP')
        };
        
        historyData.unshift(historyItem);
        if (historyData.length > 5) {
            historyData.pop();
        }
        
        updateHistoryDisplay();
    }

    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        
        historyData.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            
            const typeLabels = {
                general: '総合運',
                love: '恋愛運',
                money: '金運',
                work: '仕事運',
                health: '健康運'
            };
            
            div.innerHTML = `
                <div class="date">${item.date}</div>
                <div><strong>${item.name}様</strong></div>
                <div class="fortune-type">${typeLabels[item.type]}</div>
                <div>${item.fortune}</div>
            `;
            
            historyList.appendChild(div);
        });
    }
});