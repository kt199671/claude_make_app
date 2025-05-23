// Data Storage
const appData = {
    transactions: JSON.parse(localStorage.getItem('transactions')) || [],
    investments: JSON.parse(localStorage.getItem('investments')) || [],
    budget: JSON.parse(localStorage.getItem('budget')) || {
        food: 50000,
        transport: 20000,
        entertainment: 30000,
        utilities: 15000,
        rent: 80000,
        insurance: 10000,
        medical: 10000,
        education: 20000,
        clothing: 15000,
        other: 20000
    },
    savingsGoal: JSON.parse(localStorage.getItem('savingsGoal')) || 1000000,
    goals: JSON.parse(localStorage.getItem('goals')) || {
        monthlySavings: 100000,
        yearlyInvestment: 1000000,
        emergencyFund: 500000
    }
};

// Chart instances
let assetChart, expenseChart, incomeChart, portfolioChart, monthlyReportChart;
let yearlyTrendChart, categoryTrendChart; // 統計チャート用のインスタンス変数を追加

// Monthly report state
let currentReportMonth = new Date().getMonth();
let currentReportYear = new Date().getFullYear();

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeModals();
    initializeCharts();
    updateDashboard();
    loadTransactions();
    loadInvestments();
    loadBudget();
    generateAIInsights();
    initializeMonthlyReport();
    addExportImportButtons();
    initializeThemeToggle();
    initializeGoalSetting();
    initializeNotificationSystem();
    initializeStatistics();
    
    // Update investment prices periodically
    updateInvestmentPrices();
    setInterval(updateInvestmentPrices, 60000); // Update every minute
});

// Tab Navigation
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Modal Management
function initializeModals() {
    // Transaction Modal
    const transactionModal = document.getElementById('transactionModal');
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const cancelTransactionBtn = document.getElementById('cancelTransactionBtn');
    const transactionForm = document.getElementById('transactionForm');

    addTransactionBtn.addEventListener('click', () => {
        transactionModal.classList.add('active');
        document.getElementById('transactionDate').valueAsDate = new Date();
        updateTransactionCategories(); // Set initial categories
    });

    cancelTransactionBtn.addEventListener('click', () => {
        transactionModal.classList.remove('active');
        transactionForm.reset();
    });

    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addTransaction();
        transactionModal.classList.remove('active');
        transactionForm.reset();
    });

    // Change categories based on transaction type
    document.getElementById('transactionType').addEventListener('change', updateTransactionCategories);

    // Investment Modal
    const investmentModal = document.getElementById('investmentModal');
    const addInvestmentBtn = document.getElementById('addInvestmentBtn');
    const cancelInvestmentBtn = document.getElementById('cancelInvestmentBtn');
    const investmentForm = document.getElementById('investmentForm');

    addInvestmentBtn.addEventListener('click', () => {
        investmentModal.classList.add('active');
        document.getElementById('investmentDate').valueAsDate = new Date();
    });

    cancelInvestmentBtn.addEventListener('click', () => {
        investmentModal.classList.remove('active');
        investmentForm.reset();
    });

    investmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addInvestment();
        investmentModal.classList.remove('active');
        investmentForm.reset();
    });

    // Close modal on background click
    [transactionModal, investmentModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Transaction Management
function addTransaction() {
    const type = document.getElementById('transactionType').value;
    const description = document.getElementById('transactionDescription').value.trim();
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    const category = document.getElementById('transactionCategory').value;
    const date = document.getElementById('transactionDate').value;
    
    // Validation
    if (!description) {
        alert('説明を入力してください。');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        alert('正しい金額を入力してください。');
        return;
    }
    
    if (!date) {
        alert('日付を選択してください。');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        type: type,
        description: description,
        amount: amount,
        category: category,
        date: date
    };

    appData.transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(appData.transactions));
    
    loadTransactions();
    updateDashboard();
    updateBudgetTracking();
    
    // Show success feedback
    showNotification('取引が追加されました。', 'success');
}

function loadTransactions() {
    const transactionList = document.getElementById('transactionList');
    const filterCategory = document.getElementById('filterCategory').value;
    const filterDateRange = document.getElementById('filterDateRange').value;
    const searchQuery = document.getElementById('searchTransactions').value.toLowerCase();
    
    let filteredTransactions = appData.transactions;
    
    // Category filter
    if (filterCategory !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => 
            t.category === filterCategory || (filterCategory === 'income' && t.type === 'income')
        );
    }
    
    // Date range filter
    if (filterDateRange !== 'all') {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        filteredTransactions = filteredTransactions.filter(t => {
            const tDate = new Date(t.date);
            
            switch(filterDateRange) {
                case 'thisMonth':
                    return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
                case 'lastMonth':
                    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
                    return tDate.getMonth() === lastMonth && tDate.getFullYear() === lastMonthYear;
                case 'last3Months':
                    const threeMonthsAgo = new Date();
                    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                    return tDate >= threeMonthsAgo;
                case 'thisYear':
                    return tDate.getFullYear() === currentYear;
                default:
                    return true;
            }
        });
    }
    
    // Search filter
    if (searchQuery) {
        filteredTransactions = filteredTransactions.filter(t => 
            t.description.toLowerCase().includes(searchQuery) ||
            t.category.toLowerCase().includes(searchQuery) ||
            getCategoryName(t.category).toLowerCase().includes(searchQuery) ||
            t.amount.toString().includes(searchQuery)
        );
    }
    
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    transactionList.innerHTML = filteredTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-date">${formatDate(transaction.date)} - ${getCategoryName(transaction.category)}</div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}¥${transaction.amount.toLocaleString()}
            </div>
            <div class="transaction-actions">
                <button class="btn-icon edit" onclick="editTransaction(${transaction.id})" title="編集">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="btn-icon delete" onclick="deleteTransaction(${transaction.id})" title="削除">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Investment Management
