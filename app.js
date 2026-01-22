class FinanceTracker {
    constructor() {
        this.data = {
            categories: [],
            expenses: [],
            budget: 0,
            settings: {
                theme: 'auto'
            }
        };

        this.currentPeriod = 'daily';
        this.selectedCategoryColor = '#dc2626';

        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderCategories();
        this.renderExpenses();
        this.updateStats();
        this.applyTheme();
    }

    loadData() {
        const saved = localStorage.getItem('financeData');
        if (saved) {
            this.data = JSON.parse(saved);
        } else {
            this.data.categories = [
                { id: '1', name: 'Продукты', color: '#16a34a' },
                { id: '2', name: 'Транспорт', color: '#2563eb' },
                { id: '3', name: 'Развлечения', color: '#7c3aed' },
                { id: '4', name: 'Косметика', color: '#ea580c' },
                { id: '5', name: 'Другое', color: '#0891b2' }
            ];
        }
    }

    saveData() {
        localStorage.setItem('financeData', JSON.stringify(this.data));
    }

    setupEventListeners() {
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentPeriod = e.target.dataset.period;
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderExpenses();
                this.updatePeriodLabel();
            });
        });

        document.getElementById('themeToggle').addEventListener('click', () => {
            const themes = ['auto', 'light', 'dark'];
            const currentIndex = themes.indexOf(this.data.settings.theme);
            this.data.settings.theme = themes[(currentIndex + 1) % themes.length];
            this.applyTheme();
            this.saveData();
        });

        document.getElementById('addCategory').addEventListener('click', () => {
            this.showCategoryModal();
        });

        document.getElementById('addItem').addEventListener('click', () => {
            this.showExpenseModal();
        });

        document.getElementById('cancelCategory').addEventListener('click', () => {
            this.hideCategoryModal();
        });

        document.getElementById('saveCategory').addEventListener('click', () => {
            this.saveNewCategory();
        });

        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
                e.target.classList.add('active');
                this.selectedCategoryColor = e.target.dataset.color;
            });
        });

        document.getElementById('cancelExpense').addEventListener('click', () => {
            this.hideExpenseModal();
        });

        document.getElementById('saveExpense').addEventListener('click', () => {
            this.saveNewExpense();
        });

        document.getElementById('budgetInput').addEventListener('change', (e) => {
            this.data.budget = parseFloat(e.target.value) || 0;
            this.saveData();
            this.updateStats();
        });

        document.getElementById('budgetInput').value = this.data.budget;
    }

    applyTheme() {
        const themeBtn = document.getElementById('themeToggle');
        let effectiveTheme = this.data.settings.theme;

        if (effectiveTheme === 'auto') {
            effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            themeBtn.textContent = '🌓';
        } else if (effectiveTheme === 'light') {
            themeBtn.textContent = '☀️';
        } else {
            themeBtn.textContent = '🌙';
        }

        document.documentElement.setAttribute('data-theme', effectiveTheme);
    }

    showCategoryModal() {
        document.getElementById('categoryModal').classList.add('active');
        document.getElementById('categoryName').value = '';
        document.querySelector('.color-option[data-color="#dc2626"]').click();
    }

    hideCategoryModal() {
        document.getElementById('categoryModal').classList.remove('active');
    }

    saveNewCategory() {
        const name = document.getElementById('categoryName').value.trim();
        if (!name) {
            alert('Введите название категории');
            return;
        }

        const newCategory = {
            id: Date.now().toString(),
            name: name,
            color: this.selectedCategoryColor
        };

        this.data.categories.push(newCategory);
        this.saveData();
        this.renderCategories();
        this.hideCategoryModal();
    }

    showExpenseModal() {
        const categorySelect = document.getElementById('expenseCategory');
        categorySelect.innerHTML = '<option value="">Выберите категорию</option>';

        this.data.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        document.getElementById('expenseModal').classList.add('active');
        document.getElementById('expenseName').value = '';
        document.getElementById('expenseAmount').value = '';
    }

    hideExpenseModal() {
        document.getElementById('expenseModal').classList.remove('active');
    }

    saveNewExpense() {
        const name = document.getElementById('expenseName').value.trim();
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const categoryId = document.getElementById('expenseCategory').value;
        const period = document.getElementById('expensePeriod').value;

        if (!name || !amount || !categoryId) {
            alert('Заполните все поля');
            return;
        }

        const newExpense = {
            id: Date.now().toString(),
            name: name,
            amount: amount,
            categoryId: categoryId,
            period: period,
            completed: false,
            date: new Date().toISOString()
        };

        this.data.expenses.push(newExpense);
        this.saveData();
        this.renderExpenses();
        this.updateStats();
        this.hideExpenseModal();
    }

    renderCategories() {
        const container = document.getElementById('categoriesList');
        container.innerHTML = '';

        this.data.categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-tag';
            categoryElement.style.backgroundColor = category.color + '20';
            categoryElement.style.color = category.color;
            categoryElement.style.borderColor = category.color;

            categoryElement.innerHTML = `
                <div class="category-color" style="background-color: ${category.color}"></div>
                <span class="category-name">${category.name}</span>
                <div class="category-actions">
                    <button class="category-action-btn" onclick="tracker.deleteCategory('${category.id}')">🗑️</button>
                </div>
            `;

            categoryElement.addEventListener('click', (e) => {
                if (!e.target.closest('.category-action-btn')) {
                    this.filterByCategory(category.id);
                }
            });

            container.appendChild(categoryElement);
        });
    }

    renderExpenses() {
        const container = document.getElementById('expensesList');
        container.innerHTML = '';

        let filteredExpenses = this.data.expenses.filter(expense => {
            if (this.currentPeriod === 'periodic') return true;
            return expense.period === this.currentPeriod;
        });

        filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filteredExpenses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Нет расходов за этот период</p>
                    <button onclick="tracker.showExpenseModal()" class="btn-secondary">Добавить первый расход</button>
                </div>
            `;
            return;
        }

        filteredExpenses.forEach(expense => {
            const category = this.data.categories.find(c => c.id === expense.categoryId);

            const expenseElement = document.createElement('div');
            expenseElement.className = `expense-item ${expense.completed ? 'completed' : ''}`;

            expenseElement.innerHTML = `
                <input type="checkbox" class="expense-checkbox" 
                       ${expense.completed ? 'checked' : ''}
                       onchange="tracker.toggleExpense('${expense.id}')">
                
                <div class="expense-info">
                    <span class="expense-name">${expense.name}</span>
                    <span class="expense-category" style="background-color: ${category?.color}20; color: ${category?.color}">
                        ${category?.name || 'Без категории'}
                    </span>
                    <span class="expense-amount">${expense.amount.toLocaleString()} ₽</span>
                    <span class="expense-period">
                        ${this.getPeriodLabel(expense.period)}
                    </span>
                </div>
                
                <div class="expense-actions">
                    <button class="expense-action-btn" onclick="tracker.editExpense('${expense.id}')">✏️</button>
                    <button class="expense-action-btn" onclick="tracker.deleteExpense('${expense.id}')">🗑️</button>
                </div>
            `;

            container.appendChild(expenseElement);
        });
    }

    toggleExpense(id) {
        const expense = this.data.expenses.find(e => e.id === id);
        if (expense) {
            expense.completed = !expense.completed;
            this.saveData();
            this.renderExpenses();
            this.updateStats();
        }
    }

    editExpense(id) {
        const expense = this.data.expenses.find(e => e.id === id);
        if (expense) {
            this.showExpenseModal();

            setTimeout(() => {
                document.getElementById('expenseName').value = expense.name;
                document.getElementById('expenseAmount').value = expense.amount;
                document.getElementById('expenseCategory').value = expense.categoryId;
                document.getElementById('expensePeriod').value = expense.period;

                const saveBtn = document.getElementById('saveExpense');
                saveBtn.onclick = () => {
                    this.updateExpense(id);
                };
            }, 100);
        }
    }

    updateExpense(id) {
        const expense = this.data.expenses.find(e => e.id === id);
        if (expense) {
            expense.name = document.getElementById('expenseName').value.trim();
            expense.amount = parseFloat(document.getElementById('expenseAmount').value);
            expense.categoryId = document.getElementById('expenseCategory').value;
            expense.period = document.getElementById('expensePeriod').value;

            this.saveData();
            this.renderExpenses();
            this.updateStats();
            this.hideExpenseModal();
        }
    }

    deleteExpense(id) {
        if (confirm('Удалить этот расход?')) {
            this.data.expenses = this.data.expenses.filter(e => e.id !== id);
            this.saveData();
            this.renderExpenses();
            this.updateStats();
        }
    }

    deleteCategory(id) {
        if (confirm('Удалить категорию? Все расходы в ней перейдут в "Другое"')) {
            const otherCategory = this.data.categories.find(c => c.name === 'Другое');
            this.data.expenses.forEach(expense => {
                if (expense.categoryId === id && otherCategory) {
                    expense.categoryId = otherCategory.id;
                }
            });

            this.data.categories = this.data.categories.filter(c => c.id !== id);
            this.saveData();
            this.renderCategories();
            this.renderExpenses();
        }
    }

    updateStats() {
        const total = this.data.expenses
            .filter(expense => !expense.completed && expense.period === this.currentPeriod)
            .reduce((sum, expense) => sum + expense.amount, 0);

        document.getElementById('totalAmount').textContent = total.toLocaleString() + ' ₽';

        const budget = this.data.budget;
        const budgetElement = document.getElementById('budgetInput');
        const progressBar = document.getElementById('progressBar');
        const budgetLeft = document.getElementById('budgetLeft');

        if (budget > 0) {
            const percentage = Math.min((total / budget) * 100, 100);
            progressBar.style.width = `${percentage}%`;

            const remaining = budget - total;
            if (remaining >= 0) {
                budgetLeft.textContent = `Осталось: ${remaining.toLocaleString()} ₽`;
                budgetLeft.style.color = 'var(--success-color)';
            } else {
                budgetLeft.textContent = `Перерасход: ${Math.abs(remaining).toLocaleString()} ₽`;
                budgetLeft.style.color = 'var(--primary-color)';
            }
        } else {
            progressBar.style.width = '0%';
            budgetLeft.textContent = 'Установите бюджет';
        }

        budgetElement.value = budget;
    }

    updatePeriodLabel() {
        const labels = {
            daily: 'Сегодня',
            weekly: 'Эта неделя',
            monthly: 'Этот месяц',
            periodic: 'Все периоды'
        };
        document.getElementById('currentPeriod').textContent = `(${labels[this.currentPeriod]})`;
    }

    getPeriodLabel(period) {
        const labels = {
            daily: '📅 День',
            weekly: '📅 Неделя',
            monthly: '📅 Месяц',
            periodic: '🔄 Период'
        };
        return labels[period] || period;
    }

    filterByCategory(categoryId) {
        console.log('Фильтр по категории:', categoryId);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.tracker = new FinanceTracker();
    console.log("Финансовый трекер загружен!");
});
