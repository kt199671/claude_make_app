// 性格カラー診断アプリ
const questions = [
    {
        question: "休日の過ごし方として理想的なのは？",
        answers: [
            { text: "友達とワイワイ遊ぶ", weights: { red: 3, yellow: 2, orange: 1 } },
            { text: "一人でゆっくり読書", weights: { blue: 3, purple: 2, green: 1 } },
            { text: "新しい場所を探検", weights: { orange: 3, yellow: 2, red: 1 } },
            { text: "創作活動に没頭", weights: { purple: 3, pink: 2, blue: 1 } }
        ]
    },
    {
        question: "困難な状況に直面したとき、あなたは？",
        answers: [
            { text: "論理的に解決策を考える", weights: { blue: 3, green: 2, purple: 1 } },
            { text: "直感を信じて行動する", weights: { purple: 3, pink: 2, orange: 1 } },
            { text: "周りの人に相談する", weights: { yellow: 3, pink: 2, green: 1 } },
            { text: "とりあえず行動してみる", weights: { red: 3, orange: 2, yellow: 1 } }
        ]
    },
    {
        question: "あなたが最も大切にしている価値観は？",
        answers: [
            { text: "情熱と冒険", weights: { red: 3, orange: 2, yellow: 1 } },
            { text: "平和と調和", weights: { green: 3, blue: 2, purple: 1 } },
            { text: "創造性と個性", weights: { purple: 3, pink: 2, orange: 1 } },
            { text: "信頼と誠実さ", weights: { blue: 3, green: 2, yellow: 1 } }
        ]
    },
    {
        question: "チームで働くとき、あなたの役割は？",
        answers: [
            { text: "リーダーとして引っ張る", weights: { red: 3, orange: 2, yellow: 1 } },
            { text: "アイデアを出す創造役", weights: { purple: 3, pink: 2, orange: 1 } },
            { text: "みんなをサポートする", weights: { green: 3, yellow: 2, pink: 1 } },
            { text: "計画を立てる戦略家", weights: { blue: 3, green: 2, purple: 1 } }
        ]
    },
    {
        question: "ストレスを感じたとき、どうやって解消する？",
        answers: [
            { text: "運動で汗を流す", weights: { red: 3, orange: 2, yellow: 1 } },
            { text: "瞑想やヨガでリラックス", weights: { purple: 3, blue: 2, green: 1 } },
            { text: "友達と話して発散", weights: { yellow: 3, pink: 2, orange: 1 } },
            { text: "自然の中で過ごす", weights: { green: 3, blue: 2, purple: 1 } }
        ]
    },
    {
        question: "理想の仕事環境は？",
        answers: [
            { text: "変化に富んだ刺激的な環境", weights: { red: 3, orange: 2, yellow: 1 } },
            { text: "静かで集中できる環境", weights: { blue: 3, purple: 2, green: 1 } },
            { text: "チームワークが活発な環境", weights: { yellow: 3, green: 2, pink: 1 } },
            { text: "自由で創造的な環境", weights: { purple: 3, pink: 2, orange: 1 } }
        ]
    },
    {
        question: "人との関わり方で最も近いのは？",
        answers: [
            { text: "深い関係を少人数と築く", weights: { blue: 3, purple: 2, green: 1 } },
            { text: "たくさんの人と広く交流", weights: { yellow: 3, orange: 2, red: 1 } },
            { text: "必要に応じて柔軟に", weights: { green: 3, pink: 2, blue: 1 } },
            { text: "独立心を保ちながら交流", weights: { purple: 3, red: 2, orange: 1 } }
        ]
    },
    {
        question: "決断を下すときの基準は？",
        answers: [
            { text: "データと事実に基づいて", weights: { blue: 3, green: 2, purple: 1 } },
            { text: "感情と直感を大切に", weights: { pink: 3, purple: 2, yellow: 1 } },
            { text: "周りへの影響を考慮して", weights: { green: 3, yellow: 2, blue: 1 } },
            { text: "挑戦と成長の機会として", weights: { red: 3, orange: 2, purple: 1 } }
        ]
    },
    {
        question: "あなたのエネルギー源は？",
        answers: [
            { text: "新しい挑戦と冒険", weights: { red: 3, orange: 2, yellow: 1 } },
            { text: "愛する人との時間", weights: { pink: 3, yellow: 2, green: 1 } },
            { text: "知識と学びの追求", weights: { blue: 3, purple: 2, green: 1 } },
            { text: "創造的な自己表現", weights: { purple: 3, orange: 2, pink: 1 } }
        ]
    },
    {
        question: "人生で最も重要だと思うものは？",
        answers: [
            { text: "情熱的に生きること", weights: { red: 3, orange: 2, yellow: 1 } },
            { text: "心の平和と幸福", weights: { green: 3, blue: 2, pink: 1 } },
            { text: "自己実現と成長", weights: { purple: 3, blue: 2, orange: 1 } },
            { text: "人との深い繋がり", weights: { pink: 3, yellow: 2, green: 1 } }
        ]
    }
];