function addInvestment() {
    const name = document.getElementById('investmentName').value.trim();
    const symbol = document.getElementById('investmentSymbol').value.trim().toUpperCase();
    const quantity = parseFloat(document.getElementById('investmentQuantity').value);
    const purchasePrice = parseFloat(document.getElementById('investmentPrice').value);
    const purchaseDate = document.getElementById('investmentDate').value;
    
    // Validation
    if (!name || !symbol) {
        alert('銘柄名とティッカーシンボルを入力してください。');
        return;
    }
    
    if (isNaN(quantity) || quantity <= 0) {
        alert('正しい数量を入力してください。');
        return;
    }
    
    if (isNaN(purchasePrice) || purchasePrice <= 0) {
        alert('正しい取得価格を入力してください。');
        return;
    }
    
    if (!purchaseDate) {
        alert('購入日を選択してください。');
        return;
    }
    
    const investment = {
        id: Date.now(),
        name: name,
        symbol: symbol,
        quantity: quantity,
        purchasePrice: purchasePrice,
        purchaseDate: purchaseDate,
        currentPrice: purchasePrice * (1 + (Math.random() * 0.4 - 0.1))
    };

    appData.investments.push(investment);
    localStorage.setItem('investments', JSON.stringify(appData.investments));
    
    loadInvestments();
    updateDashboard();
    
    showNotification('投資が追加されました。', 'success');
}

function loadInvestments() {
    const holdingsList = document.getElementById('holdingsList');
    const portfolioTotal = document.getElementById('portfolioTotal');
    const portfolioChange = document.getElementById('portfolioChange');
    
    let totalValue = 0;
    let totalCost = 0;
    
    holdingsList.innerHTML = appData.investments.map(investment => {
        const currentValue = investment.quantity * investment.currentPrice;
        const purchaseValue = investment.quantity * investment.purchasePrice;
        const profit = currentValue - purchaseValue;
        const profitPercent = ((profit / purchaseValue) * 100).toFixed(2);
        
        totalValue += currentValue;
        totalCost += purchaseValue;
        
        return `
            <div class="holding-item">
                <div>
                    <div class="holding-name">${investment.name}</div>
                    <div class="holding-symbol">${investment.symbol}</div>
                </div>
                <div>${investment.quantity}株</div>
                <div>¥${currentValue.toLocaleString()}</div>
                <div class="change ${profit >= 0 ? 'positive' : 'negative'}">
                    ${profit >= 0 ? '+' : ''}${profitPercent}%
                </div>
                <div class="investment-actions">
                    <button class="btn-icon edit" onclick="editInvestment(${investment.id})" title="編集">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon delete" onclick="deleteInvestment(${investment.id})" title="削除">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    portfolioTotal.textContent = `¥${totalValue.toLocaleString()}`;
    const totalProfit = ((totalValue - totalCost) / totalCost * 100).toFixed(2);
    portfolioChange.textContent = `${totalProfit >= 0 ? '+' : ''}${totalProfit}%`;
    portfolioChange.className = `change ${totalProfit >= 0 ? 'positive' : 'negative'}`;
    
    updatePortfolioChart();
}

// Budget Management
function loadBudget() {
    const budgetCategories = document.getElementById('budgetCategories');
    const categories = ['food', 'transport', 'entertainment', 'utilities', 'rent', 'insurance', 'medical', 'education', 'clothing', 'other'];
    
    budgetCategories.innerHTML = categories.map(category => `
        <div class="budget-category">
            <label>${getCategoryName(category)}</label>
            <input type="number" id="budget-${category}" value="${appData.budget[category] || 0}" />
        </div>
    `).join('');
    
    document.getElementById('saveBudgetBtn').addEventListener('click', saveBudget);
    
    updateBudgetTracking();
}

function saveBudget() {
    const categories = ['food', 'transport', 'entertainment', 'utilities', 'rent', 'insurance', 'medical', 'education', 'clothing', 'other'];
    
    categories.forEach(category => {
        appData.budget[category] = parseFloat(document.getElementById(`budget-${category}`).value) || 0;
    });
    
    localStorage.setItem('budget', JSON.stringify(appData.budget));
    updateBudgetTracking();
    generateAIInsights();
    
    showNotification('予算が保存されました。', 'success');
}

function updateBudgetTracking() {
    const budgetTracking = document.getElementById('budgetTracking');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = {};
    
    appData.transactions
        .filter(t => t.type === 'expense')
        .filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .forEach(t => {
            if (!monthlyExpenses[t.category]) {
                monthlyExpenses[t.category] = 0;
            }
            monthlyExpenses[t.category] += t.amount;
        });
    
    budgetTracking.innerHTML = Object.keys(appData.budget).map(category => {
        const spent = monthlyExpenses[category] || 0;
        const budget = appData.budget[category];
        const percentage = (spent / budget * 100).toFixed(0);
        const status = percentage > 90 ? 'danger' : percentage > 70 ? 'warning' : '';
        
        return `
            <div class="budget-item">
                <div class="budget-item-header">
                    <span>${getCategoryName(category)}</span>
                    <span>¥${spent.toLocaleString()} / ¥${budget.toLocaleString()}</span>
                </div>
                <div class="budget-progress">
                    <div class="budget-progress-bar ${status}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Dashboard Updates
function updateDashboard() {
    const totalAssets = calculateTotalAssets();
    const monthlyBalance = calculateMonthlyBalance();
    const investmentProfit = calculateInvestmentProfit();
    
    document.getElementById('totalAssets').textContent = `¥${totalAssets.toLocaleString()}`;
    document.getElementById('monthlyBalance').textContent = `¥${monthlyBalance.toLocaleString()}`;
    document.getElementById('investmentProfit').textContent = `¥${investmentProfit.toLocaleString()}`;
    
    // Update savings goal progress
    updateSavingsGoalProgress();
    
    // Update goal progress if goals are set
    updateGoalProgress();
    
    // Update charts
    updateCharts();
}

function calculateTotalAssets() {
    const totalIncome = appData.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = appData.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const investmentValue = appData.investments
        .reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
    
    return totalIncome - totalExpenses + investmentValue;
}

function calculateMonthlyBalance() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = appData.transactions.filter(t => {
        const date = new Date(t.date);
        return t.type === 'income' || t.type === 'expense' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    return monthlyIncome - monthlyExpenses;
}

function calculateInvestmentProfit() {
    const investmentValue = appData.investments
        .reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
    
    const investmentCost = appData.investments
        .reduce((sum, inv) => sum + (inv.quantity * inv.purchasePrice), 0);
    
    return investmentValue - investmentCost;
}

function updateSavingsGoalProgress() {
    const totalAssets = calculateTotalAssets();
    const savingsRate = totalAssets > 0 ? ((totalAssets / appData.savingsGoal) * 100).toFixed(0) : 0;
    
    document.getElementById('currentSavings').textContent = `¥${totalAssets.toLocaleString()}`;
    document.getElementById('savingsTarget').textContent = `¥${appData.savingsGoal.toLocaleString()}`;
    const progressBar = document.getElementById('savingsProgress');
    progressBar.style.width = `${Math.min(savingsRate, 100)}%`;
    progressBar.textContent = `${savingsRate}%`;
}

function updateGoalProgress() {
    if (!appData.goals) return;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calculate monthly savings
    const monthlyTransactions = appData.transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });
    
    const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsProgress = Math.min((monthlySavings / appData.goals.monthlySavings) * 100, 100);
    
    const progressBar = document.getElementById('monthlySavingsProgress');
    const progressText = document.getElementById('monthlySavingsText');
    
    if (progressBar && progressText) {
        progressBar.style.width = `${savingsProgress}%`;
        progressText.textContent = `${Math.round(savingsProgress)}%`;
        
        // Color coding
        if (savingsProgress >= 100) {
            progressBar.style.background = '#00ff88';
        } else if (savingsProgress >= 75) {
            progressBar.style.background = '#ffaa00';
        } else {
            progressBar.style.background = '#ff4444';
        }
    }
}

// Chart Management
function initializeCharts() {
    // Asset Chart
    const assetCtx = document.getElementById('assetChart').getContext('2d');
    assetChart = new Chart(assetCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '総資産',
                data: [],
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#333' },
                    ticks: { color: '#888' }
                },
                x: {
                    grid: { color: '#333' },
                    ticks: { color: '#888' }
                }
            }
        }
    });

    // Expense Chart
    const expenseCtx = document.getElementById('expenseChart').getContext('2d');
    expenseChart = new Chart(expenseCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#ff6384',
                    '#36a2eb',
                    '#ffce56',
                    '#4bc0c0',
                    '#9966ff'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#888' }
                }
            }
        }
    });

    // Income Chart
    const incomeCtx = document.getElementById('incomeChart').getContext('2d');
    incomeChart = new Chart(incomeCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: '収入',
                data: [],
                backgroundColor: '#00ff88'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#333' },
                    ticks: { color: '#888' }
                },
                x: {
                    grid: { color: '#333' },
                    ticks: { color: '#888' }
                }
            }
        }
    });

    // Portfolio Chart
    const portfolioCtx = document.getElementById('portfolioChart').getContext('2d');
    portfolioChart = new Chart(portfolioCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#00ff88',
                    '#00d4ff',
                    '#ff6384',
                    '#ffce56',
                    '#4bc0c0'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#888' }
                }
            }
        }
    });
}

