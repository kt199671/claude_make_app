const answers = [
    // ポジティブな回答
    "それは確実です", 
    "間違いなくそうです",
    "疑いようもありません",
    "絶対にイエスです",
    "信じて大丈夫です",
    "私の見る限りイエスです",
    "ほぼ間違いないでしょう",
    "見込みは良好です",
    "イエス",
    "兆候はそれを指しています",
    
    // 曖昧な回答
    "返事は霧の中です、もう一度聞いてください",
    "後でもう一度聞いてください",
    "今は教えない方が良いでしょう",
    "今は予測できません",
    "集中してもう一度聞いてください",
    
    // ネガティブな回答
    "それに頼らない方がいいです",
    "私の返事はノーです",
    "情報源によるとノーです",
    "見込みはあまり良くありません",
    "とても疑わしいです"
];

const magicBall = document.getElementById('magicBall');
const answerElement = document.getElementById('answer');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const historyList = document.getElementById('historyList');

let isShaking = false;
let history = JSON.parse(localStorage.getItem('magic8BallHistory')) || [];

function getRandomAnswer() {
    return answers[Math.floor(Math.random() * answers.length)];
}

function shakeBall() {
    if (isShaking) return;
    
    const question = questionInput.value.trim();
    if (!question) {
        alert('質問を入力してください！');
        return;
    }
    
    isShaking = true;
    magicBall.classList.add('shaking');
    answerElement.classList.add('hidden');
    
    setTimeout(() => {
        const answer = getRandomAnswer();
        answerElement.textContent = answer;
        answerElement.classList.remove('hidden');
        answerElement.classList.add('fade-in');
        magicBall.classList.remove('shaking');
        
        // 履歴に追加
        addToHistory(question, answer);
        
        setTimeout(() => {
            answerElement.classList.remove('fade-in');
            isShaking = false;
        }, 500);
    }, 2000);
}

function addToHistory(question, answer) {
    const timestamp = new Date().toLocaleString('ja-JP');
    const entry = { question, answer, timestamp };
    
    history.unshift(entry);
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    localStorage.setItem('magic8BallHistory', JSON.stringify(history));
    displayHistory();
}

function displayHistory() {
    historyList.innerHTML = '';
    
    history.forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="history-entry">
                <div class="history-question">Q: ${entry.question}</div>
                <div class="history-answer">A: ${entry.answer}</div>
                <div class="history-time">${entry.timestamp}</div>
            </div>
        `;
        historyList.appendChild(li);
    });
}

// イベントリスナー
magicBall.addEventListener('click', shakeBall);
askButton.addEventListener('click', shakeBall);
questionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        shakeBall();
    }
});

// 初期表示
displayHistory();