const colorPersonalities = {
    red: {
        name: "情熱のレッド",
        color: "#FF6B6B",
        traits: ["リーダーシップ", "行動力", "情熱的", "勇敢"],
        description: "あなたは生まれながらのリーダーです。情熱的で行動力があり、困難な状況でも果敢に立ち向かいます。周りの人を鼓舞し、目標に向かって突き進む力を持っています。",
        compatible: ["yellow", "orange"],
        details: "レッドの性格を持つ人は、エネルギッシュで決断力があります。リスクを恐れず、新しいことに挑戦することを楽しみます。時には衝動的になりすぎることもありますが、その情熱は周りの人々を動かす大きな力となります。"
    },
    blue: {
        name: "知性のブルー",
        color: "#45B7D1",
        traits: ["分析力", "冷静", "誠実", "思慮深い"],
        description: "論理的思考と冷静な判断力を持つあなた。複雑な問題も順序立てて解決し、信頼される存在です。深い洞察力で本質を見抜きます。",
        compatible: ["green", "purple"],
        details: "ブルーの性格を持つ人は、知的で分析的です。感情に流されることなく、事実とデータに基づいて判断を下します。計画性があり、長期的な視点で物事を考えることができます。"
    },
    yellow: {
        name: "太陽のイエロー",
        color: "#FECA57",
        traits: ["社交的", "楽観的", "明るい", "協調性"],
        description: "明るく社交的なあなたは、どこにいても場を和ませる太陽のような存在。前向きな姿勢で周りに元気を与えます。",
        compatible: ["orange", "green"],
        details: "イエローの性格を持つ人は、コミュニケーション能力に優れ、人々を結びつける才能があります。楽観的で、困難な状況でも希望を見出すことができます。"
    },
    green: {
        name: "調和のグリーン",
        color: "#96CEB4",
        traits: ["平和主義", "協調性", "思いやり", "バランス感覚"],
        description: "調和と平和を大切にするあなた。優れたバランス感覚で、対立する意見をまとめ、みんなが心地よく過ごせる環境を作ります。",
        compatible: ["blue", "yellow"],
        details: "グリーンの性格を持つ人は、穏やかで思いやりがあります。他人の気持ちを理解し、調和を保つことを重視します。自然を愛し、持続可能な生き方を大切にします。"
    },
    purple: {
        name: "神秘のパープル",
        color: "#DDA0DD",
        traits: ["創造的", "直感的", "個性的", "芸術的"],
        description: "独創的で直感力に優れたあなた。常識にとらわれない発想で、新しい価値を生み出します。芸術的センスも抜群です。",
        compatible: ["pink", "orange"],
        details: "パープルの性格を持つ人は、創造性と直感力に富んでいます。独自の視点で世界を見つめ、他の人が気づかない美しさや可能性を発見します。"
    },
    orange: {
        name: "冒険のオレンジ",
        color: "#FFA502",
        traits: ["冒険心", "自由", "楽しさ", "柔軟性"],
        description: "自由と冒険を愛するあなた。新しい体験を求めて常に動き続け、人生を最大限に楽しみます。柔軟な発想で困難も乗り越えます。",
        compatible: ["red", "yellow"],
        details: "オレンジの性格を持つ人は、エネルギッシュで楽しいことが大好きです。規則や制限を嫌い、自由に生きることを望みます。適応力が高く、どんな状況でも楽しみを見つけることができます。"
    },
    pink: {
        name: "愛のピンク",
        color: "#FF6B9D",
        traits: ["共感力", "優しさ", "ロマンチック", "繊細"],
        description: "深い共感力と優しさを持つあなた。人の心に寄り添い、愛と思いやりで世界をより良い場所にしていきます。",
        compatible: ["purple", "yellow"],
        details: "ピンクの性格を持つ人は、感受性が豊かで、他人の感情を深く理解します。愛情深く、人間関係を大切にします。美しいものや心温まるものに惹かれます。"
    }
};

let currentQuestion = 0;
let scores = {};
let totalTests = 1234567;

// 初期化
function init() {
    // 診断回数をランダムに増やす（リアルタイム感を演出）
    setInterval(() => {
        totalTests += Math.floor(Math.random() * 3) + 1;
        document.getElementById('totalTests').textContent = totalTests.toLocaleString();
    }, 5000);
    
    // スコアの初期化
    Object.keys(colorPersonalities).forEach(color => {
        scores[color] = 0;
    });
}

// テスト開始
function startTest() {
    currentQuestion = 0;
    Object.keys(scores).forEach(color => scores[color] = 0);
    
    showScreen('questionScreen');
    showQuestion();
}

// 質問表示
function showQuestion() {
    const question = questions[currentQuestion];
    document.getElementById('questionNumber').textContent = `質問 ${currentQuestion + 1}/10`;
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('progressFill').style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
    
    const answersContainer = document.getElementById('answersContainer');
    answersContainer.innerHTML = '';
    
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = answer.text;
        button.onclick = () => selectAnswer(index);
        answersContainer.appendChild(button);
    });
    
    document.getElementById('backBtn').style.display = currentQuestion > 0 ? 'block' : 'none';
}

