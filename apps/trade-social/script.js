// TradeSocial App JavaScript
class TradeSocialApp {
    constructor() {
        this.portfolioValue = 1000000;
        this.holdings = [];
        this.tradeHistory = [];
        this.selectedStock = { symbol: 'AAPL', name: 'Apple Inc.', price: 191.24 };
        this.tradeType = 'buy';
        this.quantity = 1;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTabs();
        this.loadSampleData();
        this.updatePortfolioDisplay();
        this.renderPopularStocks();
        this.renderHoldings();
        this.renderTradeHistory();
        this.renderSocialFeed();
        this.renderTopTraders();
        this.renderRankings();
        this.renderCompetitions();
        this.renderMarketNews();
        this.initChart();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Trade type selection
        document.querySelectorAll('.trade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setTradeType(e.target.dataset.type));
        });

        // Quantity input
        document.getElementById('quantity').addEventListener('input', () => this.updateTotalAmount());

        // Execute trade
        document.getElementById('execute-trade').addEventListener('click', () => this.showTradeModal());

        // Modal actions
        document.getElementById('confirm-trade').addEventListener('click', () => this.executeTrade());
        document.getElementById('cancel-trade').addEventListener('click', () => this.hideTradeModal());

        // AI Coach
        document.getElementById('send-to-coach').addEventListener('click', () => this.sendToAICoach());
        document.getElementById('coach-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendToAICoach();
        });

        // League selector
        document.querySelectorAll('.league-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchLeague(e.target.dataset.league));
        });
    }

    initializeTabs() {
        this.switchTab('market');
    }

    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab content
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    setTradeType(type) {
        this.tradeType = type;
        document.querySelectorAll('.trade-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
    }

    updateTotalAmount() {
        this.quantity = parseInt(document.getElementById('quantity').value) || 1;
        const total = (this.selectedStock.price * this.quantity * 139).toLocaleString(); // Assuming 139 JPY/USD
        document.getElementById('total-amount').textContent = total;
    }

    showTradeModal() {
        const modal = document.getElementById('trade-modal');
        const orderDetails = document.getElementById('order-details');
        
        const total = (this.selectedStock.price * this.quantity * 139).toLocaleString();
        
        orderDetails.innerHTML = `
            <div class="order-summary">
                <p><strong>銘柄:</strong> ${this.selectedStock.symbol} - ${this.selectedStock.name}</p>
                <p><strong>注文種別:</strong> ${this.tradeType === 'buy' ? '買い' : '売り'}</p>
                <p><strong>数量:</strong> ${this.quantity}株</p>
                <p><strong>価格:</strong> $${this.selectedStock.price}</p>
                <p><strong>合計金額:</strong> ¥${total}</p>
            </div>
        `;
        
        modal.classList.add('active');
    }

    hideTradeModal() {
        document.getElementById('trade-modal').classList.remove('active');
    }

    executeTrade() {
        const trade = {
            id: Date.now(),
            symbol: this.selectedStock.symbol,
            name: this.selectedStock.name,
            type: this.tradeType,
            quantity: this.quantity,
            price: this.selectedStock.price,
            total: this.selectedStock.price * this.quantity * 139,
            date: new Date(),
            pnl: 0
        };

        if (this.tradeType === 'buy') {
            // Add to holdings
            const existingHolding = this.holdings.find(h => h.symbol === trade.symbol);
            if (existingHolding) {
                existingHolding.quantity += trade.quantity;
                existingHolding.avgPrice = ((existingHolding.avgPrice * existingHolding.quantity) + (trade.price * trade.quantity)) / existingHolding.quantity;
            } else {
                this.holdings.push({
                    symbol: trade.symbol,
                    name: trade.name,
                    quantity: trade.quantity,
                    avgPrice: trade.price,
                    currentPrice: trade.price,
                    pnl: 0
                });
            }
            this.portfolioValue -= trade.total;
        } else {
            // Sell from holdings
            const holding = this.holdings.find(h => h.symbol === trade.symbol);
            if (holding && holding.quantity >= trade.quantity) {
                holding.quantity -= trade.quantity;
                if (holding.quantity === 0) {
                    this.holdings = this.holdings.filter(h => h.symbol !== trade.symbol);
                }
                this.portfolioValue += trade.total;
                trade.pnl = (trade.price - holding.avgPrice) * trade.quantity * 139;
            }
        }

        this.tradeHistory.unshift(trade);
        this.updatePortfolioDisplay();
        this.renderHoldings();
        this.renderTradeHistory();
        this.hideTradeModal();
        this.showAchievementToast(`${this.tradeType === 'buy' ? '購入' : '売却'}完了: ${trade.symbol}`);
    }

    updatePortfolioDisplay() {
        const holdingsValue = this.holdings.reduce((sum, holding) => 
            sum + (holding.currentPrice * holding.quantity * 139), 0);
        const totalValue = this.portfolioValue + holdingsValue;
        
        document.getElementById('portfolio-value').textContent = totalValue.toLocaleString();
        
        // Calculate daily P&L (simulated)
        const dailyPnl = Math.random() * 20000 - 10000;
        const dailyPnlPercent = (dailyPnl / totalValue * 100).toFixed(2);
        const pnlElement = document.getElementById('daily-pnl');
        pnlElement.textContent = `${dailyPnl >= 0 ? '+' : ''}¥${Math.abs(dailyPnl).toLocaleString()} (${dailyPnlPercent}%)`;
        pnlElement.className = dailyPnl >= 0 ? 'profit positive' : 'profit negative';
    }

    loadSampleData() {
        // Sample holdings
        this.holdings = [
            { symbol: 'AAPL', name: 'Apple Inc.', quantity: 10, avgPrice: 185.50, currentPrice: 191.24, pnl: 5740 },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', quantity: 5, avgPrice: 142.30, currentPrice: 145.80, pnl: 1750 },
            { symbol: 'MSFT', name: 'Microsoft Corp.', quantity: 8, avgPrice: 380.00, currentPrice: 378.50, pnl: -1200 }
        ];

        // Sample trade history
        this.tradeHistory = [
            { symbol: 'TSLA', name: 'Tesla Inc.', type: 'sell', quantity: 5, price: 245.67, total: 170717, date: new Date(Date.now() - 86400000), pnl: 12500 },
            { symbol: 'AAPL', name: 'Apple Inc.', type: 'buy', quantity: 10, price: 185.50, total: 257745, date: new Date(Date.now() - 172800000), pnl: 0 }
        ];
    }

    renderPopularStocks() {
        const stocks = [
            { symbol: 'AAPL', name: 'Apple Inc.', price: '$191.24' },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '$145.80' },
            { symbol: 'MSFT', name: 'Microsoft Corp.', price: '$378.50' },
            { symbol: 'TSLA', name: 'Tesla Inc.', price: '$245.67' },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', price: '$178.32' }
        ];

        const container = document.getElementById('popular-stocks');
        container.innerHTML = stocks.map(stock => `
            <div class="stock-item" onclick="app.selectStock('${stock.symbol}', '${stock.name}', '${stock.price.slice(1)}')">
                <div class="stock-info">
                    <span class="stock-symbol">${stock.symbol}</span>
                    <span class="stock-name">${stock.name}</span>
                </div>
                <span class="stock-price">${stock.price}</span>
            </div>
        `).join('');
    }

    selectStock(symbol, name, price) {
        this.selectedStock = { symbol, name, price: parseFloat(price) };
        document.querySelector('.selected-stock .stock-symbol').textContent = symbol;
        document.querySelector('.selected-stock .stock-name').textContent = name;
        document.querySelector('.selected-stock .stock-price').textContent = `$${price}`;
        this.updateTotalAmount();
    }

    renderHoldings() {
        const container = document.getElementById('holdings-list');
        container.innerHTML = this.holdings.map(holding => {
            const currentValue = holding.currentPrice * holding.quantity * 139;
            const pnl = (holding.currentPrice - holding.avgPrice) * holding.quantity * 139;
            const pnlPercent = (pnl / (holding.avgPrice * holding.quantity * 139) * 100).toFixed(2);
            
            return `
                <div class="holding-item">
                    <div class="holding-info">
                        <span class="holding-symbol">${holding.symbol}</span>
                        <span class="holding-quantity">${holding.quantity}株 @ $${holding.avgPrice.toFixed(2)}</span>
                    </div>
                    <div class="holding-value">
                        <div>¥${currentValue.toLocaleString()}</div>
                        <div class="holding-pnl ${pnl >= 0 ? 'positive' : 'negative'}">
                            ${pnl >= 0 ? '+' : ''}¥${Math.abs(pnl).toLocaleString()} (${pnlPercent}%)
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTradeHistory() {
        const container = document.getElementById('trade-history');
        container.innerHTML = this.tradeHistory.map(trade => `
            <div class="history-item">
                <div class="history-info">
                    <span class="history-symbol">${trade.symbol} - ${trade.type === 'buy' ? '買い' : '売り'}</span>
                    <span class="history-date">${trade.date.toLocaleDateString('ja-JP')} ${trade.quantity}株</span>
                </div>
                <div class="history-value">
                    <div>¥${trade.total.toLocaleString()}</div>
                    <div class="history-pnl ${trade.pnl >= 0 ? 'positive' : 'negative'}">
                        ${trade.pnl !== 0 ? `${trade.pnl >= 0 ? '+' : ''}¥${Math.abs(trade.pnl).toLocaleString()}` : '-'}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderSocialFeed() {
        const posts = [
            {
                user: 'InvestorPro',
                time: '2時間前',
                content: 'Appleの新製品発表で株価上昇期待📱 長期保有でさらなる上昇を狙います！',
                likes: 24,
                comments: 8
            },
            {
                user: 'TechTrader',
                time: '4時間前',
                content: 'AIセクターに注目。OpenAIの動向が関連銘柄に大きな影響を与えそう🤖',
                likes: 156,
                comments: 42
            },
            {
                user: 'MarketMaster',
                time: '6時間前',
                content: '今週の注目イベント：FOMCの結果発表。金利動向に要注意⚠️',
                likes: 89,
                comments: 23
            }
        ];

        const container = document.getElementById('social-feed');
        container.innerHTML = posts.map(post => `
            <div class="feed-item">
                <div class="feed-header">
                    <span class="user-name">${post.user}</span>
                    <span class="post-time">${post.time}</span>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-actions">
                    <button class="action-btn">👍 ${post.likes}</button>
                    <button class="action-btn">💬 ${post.comments}</button>
                    <button class="action-btn">📤 シェア</button>
                </div>
            </div>
        `).join('');
    }

    renderTopTraders() {
        const traders = [
            { rank: 1, name: 'GoldenTrader', return: '+45.2%', followers: '2.1K' },
            { rank: 2, name: 'BullMarket', return: '+38.7%', followers: '1.8K' },
            { rank: 3, name: 'StockSensei', return: '+34.1%', followers: '1.5K' },
            { rank: 4, name: 'TrendFollower', return: '+29.8%', followers: '1.2K' },
            { rank: 5, name: 'ValueInvestor', return: '+27.3%', followers: '980' }
        ];

        const container = document.getElementById('top-traders');
        container.innerHTML = traders.map(trader => `
            <div class="trader-item">
                <div class="trader-info">
                    <div class="trader-rank">${trader.rank}</div>
                    <div class="trader-details">
                        <div class="trader-name">${trader.name}</div>
                        <div class="trader-return">年間収益率: ${trader.return}</div>
                    </div>
                </div>
                <button class="follow-btn">フォロー</button>
            </div>
        `).join('');
    }

    renderRankings() {
        const rankings = [
            { rank: 1, name: 'あなた', return: '+12.5%', badge: 'gold' },
            { rank: 2, name: 'TradeKing', return: '+11.8%', badge: 'silver' },
            { rank: 3, name: 'MarketPro', return: '+10.2%', badge: 'bronze' },
            { rank: 4, name: 'StockHero', return: '+9.7%', badge: 'normal' },
            { rank: 5, name: 'InvestMaster', return: '+8.9%', badge: 'normal' }
        ];

        const container = document.getElementById('ranking-list');
        container.innerHTML = rankings.map(rank => `
            <div class="ranking-item">
                <div class="rank-info">
                    <div class="rank-number ${rank.badge}">${rank.rank}</div>
                    <div class="trader-details">
                        <div class="trader-name">${rank.name}</div>
                        <div class="trader-return">週間収益率: ${rank.return}</div>
                    </div>
                </div>
                <div class="rank-stats">
                    ${rank.name === 'あなた' ? '🏆' : ''}
                </div>
            </div>
        `).join('');
    }

    switchLeague(league) {
        document.querySelectorAll('.league-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-league="${league}"]`).classList.add('active');
        
        // Re-render rankings based on league (simulation)
        this.renderRankings();
    }

    renderCompetitions() {
        const competitions = [
            {
                title: '🏆 グローバルトレードチャンピオンシップ',
                prize: '¥1,000,000',
                participants: '15,432',
                timeLeft: '5日'
            },
            {
                title: '📈 テクニカル分析マスター',
                prize: '¥500,000',
                participants: '8,921',
                timeLeft: '12日'
            },
            {
                title: '💎 長期投資王決定戦',
                prize: '¥750,000',
                participants: '6,543',
                timeLeft: '25日'
            }
        ];

        const container = document.getElementById('competition-list');
        container.innerHTML = competitions.map(comp => `
            <div class="competition-item">
                <div class="competition-title">${comp.title}</div>
                <div class="competition-details">
                    <span>賞金: ${comp.prize}</span>
                    <span>参加者: ${comp.participants}人</span>
                    <span>残り: ${comp.timeLeft}</span>
                    <button class="join-btn">参加</button>
                </div>
            </div>
        `).join('');
    }

    renderMarketNews() {
        const news = [
            {
                title: 'Apple、新型iPhoneの売上が予想を上回る',
                summary: 'iPhone 15の売上が市場予想を20%上回り、株価が上昇。特にPro Maxモデルの需要が...',
                time: '30分前'
            },
            {
                title: 'FRB、金利据え置きを決定',
                summary: '連邦準備制度理事会は政策金利を現行の5.25-5.50%で据え置くことを決定。インフレ率の...',
                time: '1時間前'
            },
            {
                title: 'Tesla、新工場建設を発表',
                summary: 'テスラは新たにメキシコに工場を建設することを発表。年間生産能力は200万台を予定...',
                time: '2時間前'
            },
            {
                title: 'Microsoft、AI事業を強化',
                summary: 'マイクロソフトがOpenAIとの提携を深化。Azure AIサービスの拡充により...',
                time: '3時間前'
            }
        ];

        const container = document.getElementById('market-news');
        container.innerHTML = news.map(item => `
            <div class="news-item">
                <div class="news-title">${item.title}</div>
                <div class="news-summary">${item.summary}</div>
                <div class="news-time">${item.time}</div>
            </div>
        `).join('');
    }

    sendToAICoach() {
        const input = document.getElementById('coach-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addChatMessage('user', message, '👤');
        input.value = '';
        
        // Simulate AI response
        setTimeout(() => {
            const responses = [
                'その銘柄は技術的分析によると上昇トレンドにありますね。ただし、リスク管理も重要です。',
                '市場の流動性を考慮すると、分散投資がおすすめです。ポートフォリオの20%以下に抑えましょう。',
                '現在のマーケット環境では、防御的な銘柄も検討してみてください。ユーティリティセクターはいかがでしょう？',
                '短期的な変動に惑わされず、長期的な企業価値を見極めることが大切です。',
                'この銘柄のPERは業界平均と比較して割安ですね。ファンダメンタルズ分析の結果は良好です。'
            ];
            const response = responses[Math.floor(Math.random() * responses.length)];
            this.addChatMessage('ai', response, '🤖');
        }, 1000);
    }

    addChatMessage(type, content, avatar) {
        const messagesContainer = document.getElementById('coach-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <span class="avatar">${avatar}</span>
            <div class="content">
                <p>${content}</p>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    initChart() {
        const ctx = document.getElementById('price-chart');
        if (!ctx) return;

        // Generate sample price data
        const labels = [];
        const data = [];
        const basePrice = 191.24;
        
        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }));
            
            const randomChange = (Math.random() - 0.5) * 10;
            const price = i === 0 ? basePrice : basePrice + randomChange;
            data.push(price);
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'AAPL',
                    data: data,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        });
    }

    showAchievementToast(message) {
        const toast = document.getElementById('achievement-toast');
        toast.querySelector('.toast-message').textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TradeSocialApp();
});

// Add some interactive animations
document.addEventListener('DOMContentLoaded', () => {
    // Animate cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards and items
    document.querySelectorAll('.index-card, .stock-item, .holding-item, .trader-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});