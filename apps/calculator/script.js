let display = document.getElementById('display');
let historyList = document.getElementById('history-list');
let currentInput = '0';
let previousInput = null;
let operator = null;
let waitingForOperand = false;
let history = [];

// 数字を追加
function appendNumber(num) {
    if (waitingForOperand) {
        currentInput = num;
        waitingForOperand = false;
    } else {
        currentInput = currentInput === '0' ? num : currentInput + num;
    }
    updateDisplay();
}

// 演算子を追加
function appendOperator(op) {
    const inputValue = parseFloat(currentInput);
    
    if (previousInput === null) {
        previousInput = inputValue;
    } else if (operator) {
        const result = performOperation();
        
        currentInput = String(result);
        previousInput = result;
    }
    
    waitingForOperand = true;
    operator = op;
    updateDisplay();
}

// 計算実行
function calculate() {
    const inputValue = parseFloat(currentInput);
    
    if (previousInput !== null && operator) {
        const result = performOperation();
        const equation = `${previousInput} ${operator} ${inputValue} = ${result}`;
        
        addToHistory(equation);
        currentInput = String(result);
        previousInput = null;
        operator = null;
        waitingForOperand = true;
        updateDisplay();
    }
}

// 実際の計算処理
function performOperation() {
    const inputValue = parseFloat(currentInput);
    let result = 0;
    
    switch(operator) {
        case '+':
            result = previousInput + inputValue;
            break;
        case '-':
            result = previousInput - inputValue;
            break;
        case '*':
            result = previousInput * inputValue;
            break;
        case '/':
            result = previousInput / inputValue;
            break;
    }
    
    return result;
}

// 表示をクリア
function clearDisplay() {
    currentInput = '0';
    previousInput = null;
    operator = null;
    waitingForOperand = false;
    updateDisplay();
}

// 最後の文字を削除
function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

// 符号を切り替え
function toggleSign() {
    currentInput = String(-parseFloat(currentInput));
    updateDisplay();
}

// 表示を更新
function updateDisplay() {
    display.textContent = currentInput;
}

// 履歴に追加
function addToHistory(equation) {
    history.unshift(equation);
    if (history.length > 10) {
        history.pop();
    }
    updateHistory();
}

// 履歴表示を更新
function updateHistory() {
    historyList.innerHTML = history
        .map(item => `<div class="history-item">${item}</div>`)
        .join('');
}

// キーボード入力対応
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        appendNumber(e.key);
    } else if (e.key === '.') {
        appendNumber('.');
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        appendOperator(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
    } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        clearDisplay();
    } else if (e.key === 'Backspace') {
        deleteLast();
    }
});

// 初期化
updateDisplay();