function updateCharts() {
    // Update Asset Chart
    const monthlyAssets = calculateMonthlyAssets();
    assetChart.data.labels = monthlyAssets.labels;
    assetChart.data.datasets[0].data = monthlyAssets.data;
    assetChart.update();

    // Update Expense Chart
    const expensesByCategory = calculateExpensesByCategory();
    expenseChart.data.labels = expensesByCategory.labels;
    expenseChart.data.datasets[0].data = expensesByCategory.data;
    expenseChart.update();

    // Update Income Chart
    const monthlyIncome = calculateMonthlyIncome();
    incomeChart.data.labels = monthlyIncome.labels;
    incomeChart.data.datasets[0].data = monthlyIncome.data;
    incomeChart.update();
}

function updatePortfolioChart() {
    const portfolioData = appData.investments.map(inv => ({
        label: inv.symbol,
        value: inv.quantity * inv.currentPrice
    }));
    
    portfolioChart.data.labels = portfolioData.map(d => d.label);
    portfolioChart.data.datasets[0].data = portfolioData.map(d => d.value);
    portfolioChart.update();
}

function calculateMonthlyAssets() {
    const months = [];
    const assets = [];
    
    // Get all transactions sorted by date
    const sortedTransactions = [...appData.transactions].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
    );
    
    if (sortedTransactions.length === 0) {
        // If no transactions, show zeros for the last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(date.toLocaleDateString('ja-JP', { month: 'short' }));
            assets.push(0);
        }
        return { labels: months, data: assets };
    }
    
    // Calculate cumulative balance for each month
    let cumulativeBalance = 0;
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1); // First day of month
        date.setHours(0, 0, 0, 0);
        
        const nextMonth = new Date(date);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        // Get transactions up to the end of this month
        const monthEndDate = new Date(nextMonth.getTime() - 1); // Last moment of current month
        
        const transactionsUntilMonth = sortedTransactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate <= monthEndDate;
        });
        
        const totalIncome = transactionsUntilMonth
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = transactionsUntilMonth
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        cumulativeBalance = totalIncome - totalExpenses;
        
        // Add investment value for current month
        const investmentValue = appData.investments.reduce((sum, inv) => {
            const invDate = new Date(inv.purchaseDate);
            if (invDate <= monthEndDate) {
                return sum + (inv.quantity * inv.currentPrice);
            }
            return sum;
        }, 0);
        
        months.push(date.toLocaleDateString('ja-JP', { month: 'short' }));
        assets.push(cumulativeBalance + investmentValue);
    }
    
    return { labels: months, data: assets };
}

function calculateExpensesByCategory() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const expenses = {};
    
    appData.transactions
        .filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && 
                   date.getMonth() === currentMonth && 
                   date.getFullYear() === currentYear;
        })
        .forEach(t => {
            if (!expenses[t.category]) {
                expenses[t.category] = 0;
            }
            expenses[t.category] += t.amount;
        });
    
    return {
        labels: Object.keys(expenses).map(cat => getCategoryName(cat)),
        data: Object.values(expenses)
    };
}

