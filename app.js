// Main App State
const App = {
    currentUser: null,
    users: [],
    transactions: [],
    goals: [],
    
    init() {
        this.loadData();
        this.initEventListeners();
        this.updateNavigation(false);
    },
    
    loadData() {
        this.users = JSON.parse(localStorage.getItem('cbi_users')) || [];
        this.transactions = JSON.parse(localStorage.getItem('cbi_transactions')) || [];
        this.goals = JSON.parse(localStorage.getItem('cbi_goals')) || [];
        
        if (this.users.length === 0) {
            this.users = [{
                id: 1,
                name: "Rahul Sharma",
                username: "rahul123",
                password: "password123",
                email: "parent@example.com",
                age: 10,
                accountNumber: "CB-100000001",
                cashBalance: 5000,
                totalEarned: 5000,
                joinDate: "2024-01-15",
                avatarColor: "#FFC107"
            }];
            this.saveData();
        }
        
        if (this.transactions.length === 0) {
            this.transactions = [
                { id: 1, userId: 1, type: 'deposit', amount: 1000, description: 'Welcome Bonus', date: '2024-01-15', time: '10:00' },
                { id: 2, userId: 1, type: 'deposit', amount: 2000, description: 'Pocket Money', date: '2024-02-01', time: '10:30' },
                { id: 3, userId: 1, type: 'deposit', amount: 2000, description: 'Birthday Gift', date: '2024-03-05', time: '14:20' }
            ];
            this.saveData();
        }
        
        if (this.goals.length === 0) {
            this.goals = [
                { id: 1, userId: 1, name: 'New Bicycle', target: 5000, saved: 2000, icon: 'bicycle', createdAt: '2024-02-01' },
                { id: 2, userId: 1, name: 'Video Game Console', target: 15000, saved: 5000, icon: 'game', createdAt: '2024-02-15' }
            ];
            this.saveData();
        }
    },
    
    saveData() {
        localStorage.setItem('cbi_users', JSON.stringify(this.users));
        localStorage.setItem('cbi_transactions', JSON.stringify(this.transactions));
        localStorage.setItem('cbi_goals', JSON.stringify(this.goals));
    },
    
    initEventListeners() {
        // Page navigation
        document.getElementById('get-started-btn').addEventListener('click', () => this.showPage('login'));
        document.getElementById('switch-to-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('register');
        });
        document.getElementById('switch-to-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('login');
        });
        
        // Forms
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        
        // Modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.getAttribute('data-modal');
                this.closeModal(modalId);
            });
        });
        
        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                if (action === 'invest') {
                    this.showSection('investments-section');
                } else {
                    this.openModal(action + '-modal');
                }
            });
        });
        
        // Section navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-section-btn')) {
                const section = e.target.closest('.nav-section-btn').getAttribute('data-section');
                this.showSection(section);
            }
        });
        
        // Transaction confirmations
        document.getElementById('confirm-deposit').addEventListener('click', () => this.handleDeposit());
        document.getElementById('confirm-withdraw').addEventListener('click', () => this.handleWithdraw());
        document.getElementById('confirm-transfer').addEventListener('click', () => this.handleTransfer());
        document.getElementById('confirm-goal').addEventListener('click', () => this.handleAddGoal());
        
        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('show');
            }
        });
    },
    
    showPage(page) {
        document.querySelectorAll('.page-container').forEach(p => p.classList.remove('active'));
        
        if (page === 'home') {
            document.getElementById('homepage').classList.add('active');
            this.updateNavigation(false);
        } else if (page === 'login') {
            document.getElementById('login-container').classList.add('active');
            this.updateNavigation(false);
        } else if (page === 'register') {
            document.getElementById('register-container').classList.add('active');
            this.updateNavigation(false);
        } else if (page === 'dashboard') {
            document.getElementById('dashboard').classList.add('active');
            this.updateNavigation(true);
            this.updateDashboard();
        }
    },
    
    updateNavigation(isLoggedIn) {
        const mainNav = document.getElementById('main-nav');
        mainNav.innerHTML = '';
        
        if (isLoggedIn) {
            const items = [
                { text: 'Dashboard', section: 'transactions-section' },
                { text: 'Investments', section: 'investments-section' },
                { text: 'My Goals', section: 'goals-section' },
                { text: 'Games', section: 'games-section' },
                { text: 'Profile', section: 'profile-section' }
            ];
            
            items.forEach((item, index) => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.textContent = item.text;
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showSection(item.section);
                    document.querySelectorAll('#main-nav a').forEach(link => link.classList.remove('active'));
                    a.classList.add('active');
                });
                if (index === 0) a.classList.add('active');
                li.appendChild(a);
                mainNav.appendChild(li);
            });
        } else {
            const items = [
                { text: 'Home', action: () => this.showPage('home') },
                { text: 'Login', action: () => this.showPage('login') },
                { text: 'Register', action: () => this.showPage('register') }
            ];
            
            items.forEach(item => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.textContent = item.text;
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    item.action();
                });
                li.appendChild(a);
                mainNav.appendChild(li);
            });
        }
    },
    
    showSection(sectionId) {
        document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active-section'));
        document.getElementById(sectionId).classList.add('active-section');
    },
    
    openModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    },
    
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    },
    
    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.currentUser = user;
            this.showPage('dashboard');
            this.showNotification('Login successful! Welcome back, ' + user.name + '!', 'success');
        } else {
            this.showNotification('Invalid login ID or password. Please try again.', 'error');
        }
    },
    
    handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const email = document.getElementById('register-email').value;
        const age = document.getElementById('register-age').value;
        
        if (this.users.some(u => u.username === username)) {
            this.showNotification('This login ID is already taken. Please choose another.', 'error');
            return;
        }
        
        const newUser = {
            id: this.users.length + 1,
            name: name,
            username: username,
            password: password,
            email: email,
            age: parseInt(age),
            accountNumber: 'CB-' + (100000000 + this.users.length + 1),
            cashBalance: 1000,
            totalEarned: 1000,
            joinDate: new Date().toISOString().split('T')[0],
            avatarColor: this.getRandomColor()
        };
        
        this.users.push(newUser);
        
        const welcomeTransaction = {
            id: this.transactions.length + 1,
            userId: newUser.id,
            type: 'deposit',
            amount: 1000,
            description: 'Welcome Bonus!',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        this.transactions.push(welcomeTransaction);
        
        this.saveData();
        this.currentUser = newUser;
        this.showPage('dashboard');
        this.showNotification('Account created successfully! You received 1000 CB Coins welcome bonus!', 'success');
        
        document.getElementById('register-form').reset();
    },
    
    handleLogout() {
        this.currentUser = null;
        this.showPage('home');
        this.showNotification('You have been logged out successfully.', 'info');
    },
    
    handleDeposit() {
        const amount = parseInt(document.getElementById('deposit-amount').value);
        const source = document.getElementById('deposit-source').value;
        
        if (!amount || amount <= 0) {
            this.showNotification('Please enter a valid amount.', 'error');
            return;
        }
        
        this.currentUser.cashBalance += amount;
        this.currentUser.totalEarned += amount;
        
        const newTransaction = {
            id: this.transactions.length + 1,
            userId: this.currentUser.id,
            type: 'deposit',
            amount: amount,
            description: 'Deposit from ' + this.getSourceText(source),
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        this.transactions.push(newTransaction);
        
        this.updateUserData();
        this.updateDashboard();
        this.closeModal('deposit-modal');
        document.getElementById('deposit-amount').value = '';
        
        this.showNotification('Successfully deposited ' + amount + ' CB Coins!', 'success');
    },
    
    handleWithdraw() {
        const amount = parseInt(document.getElementById('withdraw-amount').value);
        const reason = document.getElementById('withdraw-reason').value;
        
        if (!amount || amount <= 0) {
            this.showNotification('Please enter a valid amount.', 'error');
            return;
        }
        
        if (amount > this.currentUser.cashBalance) {
            this.showNotification('Insufficient cash balance for this withdrawal.', 'error');
            return;
        }
        
        this.currentUser.cashBalance -= amount;
        
        const newTransaction = {
            id: this.transactions.length + 1,
            userId: this.currentUser.id,
            type: 'withdraw',
            amount: amount,
            description: 'Withdrawal for ' + this.getReasonText(reason),
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        this.transactions.push(newTransaction);
        
        this.updateUserData();
        this.updateDashboard();
        this.closeModal('withdraw-modal');
        document.getElementById('withdraw-amount').value = '';
        
        this.showNotification('Successfully withdrew ' + amount + ' CB Coins!', 'success');
    },
    
    handleTransfer() {
        const toAccount = document.getElementById('transfer-to').value;
        const amount = parseInt(document.getElementById('transfer-amount').value);
        const note = document.getElementById('transfer-note').value;
        
        if (!toAccount) {
            this.showNotification('Please enter an account ID to transfer to.', 'error');
            return;
        }
        
        if (!amount || amount <= 0) {
            this.showNotification('Please enter a valid amount.', 'error');
            return;
        }
        
        if (amount > this.currentUser.cashBalance) {
            this.showNotification('Insufficient balance for this transfer.', 'error');
            return;
        }
        
        const recipient = this.users.find(u => u.accountNumber === toAccount);
        
        if (!recipient) {
            this.showNotification('Account not found. Please check the account ID.', 'error');
            return;
        }
        
        if (recipient.id === this.currentUser.id) {
            this.showNotification('You cannot transfer to your own account.', 'error');
            return;
        }
        
        this.currentUser.cashBalance -= amount;
        recipient.cashBalance += amount;
        
        const senderTransaction = {
            id: this.transactions.length + 1,
            userId: this.currentUser.id,
            type: 'withdraw',
            amount: amount,
            description: 'Transfer to ' + recipient.name + (note ? ': ' + note : ''),
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        const recipientTransaction = {
            id: this.transactions.length + 2,
            userId: recipient.id,
            type: 'deposit',
            amount: amount,
            description: 'Transfer from ' + this.currentUser.name + (note ? ': ' + note : ''),
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        this.transactions.push(senderTransaction, recipientTransaction);
        
        const recipientIndex = this.users.findIndex(u => u.id === recipient.id);
        this.users[recipientIndex] = recipient;
        
        this.updateUserData();
        this.updateDashboard();
        this.closeModal('transfer-modal');
        document.getElementById('transfer-to').value = '';
        document.getElementById('transfer-amount').value = '';
        document.getElementById('transfer-note').value = '';
        
        this.showNotification('Successfully transferred ' + amount + ' CB Coins to ' + recipient.name + '!', 'success');
    },
    
    handleAddGoal() {
        const name = document.getElementById('goal-name').value;
        const target = parseInt(document.getElementById('goal-target').value);
        const icon = document.getElementById('goal-icon').value;
        
        if (!name) {
            this.showNotification('Please enter a goal name.', 'error');
            return;
        }
        
        if (!target || target <= 0) {
            this.showNotification('Please enter a valid target amount.', 'error');
            return;
        }
        
        const newGoal = {
            id: this.goals.length + 1,
            userId: this.currentUser.id,
            name: name,
            target: target,
            saved: 0,
            icon: icon,
            createdAt: new Date().toISOString().split('T')[0]
        };
        
        this.goals.push(newGoal);
        this.saveData();
        
        this.updateDashboard();
        this.closeModal('add-goal-modal');
        document.getElementById('goal-name').value = '';
        document.getElementById('goal-target').value = '';
        
        this.showNotification('New savings goal created: ' + name + '!', 'success');
    },
    
    updateUserData() {
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        this.users[userIndex] = this.currentUser;
        this.saveData();
    },
    
    updateDashboard() {
        if (!this.currentUser) return;
        
        // Calculate total portfolio value
        const totalInvestments = Investments.getTotalValue(this.currentUser.id);
        const totalPortfolio = this.currentUser.cashBalance + totalInvestments;
        
        // Update user info
        document.getElementById('welcome-name').textContent = this.currentUser.name;
        document.getElementById('account-number').textContent = this.currentUser.accountNumber;
        document.getElementById('current-balance').textContent = totalPortfolio.toLocaleString();
        document.getElementById('cash-balance').textContent = this.currentUser.cashBalance.toLocaleString();
        document.getElementById('investment-value').textContent = totalInvestments.toLocaleString();
        
        // Calculate P&L
        const pnl = Investments.getTotalPnL(this.currentUser.id);
        const pnlElement = document.getElementById('total-pnl');
        pnlElement.textContent = (pnl >= 0 ? '+' : '') + '₹' + Math.abs(pnl).toLocaleString();
        pnlElement.className = 'portfolio-value ' + (pnl >= 0 ? 'profit' : 'loss');
        
        // Update avatars
        const updateAvatar = (id) => {
            const avatar = document.getElementById(id);
            avatar.textContent = this.currentUser.name.charAt(0).toUpperCase();
            avatar.style.backgroundColor = this.currentUser.avatarColor;
        };
        updateAvatar('user-avatar');
        updateAvatar('profile-avatar');
        
        // Update profile
        document.getElementById('profile-name').textContent = this.currentUser.name;
        document.getElementById('profile-account').textContent = this.currentUser.accountNumber;
        document.getElementById('profile-email').value = this.currentUser.email;
        document.getElementById('profile-join-date').value = new Date(this.currentUser.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        document.getElementById('profile-total-earned').value = this.currentUser.totalEarned.toLocaleString();
        
        this.updateTransactions();
        this.updateGoals();
        this.updateGames();
        this.updateAchievements();
        
        // Update investment section
        if (typeof Investments !== 'undefined') {
            Investments.updateDashboard();
        }
    },
    
    updateTransactions() {
        const list = document.getElementById('transaction-list');
        list.innerHTML = '';
        
        const userTransactions = this.transactions
            .filter(t => t.userId === this.currentUser.id)
            .sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time))
            .slice(0, 10);
        
        if (userTransactions.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No transactions yet. Make your first deposit!</p>';
            return;
        }
        
        userTransactions.forEach(t => {
            const div = document.createElement('div');
            div.className = 'transaction';
            div.innerHTML = `
                <div>
                    <div><strong>${t.description}</strong></div>
                    <div style="font-size: 0.9rem; color: #666;">${t.date} at ${t.time}</div>
                </div>
                <div class="${t.type === 'deposit' ? 'transaction-income' : 'transaction-expense'}">
                    ${t.type === 'deposit' ? '+' : '-'}₹${t.amount.toLocaleString()}
                </div>
            `;
            list.appendChild(div);
        });
    },
    
    updateGoals() {
        const list = document.getElementById('goals-list');
        list.innerHTML = '';
        
        const userGoals = this.goals.filter(g => g.userId === this.currentUser.id);
        
        if (userGoals.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No savings goals yet. Create your first goal!</p>';
            return;
        }
        
        userGoals.forEach(goal => {
            const progress = Math.min((goal.saved / goal.target) * 100, 100);
            const icons = { bicycle: '🚲', game: '🎮', book: '📚', toy: '🧸', other: '🎯' };
            const icon = icons[goal.icon] || '🎯';
            
            const div = document.createElement('div');
            div.className = 'goal-item';
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3>${icon} ${goal.name}</h3>
                    <div>₹${goal.saved.toLocaleString()} / ₹${goal.target.toLocaleString()}</div>
                </div>
                <div class="goal-progress">
                    <div class="goal-progress-bar" style="width: ${progress}%"></div>
                </div>
                <div style="font-size: 0.9rem; color: #666;">
                    ${progress.toFixed(1)}% complete
                </div>
            `;
            list.appendChild(div);
        });
    },
    
    updateGames() {
        const games = [
            { id: 1, name: 'Coin Counter', description: 'Learn to count money', icon: 'fas fa-coins', reward: 50 },
            { id: 2, name: 'Savings Race', description: 'Race to save money', icon: 'fas fa-running', reward: 75 },
            { id: 3, name: 'Budget Challenge', description: 'Plan a budget', icon: 'fas fa-chart-pie', reward: 100 },
            { id: 4, name: 'Investment Quiz', description: 'Test your knowledge', icon: 'fas fa-question-circle', reward: 150 }
        ];
        
        const grid = document.getElementById('games-grid');
        grid.innerHTML = '';
        
        games.forEach(game => {
            const div = document.createElement('div');
            div.className = 'game-card';
            div.innerHTML = `
                <i class="${game.icon}"></i>
                <h3>${game.name}</h3>
                <p>${game.description}</p>
                <p><strong>Reward: ${game.reward} CB Coins</strong></p>
            `;
            div.addEventListener('click', () => this.playGame(game));
            grid.appendChild(div);
        });
    },
    
    playGame(game) {
        this.currentUser.cashBalance += game.reward;
        this.currentUser.totalEarned += game.reward;
        
        const newTransaction = {
            id: this.transactions.length + 1,
            userId: this.currentUser.id,
            type: 'deposit',
            amount: game.reward,
            description: 'Reward from ' + game.name,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        this.transactions.push(newTransaction);
        
        this.updateUserData();
        this.updateDashboard();
        
        this.showNotification('🎮 You earned ' + game.reward + ' CB Coins by playing ' + game.name + '!', 'success');
    },
    
    updateAchievements() {
        const achievements = [
            { name: 'First Deposit', description: 'Made your first deposit', icon: 'fas fa-star', achieved: true },
            { name: 'Savings Starter', description: 'Saved ₹1000+', icon: 'fas fa-piggy-bank', achieved: this.currentUser.cashBalance >= 1000 },
            { name: 'Goal Getter', description: 'Set your first goal', icon: 'fas fa-bullseye', achieved: this.goals.filter(g => g.userId === this.currentUser.id).length > 0 },
            { name: 'Investor', description: 'Made your first investment', icon: 'fas fa-chart-line', achieved: false },
            { name: 'Game Master', description: 'Played all games', icon: 'fas fa-gamepad', achieved: false }
        ];
        
        const list = document.getElementById('achievements-list');
        list.innerHTML = '';
        
        achievements.forEach(a => {
            const div = document.createElement('div');
            div.className = 'achievement-item ' + (a.achieved ? 'achieved' : 'locked');
            div.innerHTML = `
                <i class="${a.icon}" style="color: ${a.achieved ? '#4CAF50' : '#999'}; font-size: 1.5rem;"></i>
                <div>
                    <div><strong>${a.name}</strong></div>
                    <div style="font-size: 0.9rem; color: #666;">${a.description}</div>
                </div>
            `;
            list.appendChild(div);
        });
    },
    
    showNotification(message, type) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        
        const colors = {
            success: '#4CAF50',
            error: '#F44336',
            info: '#2196F3'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    },
    
    getSourceText(source) {
        const sources = {
            'pocket-money': 'Pocket Money',
            'gift': 'Gift',
            'chores': 'Chores',
            'other': 'Other Source'
        };
        return sources[source] || source;
    },
    
    getReasonText(reason) {
        const reasons = {
            'shopping': 'Shopping',
            'gift': 'Buying a Gift',
            'saving': 'Moving to Real Savings',
            'other': 'Other Reason'
        };
        return reasons[reason] || reason;
    },
    
    getRandomColor() {
        const colors = ['#FFC107', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#E91E63'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
