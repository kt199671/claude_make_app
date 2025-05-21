const fortunes = [
    "大吉：今日は最高の一日になるでしょう！",
    "中吉：良いことがありそうです。期待しましょう。",
    "小吉：ささやかな幸せが訪れるでしょう。",
    "吉：平穏な一日です。",
    "末吉：努力すれば報われるでしょう。",
    "凶：気をつけて。でも、明日は良い日になるかも。",
    "大凶：今日は慎重に過ごしましょう。ラッキーアイテムは塩。",
    "大吉：新しい出会いがあなたを待っています。",
    "中吉：計画していたことが順調に進みます。",
    "小吉：美味しいものを食べると運気アップ！",
    "吉：家族や友人との時間を大切に。",
    "末吉：読書をすると良いアイデアが浮かぶかも。",
    "凶：忘れ物に注意。確認をしっかりと。",
    "大吉：金運が良い日！宝くじを買ってみる？",
    "中吉：健康に恵まれ、活動的な一日を過ごせそう。"
];

const getFortuneButton = document.getElementById('getFortuneButton');
const fortuneDisplay = document.getElementById('fortuneDisplay');

getFortuneButton.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * fortunes.length);
    const randomFortune = fortunes[randomIndex];
    fortuneDisplay.textContent = randomFortune;
});