function calculateMonthlyIncome() {
    const months = [];
    const income = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        const monthIncome = appData.transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.type === 'income' && 
                       tDate.getMonth() === date.getMonth() && 
                       tDate.getFullYear() === date.getFullYear();
            })
            .reduce((sum, t) => sum + t.amount, 0);
        
        months.push(date.toLocaleDateString('ja-JP', { month: 'short' }));
        income.push(monthIncome);
    }
    
    return { labels: months, data: income };
}

// AI Insights
function generateAIInsights() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calculate monthly data
    const monthlyIncome = appData.transactions
        .filter(t => {
            const date = new Date(t.date);
            return t.type === 'income' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = appData.transactions
        .filter(t => {
            const date = new Date(t.date);
            return t.type === 'expense' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    
    const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(0);
    
    // Generate spending advice
    const spendingAdvice = document.getElementById('spendingAdvice');
    if (savingsRate < 20) {
        spendingAdvice.textContent = `現在の貯蓄率は${savingsRate}%です。支出を見直し、特に娯楽費を20%削減することで、月額¥${(monthlyExpenses * 0.2).toLocaleString()}の節約が可能です。`;
    } else {
        spendingAdvice.textContent = `素晴らしい！貯蓄率${savingsRate}%を維持しています。さらに固定費を見直すことで、年間¥${(monthlyExpenses * 0.1 * 12).toLocaleString()}の追加節約が期待できます。`;
    }
    
    // Generate investment advice
    const investmentAdvice = document.getElementById('investmentAdvice');
    const portfolioValue = appData.investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
    const totalAssets = (monthlyIncome - monthlyExpenses) * 12 + portfolioValue;
    const investmentRatio = (portfolioValue / totalAssets * 100).toFixed(0);
    
    if (investmentRatio < 30) {
        investmentAdvice.textContent = `投資比率が${investmentRatio}%と低めです。長期的な資産形成のため、毎月の余剰資金の50%を積立投資に回すことをお勧めします。`;
    } else {
        investmentAdvice.textContent = `投資比率${investmentRatio}%は適切です。リスク分散のため、国内株式、海外株式、債券をバランスよく組み合わせることを推奨します。`;
    }
    
    // Generate savings advice
    const savingsAdvice = document.getElementById('savingsAdvice');
    const currentSavings = monthlyIncome - monthlyExpenses;
    const monthsToGoal = Math.ceil((appData.savingsGoal - (currentSavings * 12)) / currentSavings);
    
    savingsAdvice.textContent = `現在のペースでは目標達成まで${monthsToGoal}ヶ月かかります。月額¥${(currentSavings * 1.5).toLocaleString()}の貯蓄で、${Math.ceil(monthsToGoal / 1.5)}ヶ月での達成が可能です。`;
    
    // Generate risk assessment
    const riskAssessment = document.getElementById('riskAssessment');
    const emergencyFund = currentSavings * 6;
    const hasEmergencyFund = (monthlyIncome - monthlyExpenses) * 12 > emergencyFund;
    
    if (hasEmergencyFund) {
        riskAssessment.textContent = '緊急資金は十分です。より積極的な投資戦略を検討できます。年利5%の運用で10年後には資産が1.6倍に成長する可能性があります。';
    } else {
        riskAssessment.textContent = `緊急資金として¥${emergencyFund.toLocaleString()}（生活費6ヶ月分）の確保を優先しましょう。その後、投資を本格化させることをお勧めします。`;
    }
}

document.getElementById('generateInsightsBtn').addEventListener('click', generateAIInsights);

// Monthly Report Functions
function initializeMonthlyReport() {
    // Initialize monthly report chart
    const monthlyReportCtx = document.getElementById('monthlyReportChart').getContext('2d');
    monthlyReportChart = new Chart(monthlyReportCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: '収入',
                data: [],
                backgroundColor: '#00ff88',
                borderRadius: 5
            }, {
                label: '支出',
                data: [],
                backgroundColor: '#ff4444',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#888' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#333' },
                    ticks: { color: '#888' }
                },
                x: {
                    grid: { color: '#333' },
                    ticks: { color: '#888' }
                }
            }
        }
    });
    
    // Add event listeners
    document.getElementById('prevMonthBtn').addEventListener('click', () => {
        currentReportMonth--;
        if (currentReportMonth < 0) {
            currentReportMonth = 11;
            currentReportYear--;
        }
        updateMonthlyReport();
    });
    
    document.getElementById('nextMonthBtn').addEventListener('click', () => {
        const now = new Date();
        const maxMonth = now.getMonth();
        const maxYear = now.getFullYear();
        
        currentReportMonth++;
        if (currentReportMonth > 11) {
            currentReportMonth = 0;
            currentReportYear++;
        }
        
        // Don't go beyond current month
        if (currentReportYear > maxYear || (currentReportYear === maxYear && currentReportMonth > maxMonth)) {
            currentReportMonth = maxMonth;
            currentReportYear = maxYear;
        }
        
        updateMonthlyReport();
    });
    
    updateMonthlyReport();
}

function updateMonthlyReport() {
    // Update month display
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    document.getElementById('reportMonth').textContent = `${currentReportYear}年${monthNames[currentReportMonth]}`;
    
    // Calculate monthly data
    const monthlyTransactions = appData.transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentReportMonth && date.getFullYear() === currentReportYear;
    });
    
    const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyBalance = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? ((monthlyBalance / monthlyIncome) * 100).toFixed(1) : 0;
    
    // Update summary
    document.getElementById('reportIncome').textContent = `¥${monthlyIncome.toLocaleString()}`;
    document.getElementById('reportExpense').textContent = `¥${monthlyExpenses.toLocaleString()}`;
    document.getElementById('reportBalance').textContent = `¥${monthlyBalance.toLocaleString()}`;
    document.getElementById('reportBalance').className = `report-value ${monthlyBalance >= 0 ? 'income' : 'expense'}`;
    document.getElementById('reportSavingsRate').textContent = `${savingsRate}%`;
    document.getElementById('reportSavingsRate').className = `report-value ${savingsRate >= 20 ? 'income' : 'expense'}`;
    
    // Update chart with daily breakdown
    const dailyData = calculateDailyBreakdown(monthlyTransactions);
    monthlyReportChart.data.labels = dailyData.labels;
    monthlyReportChart.data.datasets[0].data = dailyData.income;
    monthlyReportChart.data.datasets[1].data = dailyData.expenses;
    monthlyReportChart.update();
}

