// Investment Management System
const Investments = {
    fds: [],
    stocks: [],
    crypto: [],
    
    // Market data (simulated)
    stockMarket: [
        { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2500, change: 2.5, icon: '🏭' },
        { symbol: 'TCS', name: 'Tata Consultancy', price: 3500, change: 1.8, icon: '💻' },
        { symbol: 'INFY', name: 'Infosys Ltd', price: 1450, change: -0.5, icon: '🖥️' },
        { symbol: 'HDFC', name: 'HDFC Bank', price: 1600, change: 1.2, icon: '🏦' },
        { symbol: 'BHARTI', name: 'Bharti Airtel', price: 850, change: 3.1, icon: '📱' },
        { symbol: 'ITC', name: 'ITC Limited', price: 420, change: -1.2, icon: '🏢' }
    ],
    
    cryptoMarket: [
        { symbol: 'BTC', name: 'Bitcoin', price: 4500000, change: 5.2, icon: '₿' },
        { symbol: 'ETH', name: 'Ethereum', price: 250000, change: 3.8, icon: 'Ξ' },
        { symbol: 'BNB', name: 'Binance Coin', price: 35000, change: -2.1, icon: '🔶' },
        { symbol: 'SOL', name: 'Solana', price: 12000, change: 8.5, icon: '◎' },
        { symbol: 'ADA', name: 'Cardano', price: 45, change: 1.5, icon: '₳' },
        { symbol: 'DOGE', name: 'Dogecoin', price: 8, change: 15.3, icon: '🐕' }
    ],
    
    init() {
        this.loadData();
        this.initEventListeners();
        this.simulateMarketChanges();
    },
    
    loadData() {
        this.fds = JSON.parse(localStorage.getItem('cbi_fds')) || [];
        this.stocks = JSON.parse(localStorage.getItem('cbi_stocks')) || [];
        this.crypto = JSON.parse(localStorage.getItem('cbi_crypto')) || [];
    },
    
    saveData() {
        localStorage.setItem('cbi_fds', JSON.stringify(this.fds));
        localStorage.setItem('cbi_stocks', JSON.stringify(this.stocks));
        localStorage.setItem('cbi_crypto', JSON.stringify(this.crypto));
    },
    
    initEventListeners() {
        // Investment tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
        
        // Create FD
        document.getElementById('create-fd-btn')?.addEventListener('click', () => {
            App.openModal('create-fd-modal');
        });
        
        document.getElementById('fd-amount')?.addEventListener('input', () => {
            this.calculateFDMaturity();
        });
        
        document.getElementById('fd-tenure')?.addEventListener('change', () => {
            this.calculateFDMaturity();
        });
        
        document.getElementById('confirm-fd')?.addEventListener('click', () => {
            this.createFD();
        });
        
        // Buy stock
        document.getElementById('stock-quantity')?.addEventListener('input', () => {
            this.calculateStockCost();
        });
        
        document.getElementById('confirm-buy-stock')?.addEventListener('click', () => {
            this.buyStock();
        });
        
        // Buy crypto
        document.getElementById('crypto-amount')?.addEventListener('input', () => {
            this.calculateCryptoUnits();
        });
        
        document.getElementById('confirm-buy-crypto')?.addEventListener('click', () => {
            this.buyCrypto();
        });
    },
    
    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-tab`).classList.add('active');
        
        if (tab === 'stocks') {
            this.displayStockMarket();
        } else if (tab === 'crypto') {
            this.displayCryptoMarket();
        } else if (tab === 'fd') {
            this.displayFDs();
        } else if (tab === 'overview') {
            this.updateOverview();
        }
    },
    
    // Fixed Deposit Functions
    calculateFDMaturity() {
        const amount = parseInt(document.getElementById('fd-amount')?.value || 0);
        const tenure = parseInt(document.getElementById('fd-tenure')?.value || 0);
        
        const rates = { 3: 5, 6: 6, 12: 7, 24: 8 };
        const rate = rates[tenure] || 0;
        
        const interest = (amount * rate * (tenure / 12)) / 100;
        const maturity = amount + interest;
        
        document.getElementById('fd-maturity').textContent = Math.round(maturity).toLocaleString();
        document.getElementById('fd-interest').textContent = Math.round(interest).toLocaleString();
    },
    
    createFD() {
        const amount = parseInt(document.getElementById('fd-amount')?.value || 0);
        const tenure = parseInt(document.getElementById('fd-tenure')?.value || 0);
        
        if (!amount || amount < 100) {
            App.showNotification('Minimum FD amount is ₹100', 'error');
            return;
        }
        
        if (amount > App.currentUser.cashBalance) {
            App.showNotification('Insufficient cash balance', 'error');
            return;
        }
        
        const rates = { 3: 5, 6: 6, 12: 7, 24: 8 };
        const rate = rates[tenure];
        const interest = (amount * rate * (tenure / 12)) / 100;
        const maturity = amount + interest;
        
        const newFD = {
            id: this.fds.length + 1,
            userId: App.currentUser.id,
            amount: amount,
            tenure: tenure,
            rate: rate,
            maturityAmount: Math.round(maturity),
            interest: Math.round(interest),
            startDate: new Date().toISOString().split('T')[0],
            maturityDate: this.calculateMaturityDate(tenure),
            status: 'active'
        };
        
        this.fds.push(newFD);
        App.currentUser.cashBalance -= amount;
        
        // Add transaction
        const transaction = {
            id: App.transactions.length + 1,
            userId: App.currentUser.id,
            type: 'invest',
            amount: amount,
            description: `FD Created (${tenure} months @ ${rate}%)`,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        App.transactions.push(transaction);
        
        this.saveData();
        App.updateUserData();
        App.updateDashboard();
        App.closeModal('create-fd-modal');
        document.getElementById('fd-amount').value = '';
        
        App.showNotification(`FD created successfully! Maturity: ₹${maturity.toLocaleString()}`, 'success');
    },
    
    calculateMaturityDate(months) {
        const date = new Date();
        date.setMonth(date.getMonth() + months);
        return date.toISOString().split('T')[0];
    },
    
    displayFDs() {
        const list = document.getElementById('fd-list');
        if (!list) return;
        
        list.innerHTML = '';
        
        const userFDs = this.fds.filter(fd => fd.userId === App.currentUser.id && fd.status === 'active');
        
        if (userFDs.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No active FDs. Create your first FD!</p>';
            return;
        }
        
        userFDs.forEach(fd => {
            const div = document.createElement('div');
            div.className = 'investment-item';
            
            const daysLeft = Math.ceil((new Date(fd.maturityDate) - new Date()) / (1000 * 60 * 60 * 24));
            
            div.innerHTML = `
                <div class="investment-details">
                    <h4>🏦 Fixed Deposit</h4>
                    <p>Amount: ₹${fd.amount.toLocaleString()} | Rate: ${fd.rate}% p.a.</p>
                    <p>Maturity: ${fd.maturityDate} (${daysLeft} days left)</p>
                </div>
                <div class="investment-value">
                    <div class="amount">₹${fd.maturityAmount.toLocaleString()}</div>
                    <div class="return profit">+₹${fd.interest.toLocaleString()}</div>
                </div>
            `;
            list.appendChild(div);
        });
    },
    
    // Stock Functions
    displayStockMarket() {
        const grid = document.getElementById('stock-list');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.stockMarket.forEach(stock => {
            const div = document.createElement('div');
            div.className = 'market-item';
            
            div.innerHTML = `
                <div class="market-item-header">
                    <div class="market-icon">${stock.icon}</div>
                    <div class="market-info">
                        <h3>${stock.name}</h3>
                        <div class="symbol">${stock.symbol}</div>
                    </div>
                </div>
                <div class="market-price">₹${stock.price.toLocaleString()}</div>
                <div class="market-change ${stock.change >= 0 ? 'positive' : 'negative'}">
                    ${stock.change >= 0 ? '▲' : '▼'} ${Math.abs(stock.change)}%
                </div>
                <button class="btn btn-secondary">Buy Stock</button>
            `;
            
            div.querySelector('.btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.showBuyStockModal(stock);
            });
            
            grid.appendChild(div);
        });
        
        this.displayMyStocks();
    },
    
    showBuyStockModal(stock) {
        this.selectedStock = stock;
        
        const modalInfo = document.getElementById('stock-modal-info');
        modalInfo.innerHTML = `
            <div class="market-item-header" style="margin-bottom: 15px;">
                <div class="market-icon">${stock.icon}</div>
                <div class="market-info">
                    <h3>${stock.name}</h3>
                    <div class="symbol">${stock.symbol}</div>
                </div>
            </div>
            <p><strong>Current Price:</strong> ₹${stock.price.toLocaleString()}</p>
        `;
        
        document.getElementById('stock-quantity').value = 1;
        this.calculateStockCost();
        App.openModal('buy-stock-modal');
    },
    
    calculateStockCost() {
        if (!this.selectedStock) return;
        
        const quantity = parseInt(document.getElementById('stock-quantity')?.value || 0);
        const total = quantity * this.selectedStock.price;
        
        document.getElementById('stock-total-cost').textContent = total.toLocaleString();
    },
    
    buyStock() {
        const quantity = parseInt(document.getElementById('stock-quantity')?.value || 0);
        
        if (!quantity || quantity <= 0) {
            App.showNotification('Please enter a valid quantity', 'error');
            return;
        }
        
        const totalCost = quantity * this.selectedStock.price;
        
        if (totalCost > App.currentUser.cashBalance) {
            App.showNotification('Insufficient cash balance', 'error');
            return;
        }
        
        // Check if user already owns this stock
        const existingStock = this.stocks.find(s => 
            s.userId === App.currentUser.id && 
            s.symbol === this.selectedStock.symbol
        );
        
        if (existingStock) {
            existingStock.quantity += quantity;
            existingStock.totalInvested += totalCost;
            existingStock.avgPrice = existingStock.totalInvested / existingStock.quantity;
        } else {
            const newStock = {
                id: this.stocks.length + 1,
                userId: App.currentUser.id,
                symbol: this.selectedStock.symbol,
                name: this.selectedStock.name,
                icon: this.selectedStock.icon,
                quantity: quantity,
                avgPrice: this.selectedStock.price,
                totalInvested: totalCost,
                purchaseDate: new Date().toISOString().split('T')[0]
            };
            this.stocks.push(newStock);
        }
        
        App.currentUser.cashBalance -= totalCost;
        
        // Add transaction
        const transaction = {
            id: App.transactions.length + 1,
            userId: App.currentUser.id,
            type: 'invest',
            amount: totalCost,
            description: `Bought ${quantity} ${this.selectedStock.symbol} @ ₹${this.selectedStock.price}`,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        App.transactions.push(transaction);
        
        this.saveData();
        App.updateUserData();
        App.updateDashboard();
        App.closeModal('buy-stock-modal');
        
        App.showNotification(`Successfully bought ${quantity} shares of ${this.selectedStock.name}!`, 'success');
        
        this.displayStockMarket();
    },
    
    displayMyStocks() {
        const list = document.getElementById('my-stocks');
        if (!list) return;
        
        list.innerHTML = '';
        
        const userStocks = this.stocks.filter(s => s.userId === App.currentUser.id);
        
        if (userStocks.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No stock holdings yet. Buy your first stock!</p>';
            return;
        }
        
        userStocks.forEach(stock => {
            const currentPrice = this.stockMarket.find(s => s.symbol === stock.symbol)?.price || stock.avgPrice;
            const currentValue = stock.quantity * currentPrice;
            const pnl = currentValue - stock.totalInvested;
            const pnlPercent = ((pnl / stock.totalInvested) * 100).toFixed(2);
            
            const div = document.createElement('div');
            div.className = 'investment-item';
            
            div.innerHTML = `
                <div class="investment-details">
                    <h4>${stock.icon} ${stock.name}</h4>
                    <p>Qty: ${stock.quantity} | Avg: ₹${stock.avgPrice.toLocaleString()} | Current: ₹${currentPrice.toLocaleString()}</p>
                    <p>Invested: ₹${stock.totalInvested.toLocaleString()}</p>
                </div>
                <div class="investment-value">
                    <div class="amount">₹${currentValue.toLocaleString()}</div>
                    <div class="return ${pnl >= 0 ? 'profit' : 'loss'}">
                        ${pnl >= 0 ? '+' : ''}₹${pnl.toLocaleString()} (${pnlPercent}%)
                    </div>
                </div>
            `;
            list.appendChild(div);
        });
    },
    
    // Crypto Functions
    displayCryptoMarket() {
        const grid = document.getElementById('crypto-list');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.cryptoMarket.forEach(crypto => {
            const div = document.createElement('div');
            div.className = 'market-item';
            
            div.innerHTML = `
                <div class="market-item-header">
                    <div class="market-icon">${crypto.icon}</div>
                    <div class="market-info">
                        <h3>${crypto.name}</h3>
                        <div class="symbol">${crypto.symbol}</div>
                    </div>
                </div>
                <div class="market-price">₹${crypto.price.toLocaleString()}</div>
                <div class="market-change ${crypto.change >= 0 ? 'positive' : 'negative'}">
                    ${crypto.change >= 0 ? '▲' : '▼'} ${Math.abs(crypto.change)}%
                </div>
                <button class="btn btn-secondary">Buy Crypto</button>
            `;
            
            div.querySelector('.btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.showBuyCryptoModal(crypto);
            });
            
            grid.appendChild(div);
        });
        
        this.displayMyCrypto();
    },
    
    showBuyCryptoModal(crypto) {
        this.selectedCrypto = crypto;
        
        const modalInfo = document.getElementById('crypto-modal-info');
        modalInfo.innerHTML = `
            <div class="market-item-header" style="margin-bottom: 15px;">
                <div class="market-icon">${crypto.icon}</div>
                <div class="market-info">
                    <h3>${crypto.name}</h3>
                    <div class="symbol">${crypto.symbol}</div>
                </div>
            </div>
            <p><strong>Current Price:</strong> ₹${crypto.price.toLocaleString()}</p>
        `;
        
        document.getElementById('crypto-amount').value = '';
        App.openModal('buy-crypto-modal');
    },
    
    calculateCryptoUnits() {
        if (!this.selectedCrypto) return;
        
        const amount = parseFloat(document.getElementById('crypto-amount')?.value || 0);
        const units = (amount / this.selectedCrypto.price).toFixed(8);
        
        document.getElementById('crypto-units').textContent = units;
    },
    
    buyCrypto() {
        const amount = parseFloat(document.getElementById('crypto-amount')?.value || 0);
        
        if (!amount || amount < 10) {
            App.showNotification('Minimum investment is ₹10', 'error');
            return;
        }
        
        if (amount > App.currentUser.cashBalance) {
            App.showNotification('Insufficient cash balance', 'error');
            return;
        }
        
        const units = amount / this.selectedCrypto.price;
        
        // Check if user already owns this crypto
        const existingCrypto = this.crypto.find(c => 
            c.userId === App.currentUser.id && 
            c.symbol === this.selectedCrypto.symbol
        );
        
        if (existingCrypto) {
            existingCrypto.units += units;
            existingCrypto.totalInvested += amount;
            existingCrypto.avgPrice = existingCrypto.totalInvested / existingCrypto.units;
        } else {
            const newCrypto = {
                id: this.crypto.length + 1,
                userId: App.currentUser.id,
                symbol: this.selectedCrypto.symbol,
                name: this.selectedCrypto.name,
                icon: this.selectedCrypto.icon,
                units: units,
                avgPrice: this.selectedCrypto.price,
                totalInvested: amount,
                purchaseDate: new Date().toISOString().split('T')[0]
            };
            this.crypto.push(newCrypto);
        }
        
        App.currentUser.cashBalance -= amount;
        
        // Add transaction
        const transaction = {
            id: App.transactions.length + 1,
            userId: App.currentUser.id,
            type: 'invest',
            amount: amount,
            description: `Bought ${units.toFixed(4)} ${this.selectedCrypto.symbol}`,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        App.transactions.push(transaction);
        
        this.saveData();
        App.updateUserData();
        App.updateDashboard();
        App.closeModal('buy-crypto-modal');
        
        App.showNotification(`Successfully bought ${units.toFixed(4)} ${this.selectedCrypto.name}!`, 'success');
        
        this.displayCryptoMarket();
    },
    
    displayMyCrypto() {
        const list = document.getElementById('my-crypto');
        if (!list) return;
        
        list.innerHTML = '';
        
        const userCrypto = this.crypto.filter(c => c.userId === App.currentUser.id);
        
        if (userCrypto.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No crypto holdings yet. Buy your first crypto!</p>';
            return;
        }
        
        userCrypto.forEach(crypto => {
            const currentPrice = this.cryptoMarket.find(c => c.symbol === crypto.symbol)?.price || crypto.avgPrice;
            const currentValue = crypto.units * currentPrice;
            const pnl = currentValue - crypto.totalInvested;
            const pnlPercent = ((pnl / crypto.totalInvested) * 100).toFixed(2);
            
            const div = document.createElement('div');
            div.className = 'investment-item';
            
            div.innerHTML = `
                <div class="investment-details">
                    <h4>${crypto.icon} ${crypto.name}</h4>
                    <p>Units: ${crypto.units.toFixed(6)} | Avg: ₹${crypto.avgPrice.toLocaleString()}</p>
                    <p>Invested: ₹${crypto.totalInvested.toLocaleString()}</p>
                </div>
                <div class="investment-value">
                    <div class="amount">₹${Math.round(currentValue).toLocaleString()}</div>
                    <div class="return ${pnl >= 0 ? 'profit' : 'loss'}">
                        ${pnl >= 0 ? '+' : ''}₹${Math.round(pnl).toLocaleString()} (${pnlPercent}%)
                    </div>
                </div>
            `;
            list.appendChild(div);
        });
    },
    
    // Overview & Summary Functions
    updateOverview() {
        const userId = App.currentUser.id;
        
        // Calculate totals
        const totalFD = this.fds
            .filter(fd => fd.userId === userId && fd.status === 'active')
            .reduce((sum, fd) => sum + fd.amount, 0);
        
        let totalStocks = 0;
        let stocksPnL = 0;
        this.stocks.filter(s => s.userId === userId).forEach(stock => {
            const currentPrice = this.stockMarket.find(s => s.symbol === stock.symbol)?.price || stock.avgPrice;
            const currentValue = stock.quantity * currentPrice;
            totalStocks += currentValue;
            stocksPnL += (currentValue - stock.totalInvested);
        });
        
        let totalCrypto = 0;
        let cryptoPnL = 0;
        this.crypto.filter(c => c.userId === userId).forEach(crypto => {
            const currentPrice = this.cryptoMarket.find(c => c.symbol === crypto.symbol)?.price || crypto.avgPrice;
            const currentValue = crypto.units * currentPrice;
            totalCrypto += currentValue;
            cryptoPnL += (currentValue - crypto.totalInvested);
        });
        
        // Update summary cards
        document.getElementById('total-fd').textContent = Math.round(totalFD).toLocaleString();
        document.getElementById('total-stocks').textContent = Math.round(totalStocks).toLocaleString();
        document.getElementById('total-crypto').textContent = Math.round(totalCrypto).toLocaleString();
        
        const fdReturn = totalFD > 0 ? 7 : 0; // Average FD rate
        const stocksReturn = totalStocks > 0 ? ((stocksPnL / (totalStocks - stocksPnL)) * 100).toFixed(1) : 0;
        const cryptoReturn = totalCrypto > 0 ? ((cryptoPnL / (totalCrypto - cryptoPnL)) * 100).toFixed(1) : 0;
        
        document.getElementById('fd-return').textContent = fdReturn;
        
        const stocksReturnEl = document.getElementById('stocks-return');
        stocksReturnEl.textContent = Math.abs(stocksReturn);
        stocksReturnEl.parentElement.className = 'summary-return ' + (stocksReturn >= 0 ? 'profit' : 'loss');
        stocksReturnEl.parentElement.textContent = (stocksReturn >= 0 ? '+' : '') + stocksReturn + '%';
        
        const cryptoReturnEl = document.getElementById('crypto-return');
        cryptoReturnEl.textContent = Math.abs(cryptoReturn);
        cryptoReturnEl.parentElement.className = 'summary-return ' + (cryptoReturn >= 0 ? 'profit' : 'loss');
        cryptoReturnEl.parentElement.textContent = (cryptoReturn >= 0 ? '+' : '') + cryptoReturn + '%';
        
        // Update chart
        this.updatePortfolioChart(totalFD, totalStocks, totalCrypto);
    },
    
    updatePortfolioChart(fd, stocks, crypto) {
        const canvas = document.getElementById('portfolio-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if any
        if (window.portfolioChart) {
            window.portfolioChart.destroy();
        }
        
        window.portfolioChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Fixed Deposits', 'Stocks', 'Cryptocurrency'],
                datasets: [{
                    data: [fd, stocks, crypto],
                    backgroundColor: ['#4CAF50', '#2196F3', '#FFC107'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },
    
    getTotalValue(userId) {
        const totalFD = this.fds
            .filter(fd => fd.userId === userId && fd.status === 'active')
            .reduce((sum, fd) => sum + fd.amount, 0);
        
        let totalStocks = 0;
        this.stocks.filter(s => s.userId === userId).forEach(stock => {
            const currentPrice = this.stockMarket.find(s => s.symbol === stock.symbol)?.price || stock.avgPrice;
            totalStocks += stock.quantity * currentPrice;
        });
        
        let totalCrypto = 0;
        this.crypto.filter(c => c.userId === userId).forEach(crypto => {
            const currentPrice = this.cryptoMarket.find(c => c.symbol === crypto.symbol)?.price || crypto.avgPrice;
            totalCrypto += crypto.units * currentPrice;
        });
        
        return Math.round(totalFD + totalStocks + totalCrypto);
    },
    
    getTotalPnL(userId) {
        let pnl = 0;
        
        // Stocks P&L
        this.stocks.filter(s => s.userId === userId).forEach(stock => {
            const currentPrice = this.stockMarket.find(s => s.symbol === stock.symbol)?.price || stock.avgPrice;
            const currentValue = stock.quantity * currentPrice;
            pnl += (currentValue - stock.totalInvested);
        });
        
        // Crypto P&L
        this.crypto.filter(c => c.userId === userId).forEach(crypto => {
            const currentPrice = this.cryptoMarket.find(c => c.symbol === crypto.symbol)?.price || crypto.avgPrice;
            const currentValue = crypto.units * currentPrice;
            pnl += (currentValue - crypto.totalInvested);
        });
        
        return Math.round(pnl);
    },
    
    // Simulate market price changes
    simulateMarketChanges() {
        setInterval(() => {
            // Update stock prices (small random changes)
            this.stockMarket.forEach(stock => {
                const change = (Math.random() - 0.5) * 50; // ±₹25 max change
                stock.price = Math.max(100, stock.price + change);
                stock.change = ((Math.random() - 0.5) * 5).toFixed(1); // ±2.5% max
            });
            
            // Update crypto prices (larger volatility)
            this.cryptoMarket.forEach(crypto => {
                const changePercent = (Math.random() - 0.5) * 0.1; // ±5% max
                crypto.price = Math.max(1, crypto.price * (1 + changePercent));
                crypto.change = (changePercent * 100).toFixed(1);
            });
            
            // Refresh displays if on investment page
            const activeTab = document.querySelector('.tab-btn.active')?.getAttribute('data-tab');
            if (activeTab === 'stocks') {
                this.displayStockMarket();
            } else if (activeTab === 'crypto') {
                this.displayCryptoMarket();
            } else if (activeTab === 'overview') {
                this.updateOverview();
            }
            
            // Update dashboard portfolio value
            if (App.currentUser) {
                App.updateDashboard();
            }
        }, 10000); // Update every 10 seconds
    },
    
    updateDashboard() {
        this.displayFDs();
        this.displayMyStocks();
        this.displayMyCrypto();
        this.updateOverview();
    }
};

// Initialize investments when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Investments.init();
});