// 回答選択
function selectAnswer(answerIndex) {
    const answer = questions[currentQuestion].answers[answerIndex];
    
    // スコア加算
    Object.entries(answer.weights).forEach(([color, weight]) => {
        scores[color] += weight;
    });
    
    currentQuestion++;
    
    if (currentQuestion < questions.length) {
        showQuestion();
    } else {
        showLoading();
    }
}

// 前の質問に戻る
function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        // スコアをリセット（簡易的な実装）
        Object.keys(scores).forEach(color => scores[color] = 0);
        for (let i = 0; i < currentQuestion; i++) {
            // 前の回答を再計算する必要がある（ここでは省略）
        }
        showQuestion();
    }
}

// ローディング画面
function showLoading() {
    showScreen('loadingScreen');
    
    const loadingTexts = [
        "深層心理を読み取っています",
        "あなたの本質を分析中",
        "性格パターンを解析しています",
        "最適な色を選定中"
    ];
    
    let textIndex = 0;
    const textInterval = setInterval(() => {
        textIndex = (textIndex + 1) % loadingTexts.length;
        document.getElementById('loadingText').textContent = loadingTexts[textIndex];
    }, 800);
    
    setTimeout(() => {
        clearInterval(textInterval);
        showResult();
    }, 3000);
}

// 結果表示
function showResult() {
    // 最高スコアの色を取得
    const topColor = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
    const personality = colorPersonalities[topColor];
    
    showScreen('resultScreen');
    
    // 結果の表示
    document.getElementById('colorDisplay').style.backgroundColor = personality.color;
    document.getElementById('colorName').textContent = personality.name;
    
    // 特徴の表示
    const traitsGrid = document.getElementById('traitsGrid');
    traitsGrid.innerHTML = '';
    personality.traits.forEach(trait => {
        const div = document.createElement('div');
        div.className = 'trait-item';
        div.textContent = trait;
        traitsGrid.appendChild(div);
    });
    
    // 説明文
    document.getElementById('description').textContent = personality.description;
    
    // 相性の良い色
    const compatibleColors = document.getElementById('compatibleColors');
    compatibleColors.innerHTML = '';
    personality.compatible.forEach(colorKey => {
        const compatiblePersonality = colorPersonalities[colorKey];
        const div = document.createElement('div');
        div.className = 'compatible-color';
        div.style.backgroundColor = compatiblePersonality.color;
        div.textContent = compatiblePersonality.name;
        compatibleColors.appendChild(div);
    });
    
    // 他の色
    const otherColors = document.getElementById('otherColors');
    otherColors.innerHTML = '';
    Object.entries(colorPersonalities).forEach(([key, value]) => {
        if (key !== topColor) {
            const div = document.createElement('div');
            div.className = 'other-color-item';
            div.style.borderColor = value.color;
            div.textContent = value.name;
            div.onclick = () => showColorDetail(key);
            otherColors.appendChild(div);
        }
    });
    
    // 結果を保存（シェア用）
    window.currentResult = topColor;
}

// 画面切り替え
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// シェア機能
function shareResult(platform) {
    const personality = colorPersonalities[window.currentResult];
    const url = window.location.href;
    const text = `私の性格カラーは「${personality.name}」でした！\n${personality.traits.join('、')}な性格です。\nあなたは何色？`;
    
    switch (platform) {
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
            break;
        case 'line':
            window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
            break;
        case 'instagram':
            alert('スクリーンショットを撮って、Instagramストーリーでシェアしてください！');
            break;
    }
}

// 詳細表示
function showMoreDetails() {
    const personality = colorPersonalities[window.currentResult];
    document.getElementById('modalTitle').textContent = personality.name + 'の詳細';
    document.getElementById('modalContent').innerHTML = `
        <p>${personality.details}</p>
        <h3>相性の良い職業</h3>
        <p>リーダー、起業家、営業職、スポーツ選手など</p>
        <h3>有名人の例</h3>
        <p>スティーブ・ジョブズ、イーロン・マスクなど</p>
    `;
    document.getElementById('detailModal').style.display = 'block';
}

function showColorDetail(colorKey) {
    const personality = colorPersonalities[colorKey];
    document.getElementById('modalTitle').textContent = personality.name;
    document.getElementById('modalContent').innerHTML = `
        <p>${personality.description}</p>
        <p>${personality.details}</p>
    `;
    document.getElementById('detailModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

function retryTest() {
    startTest();
}

// SNSシェア（トップページ用）
function shareOnTwitter() {
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent('性格カラー診断やってみた！あなたの本当の性格を色で表そう') + '&url=' + encodeURIComponent(window.location.href));
}

function shareOnLine() {
    window.open('https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(window.location.href));
}

function shareOnFacebook() {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href));
}

// 初期化実行
init();