function calculateDailyBreakdown(transactions) {
    const daysInMonth = new Date(currentReportYear, currentReportMonth + 1, 0).getDate();
    const labels = [];
    const income = [];
    const expenses = [];
    
    // Group by week instead of day for better visualization
    const weeks = Math.ceil(daysInMonth / 7);
    
    for (let week = 0; week < weeks; week++) {
        const startDay = week * 7 + 1;
        const endDay = Math.min((week + 1) * 7, daysInMonth);
        labels.push(`${startDay}日-${endDay}日`);
        
        let weekIncome = 0;
        let weekExpenses = 0;
        
        transactions.forEach(t => {
            const day = new Date(t.date).getDate();
            if (day >= startDay && day <= endDay) {
                if (t.type === 'income') {
                    weekIncome += t.amount;
                } else {
                    weekExpenses += t.amount;
                }
            }
        });
        
        income.push(weekIncome);
        expenses.push(weekExpenses);
    }
    
    return { labels, income, expenses };
}

// Export/Import functionality
function addExportImportButtons() {
    const dashboardTab = document.querySelector('#dashboard .dashboard-grid');
    const exportImportCard = document.createElement('div');
    exportImportCard.className = 'card';
    exportImportCard.innerHTML = `
        <h3>データ管理</h3>
        <div class="data-controls">
            <button class="btn secondary" id="exportDataBtn">📥 データをエクスポート</button>
            <button class="btn secondary" id="importDataBtn">📤 データをインポート</button>
            <input type="file" id="importFileInput" accept=".json" style="display: none;">
        </div>
    `;
    dashboardTab.appendChild(exportImportCard);

    // Add event listeners
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('importDataBtn').addEventListener('click', () => {
        document.getElementById('importFileInput').click();
    });
    document.getElementById('importFileInput').addEventListener('change', importData);
}

function exportData() {
    const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        transactions: appData.transactions,
        investments: appData.investments,
        budget: appData.budget,
        savingsGoal: appData.savingsGoal
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('データのエクスポートが完了しました！');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!data.version || !data.transactions || !data.investments || !data.budget || !data.savingsGoal) {
                throw new Error('Invalid file format');
            }

            // Confirm before importing
            if (confirm('既存のデータが上書きされます。続行しますか？')) {
                // Import data
                appData.transactions = data.transactions;
                appData.investments = data.investments;
                appData.budget = data.budget;
                appData.savingsGoal = data.savingsGoal;
                
                // Save to localStorage
                localStorage.setItem('transactions', JSON.stringify(appData.transactions));
                localStorage.setItem('investments', JSON.stringify(appData.investments));
                localStorage.setItem('budget', JSON.stringify(appData.budget));
                localStorage.setItem('savingsGoal', JSON.stringify(appData.savingsGoal));

                // Reload all data
                loadTransactions();
                loadInvestments();
                loadBudget();
                updateDashboard();
                generateAIInsights();
                
                alert('データのインポートが完了しました！');
            }
        } catch (error) {
            alert('ファイルの読み込みに失敗しました。正しいフォーマットのファイルを選択してください。');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Helper Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function getCategoryName(category) {
    const names = {
        // Income categories
        salary: '給与',
        bonus: 'ボーナス',
        investment: '投資収益',
        business: '事業収入',
        freelance: 'フリーランス',
        rental: '家賃収入',
        // Expense categories
        food: '食費',
        transport: '交通費',
        entertainment: '娯楽',
        utilities: '光熱費',
        rent: '家賃',
        insurance: '保険',
        medical: '医療費',
        education: '教育費',
        clothing: '衣服',
        other: 'その他'
    };
    return names[category] || category;
}

function updateTransactionCategories() {
    const transactionType = document.getElementById('transactionType').value;
    const categorySelect = document.getElementById('transactionCategory');
    
    categorySelect.innerHTML = '';
    
    if (transactionType === 'income') {
        const incomeCategories = [
            { value: 'salary', label: '給与' },
            { value: 'bonus', label: 'ボーナス' },
            { value: 'investment', label: '投資収益' },
            { value: 'business', label: '事業収入' },
            { value: 'freelance', label: 'フリーランス' },
            { value: 'rental', label: '家賃収入' },
            { value: 'other', label: 'その他' }
        ];
        
        incomeCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.value;
            option.textContent = cat.label;
            categorySelect.appendChild(option);
        });
    } else {
        const expenseCategories = [
            { value: 'food', label: '食費' },
            { value: 'transport', label: '交通費' },
            { value: 'entertainment', label: '娯楽' },
            { value: 'utilities', label: '光熱費' },
            { value: 'rent', label: '家賃' },
            { value: 'insurance', label: '保険' },
            { value: 'medical', label: '医療費' },
            { value: 'education', label: '教育費' },
            { value: 'clothing', label: '衣服' },
            { value: 'other', label: 'その他' }
        ];
        
        expenseCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.value;
            option.textContent = cat.label;
            categorySelect.appendChild(option);
        });
    }
}

// Filter transactions
document.getElementById('filterCategory').addEventListener('change', loadTransactions);
document.getElementById('filterDateRange').addEventListener('change', loadTransactions);
document.getElementById('searchTransactions').addEventListener('input', loadTransactions);
document.getElementById('clearFiltersBtn').addEventListener('click', () => {
    document.getElementById('filterCategory').value = 'all';
    document.getElementById('filterDateRange').value = 'all';
    document.getElementById('searchTransactions').value = '';
    loadTransactions();
});

// Transaction edit/delete functions
function editTransaction(id) {
    const transaction = appData.transactions.find(t => t.id === id);
    if (!transaction) return;
    
    // Populate the form with existing data
    document.getElementById('transactionType').value = transaction.type;
    document.getElementById('transactionDescription').value = transaction.description;
    document.getElementById('transactionAmount').value = transaction.amount;
    document.getElementById('transactionCategory').value = transaction.category;
    document.getElementById('transactionDate').value = transaction.date;
    
    // Show the modal
    const modal = document.getElementById('transactionModal');
    modal.classList.add('active');
    
    // Change form submission to update instead of add
    const form = document.getElementById('transactionForm');
    form.onsubmit = (e) => {
        e.preventDefault();
        updateTransaction(id);
        modal.classList.remove('active');
        form.reset();
        // Reset to normal add behavior
        form.onsubmit = (e) => {
            e.preventDefault();
            addTransaction();
            modal.classList.remove('active');
            form.reset();
        };
    };
}

function updateTransaction(id) {
    const index = appData.transactions.findIndex(t => t.id === id);
    if (index === -1) return;
    
    appData.transactions[index] = {
        id: id,
        type: document.getElementById('transactionType').value,
        description: document.getElementById('transactionDescription').value,
        amount: parseFloat(document.getElementById('transactionAmount').value),
        category: document.getElementById('transactionCategory').value,
        date: document.getElementById('transactionDate').value
    };
    
    localStorage.setItem('transactions', JSON.stringify(appData.transactions));
    loadTransactions();
    updateDashboard();
    updateBudgetTracking();
}

function deleteTransaction(id) {
    if (!confirm('この取引を削除してもよろしいですか？')) return;
    
    appData.transactions = appData.transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(appData.transactions));
    
    loadTransactions();
    updateDashboard();
    updateBudgetTracking();
    
    showNotification('取引が削除されました。', 'info');
}

// Investment edit/delete functions
function editInvestment(id) {
    const investment = appData.investments.find(inv => inv.id === id);
    if (!investment) return;
    
    // Populate the form with existing data
    document.getElementById('investmentName').value = investment.name;
    document.getElementById('investmentSymbol').value = investment.symbol;
    document.getElementById('investmentQuantity').value = investment.quantity;
    document.getElementById('investmentPrice').value = investment.purchasePrice;
    document.getElementById('investmentDate').value = investment.purchaseDate;
    
    // Show the modal
    const modal = document.getElementById('investmentModal');
    modal.classList.add('active');
    
    // Change form submission to update instead of add
    const form = document.getElementById('investmentForm');
    form.onsubmit = (e) => {
        e.preventDefault();
        updateInvestment(id);
        modal.classList.remove('active');
        form.reset();
        // Reset to normal add behavior
        form.onsubmit = (e) => {
            e.preventDefault();
            addInvestment();
            modal.classList.remove('active');
            form.reset();
        };
    };
}

function updateInvestment(id) {
    const index = appData.investments.findIndex(inv => inv.id === id);
    if (index === -1) return;
    
    const oldInvestment = appData.investments[index];
    
    appData.investments[index] = {
        id: id,
        name: document.getElementById('investmentName').value,
        symbol: document.getElementById('investmentSymbol').value,
        quantity: parseFloat(document.getElementById('investmentQuantity').value),
        purchasePrice: parseFloat(document.getElementById('investmentPrice').value),
        purchaseDate: document.getElementById('investmentDate').value,
        currentPrice: oldInvestment.currentPrice // Preserve current price
    };
    
    localStorage.setItem('investments', JSON.stringify(appData.investments));
    loadInvestments();
    updateDashboard();
}

function deleteInvestment(id) {
    if (!confirm('この投資を削除してもよろしいですか？')) return;
    
    appData.investments = appData.investments.filter(inv => inv.id !== id);
    localStorage.setItem('investments', JSON.stringify(appData.investments));
    
    loadInvestments();
    updateDashboard();
    
    showNotification('投資が削除されました。', 'info');
}

// Update investment prices (simulated)
function updateInvestmentPrices() {
    let pricesChanged = false;
    
    appData.investments.forEach(investment => {
        // Simulate price movement (-2% to +2% per update)
        const change = (Math.random() - 0.5) * 0.04;
        const newPrice = investment.currentPrice * (1 + change);
        
        // Round to 2 decimal places
        investment.currentPrice = Math.round(newPrice * 100) / 100;
        pricesChanged = true;
    });
    
    if (pricesChanged) {
        localStorage.setItem('investments', JSON.stringify(appData.investments));
        loadInvestments();
        updateDashboard();
        
        // Update charts if on dashboard
        if (document.querySelector('.tab-content.active').id === 'dashboard') {
            updateCharts();
        }
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div>${message}</div>
        <button class="notification-close">&times;</button>
    `;
    
    container.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
        removeNotification(notification);
    }, 5000);
    
    // Manual close
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoRemove);
        removeNotification(notification);
    });
}

function removeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Theme Toggle
function initializeThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'btn secondary theme-toggle';
    themeToggle.innerHTML = '🌙';
    themeToggle.title = 'ダークモード/ライトモード切り替え';
    
    const header = document.querySelector('header');
    header.appendChild(themeToggle);
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
}

// Goal Setting
function initializeGoalSetting() {
    const goalCard = document.createElement('div');
    goalCard.className = 'card';
    goalCard.innerHTML = `
        <h3>財務目標設定</h3>
        <div class="goal-setting">
            <div class="goal-item">
                <label>月間貯蓄目標</label>
                <input type="number" id="monthlySavingsGoal" placeholder="100000" value="${appData.goals?.monthlySavings || 100000}">
            </div>
            <div class="goal-item">
                <label>年間投資目標</label>
                <input type="number" id="yearlyInvestmentGoal" placeholder="1000000" value="${appData.goals?.yearlyInvestment || 1000000}">
            </div>
            <div class="goal-item">
                <label>緊急資金目標</label>
                <input type="number" id="emergencyFundGoal" placeholder="500000" value="${appData.goals?.emergencyFund || 500000}">
            </div>
            <button class="btn primary" onclick="saveGoals()">目標を保存</button>
        </div>
        <div class="goal-progress">
            <div class="progress-item">
                <span>月間貯蓄進捗</span>
                <div class="progress-bar">
                    <div class="progress" id="monthlySavingsProgress"></div>
                </div>
                <span id="monthlySavingsText">0%</span>
            </div>
        </div>
    `;
    
    const dashboardGrid = document.querySelector('.dashboard-grid');
    dashboardGrid.appendChild(goalCard);
    
    updateGoalProgress();
}

function saveGoals() {
    const goals = {
        monthlySavings: parseInt(document.getElementById('monthlySavingsGoal').value) || 100000,
        yearlyInvestment: parseInt(document.getElementById('yearlyInvestmentGoal').value) || 1000000,
        emergencyFund: parseInt(document.getElementById('emergencyFundGoal').value) || 500000
    };
    
    appData.goals = goals;
    localStorage.setItem('goals', JSON.stringify(goals));
    updateGoalProgress();
    showNotification('目標が保存されました', 'success');
}

function updateGoalProgress() {
    if (!appData.goals) return;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calculate monthly savings
    const monthlyTransactions = appData.transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });
    
    const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsProgress = Math.min((monthlySavings / appData.goals.monthlySavings) * 100, 100);
    
    const progressBar = document.getElementById('monthlySavingsProgress');
    const progressText = document.getElementById('monthlySavingsText');
    
    if (progressBar && progressText) {
        progressBar.style.width = `${savingsProgress}%`;
        progressText.textContent = `${Math.round(savingsProgress)}%`;
        
        // Color coding
        if (savingsProgress >= 100) {
            progressBar.style.background = '#00ff88';
        } else if (savingsProgress >= 75) {
            progressBar.style.background = '#ffaa00';
        } else {
            progressBar.style.background = '#ff4444';
        }
    }
}

// Notification System
function initializeNotificationSystem() {
    // Create notification container
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'notificationContainer';
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
    
    // Check for budget alerts
    checkBudgetAlerts();
    
    // Check for goal reminders
    checkGoalReminders();
}

function checkBudgetAlerts() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyExpenses = appData.transactions
        .filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'expense' && 
                   tDate.getMonth() === currentMonth && 
                   tDate.getFullYear() === currentYear;
        })
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});
    
    Object.entries(monthlyExpenses).forEach(([category, spent]) => {
        const budget = appData.budget[category];
        if (budget && spent > budget * 0.8) {
            const percentage = Math.round((spent / budget) * 100);
            showNotification(
                `${getCategoryName(category)}の予算を${percentage}%使用しています`,
                percentage > 100 ? 'error' : 'warning'
            );
        }
    });
}

function checkGoalReminders() {
    if (!appData.goals) return;
    
    const now = new Date();
    const dayOfMonth = now.getDate();
    
    // Monthly reminder on the 25th
    if (dayOfMonth === 25) {
        showNotification('月末が近づいています。貯蓄目標の確認をお忘れなく！', 'info');
    }
}

// Enhanced Statistics
function calculateDetailedStats() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Yearly stats
    const yearlyTransactions = appData.transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === currentYear;
    });
    
    const yearlyIncome = yearlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const yearlyExpenses = yearlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Monthly averages
    const monthsWithData = new Set(yearlyTransactions.map(t => new Date(t.date).getMonth())).size;
    const avgMonthlyIncome = monthsWithData > 0 ? yearlyIncome / monthsWithData : 0;
    const avgMonthlyExpenses = monthsWithData > 0 ? yearlyExpenses / monthsWithData : 0;
    
    // Investment performance
    const totalInvestmentValue = appData.investments.reduce((sum, inv) => {
        return sum + (inv.quantity * (inv.currentPrice || inv.purchasePrice));
    }, 0);
    
    const totalInvestmentCost = appData.investments.reduce((sum, inv) => {
        return sum + (inv.quantity * inv.purchasePrice);
    }, 0);
    
    const investmentReturn = totalInvestmentValue - totalInvestmentCost;
    const investmentReturnPercentage = totalInvestmentCost > 0 ? 
        ((investmentReturn / totalInvestmentCost) * 100) : 0;
    
    return {
        yearlyIncome,
        yearlyExpenses,
        avgMonthlyIncome,
        avgMonthlyExpenses,
        totalInvestmentValue,
        totalInvestmentCost,
        investmentReturn,
        investmentReturnPercentage,
        netWorth: yearlyIncome - yearlyExpenses + totalInvestmentValue
    };
}

// Initialize Statistics
function initializeStatistics() {
    // 統計タブが表示されたときのみ統計を更新
    const statisticsTab = document.querySelector('[data-tab="statistics"]');
    if (!statisticsTab) return;
    
    statisticsTab.addEventListener('click', () => {
        // タブが切り替わった後に統計を更新
        setTimeout(() => {
            const statisticsContent = document.getElementById('statistics');
            if (statisticsContent && statisticsContent.classList.contains('active')) {
                updateDetailedStatistics();
            }
        }, 100);
    });
}

function updateDetailedStatistics() {
    const stats = calculateDetailedStats();
    updateStatsGrid(stats);
    updateStatisticsCharts();
    updateFinancialAnalysis(stats);
}

function updateStatsGrid(stats) {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;
    
    statsGrid.innerHTML = `
        <div class="stat-card">
            <h4>年間収入</h4>
            <div class="value">¥${stats.yearlyIncome.toLocaleString()}</div>
        </div>
        <div class="stat-card">
            <h4>年間支出</h4>
            <div class="value">¥${stats.yearlyExpenses.toLocaleString()}</div>
        </div>
        <div class="stat-card">
            <h4>年間収支</h4>
            <div class="value ${stats.yearlyIncome - stats.yearlyExpenses >= 0 ? 'positive' : 'negative'}">
                ¥${(stats.yearlyIncome - stats.yearlyExpenses).toLocaleString()}
            </div>
        </div>
        <div class="stat-card">
            <h4>月平均収入</h4>
            <div class="value">¥${Math.round(stats.avgMonthlyIncome).toLocaleString()}</div>
        </div>
        <div class="stat-card">
            <h4>月平均支出</h4>
            <div class="value">¥${Math.round(stats.avgMonthlyExpenses).toLocaleString()}</div>
        </div>
        <div class="stat-card">
            <h4>投資総額</h4>
            <div class="value">¥${stats.totalInvestmentValue.toLocaleString()}</div>
        </div>
        <div class="stat-card">
            <h4>投資損益</h4>
            <div class="value ${stats.investmentReturn >= 0 ? 'positive' : 'negative'}">
                ¥${stats.investmentReturn.toLocaleString()}
            </div>
            <div class="change ${stats.investmentReturnPercentage >= 0 ? 'positive' : 'negative'}">
                ${stats.investmentReturnPercentage >= 0 ? '+' : ''}${stats.investmentReturnPercentage.toFixed(2)}%
            </div>
        </div>
        <div class="stat-card">
            <h4>純資産</h4>
            <div class="value">¥${stats.netWorth.toLocaleString()}</div>
        </div>
    `;
}

function updateStatisticsCharts() {
    updateYearlyTrendChart();
    updateCategoryTrendChart();
}

function updateYearlyTrendChart() {
    const ctx = document.getElementById('yearlyTrendChart');
    if (!ctx) return;
    
    // 既存のチャートインスタンスを破棄
    if (yearlyTrendChart) {
        yearlyTrendChart.destroy();
    }
    
    // Calculate monthly data for the current year
    const currentYear = new Date().getFullYear();
    const monthlyData = Array.from({length: 12}, (_, month) => {
        const monthTransactions = appData.transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getFullYear() === currentYear && tDate.getMonth() === month;
        });
        
        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        return { income, expenses, balance: income - expenses };
    });
    
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', 
                   '7月', '8月', '9月', '10月', '11月', '12月'];
    
    yearlyTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: '収入',
                    data: monthlyData.map(d => d.income),
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    tension: 0.4
                },
                {
                    label: '支出',
                    data: monthlyData.map(d => d.expenses),
                    borderColor: '#ff4444',
                    backgroundColor: 'rgba(255, 68, 68, 0.1)',
                    tension: 0.4
                },
                {
                    label: '収支',
                    data: monthlyData.map(d => d.balance),
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#fff' },
                    grid: { color: '#333' }
                },
                x: {
                    ticks: { color: '#fff' },
                    grid: { color: '#333' }
                }
            }
        }
    });
}

function updateCategoryTrendChart() {
    const ctx = document.getElementById('categoryTrendChart');
    if (!ctx) return;
    
    // 既存のチャートインスタンスを破棄
    if (categoryTrendChart) {
        categoryTrendChart.destroy();
    }
    
    // Calculate category spending for last 6 months
    const currentDate = new Date();
    const monthlyCategories = {};
    
    for (let i = 5; i >= 0; i--) {
        const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = `${month.getFullYear()}-${month.getMonth()}`;
        
        const monthTransactions = appData.transactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'expense' && 
                   tDate.getFullYear() === month.getFullYear() && 
                   tDate.getMonth() === month.getMonth();
        });
        
        monthlyCategories[monthKey] = monthTransactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});
    }
    
    const categories = ['food', 'transport', 'entertainment', 'utilities'];
    const colors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'];
    const months = Object.keys(monthlyCategories).map(key => {
        const [year, month] = key.split('-');
        return `${parseInt(month) + 1}月`;
    });
    
    const datasets = categories.map((category, index) => ({
        label: getCategoryName(category),
        data: Object.values(monthlyCategories).map(month => month[category] || 0),
        borderColor: colors[index],
        backgroundColor: colors[index] + '20',
        tension: 0.4
    }));
    
    categoryTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#fff' },
                    grid: { color: '#333' }
                },
                x: {
                    ticks: { color: '#fff' },
                    grid: { color: '#333' }
                }
            }
        }
    });
}

function updateFinancialAnalysis(stats) {
    const analysisDiv = document.getElementById('financialAnalysis');
    if (!analysisDiv) return;
    
    const savingsRate = stats.yearlyIncome > 0 ? 
        ((stats.yearlyIncome - stats.yearlyExpenses) / stats.yearlyIncome * 100) : 0;
    
    const emergencyFundMonths = stats.avgMonthlyExpenses > 0 ? 
        (stats.netWorth / stats.avgMonthlyExpenses) : 0;
    
    let analysis = `
        <div class="analysis-item">
            <h4>💰 貯蓄率分析</h4>
            <p>現在の貯蓄率: <strong>${savingsRate.toFixed(1)}%</strong></p>
            <p>${savingsRate >= 20 ? '✅ 優秀な貯蓄率です！' : 
                 savingsRate >= 10 ? '⚠️ 貯蓄率を向上させましょう' : 
                 '❌ 貯蓄率が低すぎます'}</p>
        </div>
        
        <div class="analysis-item">
            <h4>🛡️ 緊急資金分析</h4>
            <p>緊急資金: <strong>${emergencyFundMonths.toFixed(1)}ヶ月分</strong></p>
            <p>${emergencyFundMonths >= 6 ? '✅ 十分な緊急資金があります' : 
                 emergencyFundMonths >= 3 ? '⚠️ 緊急資金を増やしましょう' : 
                 '❌ 緊急資金が不足しています'}</p>
        </div>
        
        <div class="analysis-item">
            <h4>📈 投資パフォーマンス</h4>
            <p>投資収益率: <strong>${stats.investmentReturnPercentage.toFixed(2)}%</strong></p>
            <p>${stats.investmentReturnPercentage >= 5 ? '✅ 良好な投資パフォーマンス' : 
                 stats.investmentReturnPercentage >= 0 ? '⚠️ 投資戦略の見直しを検討' : 
                 '❌ 投資損失が発生しています'}</p>
        </div>
    `;
    
    analysisDiv.innerHTML = analysis;
}