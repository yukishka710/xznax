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
        
    }

    init() {
        console.log("Инициализация приложения...");
        this.loadData();
        this.setupEventListeners();
        this.renderCategories();
        this.renderExpenses();
        this.updateStats();
        this.applyTheme();
        console.log("Приложение инициализировано!");
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
        console.log("Данные загружены:", this.data);
    }

    saveData() {
        localStorage.setItem('financeData', JSON.stringify(this.data));
        console.log("Данные сохранены");
    }

    setupEventListeners() {
        console.log("Настройка обработчиков событий...");
        
        const periodButtons = document.querySelectorAll('.period-btn');
        if (periodButtons.length > 0) {
            periodButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.currentPeriod = e.target.dataset.period;
                    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.renderExpenses();
                    this.updatePeriodLabel();
                });
            });
        }

        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const themes = ['auto', 'light', 'dark'];
                const currentIndex = themes.indexOf(this.data.settings.theme);
                this.data.settings.theme = themes[(currentIndex + 1) % themes.length];
                this.applyTheme();
                this.saveData();
            });
        }

        const addCategoryBtn = document.getElementById('addCategory');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => {
                this.showCategoryModal();
            });
        }

        const addItemBtn = document.getElementById('addItem');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                this.showExpenseModal();
            });
        }

        const cancelCategoryBtn = document.getElementById('cancelCategory');
        if (cancelCategoryBtn) {
            cancelCategoryBtn.addEventListener('click', () => {
                this.hideCategoryModal();
            });
        }

        const saveCategoryBtn = document.getElementById('saveCategory');
        if (saveCategoryBtn) {
            saveCategoryBtn.addEventListener('click', () => {
                this.saveNewCategory();
            });
        }

        const colorOptions = document.querySelectorAll('.color-option');
        if (colorOptions.length > 0) {
            colorOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
                    e.target.classList.add('active');
                    this.selectedCategoryColor = e.target.dataset.color;
                });
            });
        }

        const cancelExpenseBtn = document.getElementById('cancelExpense');
        if (cancelExpenseBtn) {
            cancelExpenseBtn.addEventListener('click', () => {
                this.hideExpenseModal();
            });
        }

        const saveExpenseBtn = document.getElementById('saveExpense');
        if (saveExpenseBtn) {
            saveExpenseBtn.addEventListener('click', () => {
                this.saveNewExpense();
            });
        }

        const budgetInput = document.getElementById('budgetInput');
        if (budgetInput) {
            budgetInput.value = this.data.budget;
            budgetInput.addEventListener('change', (e) => {
                this.data.budget = parseFloat(e.target.value) || 0;
                this.saveData();
                this.updateStats();
            });
        }

        console.log("Обработчики событий настроены");
    }

    applyTheme() {
        const themeBtn = document.getElementById('themeToggle');
        if (!themeBtn) return;

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
        console.log("Тема применена:", effectiveTheme);
    }

    showCategoryModal() {
        const modal = document.getElementById('categoryModal');
        const categoryNameInput = document.getElementById('categoryName');
        const colorOption = document.querySelector('.color-option[data-color="#dc2626"]');
        
        if (modal && categoryNameInput) {
            modal.classList.add('active');
            categoryNameInput.value = '';
            if (colorOption) colorOption.click();
        }
    }

    hideCategoryModal() {
        const modal = document.getElementById('categoryModal');
        if (modal) modal.classList.remove('active');
    }

    saveNewCategory() {
        const nameInput = document.getElementById('categoryName');
        if (!nameInput) return;

        const name = nameInput.value.trim();
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
        const modal = document.getElementById('expenseModal');
        
        if (!categorySelect || !modal) return;

        categorySelect.innerHTML = '<option value="">Выберите категорию</option>';

        this.data.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        modal.classList.add('active');
        
        const expenseNameInput = document.getElementById('expenseName');
        const expenseAmountInput = document.getElementById('expenseAmount');
        
        if (expenseNameInput) expenseNameInput.value = '';
        if (expenseAmountInput) expenseAmountInput.value = '';
    }

    hideExpenseModal() {
        const modal = document.getElementById('expenseModal');
        if (modal) modal.classList.remove('active');
    }

    saveNewExpense() {
        const nameInput = document.getElementById('expenseName');
        const amountInput = document.getElementById('expenseAmount');
        const categorySelect = document.getElementById('expenseCategory');
        
        if (!nameInput || !amountInput || !categorySelect) return;

        const name = nameInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const categoryId = categorySelect.value;

        if (!name || !amount || !categoryId) {
            alert('Заполните все поля');
            return;
        }

        const periodSelect = document.getElementById('expensePeriod');
        const period = periodSelect ? periodSelect.value : 'daily';

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
        if (!container) {
            console.error('Контейнер categoriesList не найден');
            return;
        }

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
                    <button class="category-action-btn" onclick="window.tracker.deleteCategory('${category.id}')">🗑️</button>
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
        if (!container) {
            console.error('Контейнер expensesList не найден');
            return;
        }

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
                    <button onclick="window.tracker.showExpenseModal()" class="btn-secondary">Добавить первый расход</button>
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
                       onchange="window.tracker.toggleExpense('${expense.id}')">
                
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
                    <button class="expense-action-btn" onclick="window.tracker.editExpense('${expense.id}')">✏️</button>
                    <button class="expense-action-btn" onclick="window.tracker.deleteExpense('${expense.id}')">🗑️</button>
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
                const nameInput = document.getElementById('expenseName');
                const amountInput = document.getElementById('expenseAmount');
                const categorySelect = document.getElementById('expenseCategory');
                const periodSelect = document.getElementById('expensePeriod');
                const saveBtn = document.getElementById('saveExpense');

                if (nameInput) nameInput.value = expense.name;
                if (amountInput) amountInput.value = expense.amount;
                if (categorySelect) categorySelect.value = expense.categoryId;
                if (periodSelect) periodSelect.value = expense.period;

                if (saveBtn) {
                    saveBtn.onclick = () => {
                        this.updateExpense(id);
                    };
                }
            }, 100);
        }
    }

    updateExpense(id) {
        const expense = this.data.expenses.find(e => e.id === id);
        if (expense) {
            const nameInput = document.getElementById('expenseName');
            const amountInput = document.getElementById('expenseAmount');
            const categorySelect = document.getElementById('expenseCategory');
            const periodSelect = document.getElementById('expensePeriod');

            if (nameInput) expense.name = nameInput.value.trim();
            if (amountInput) expense.amount = parseFloat(amountInput.value);
            if (categorySelect) expense.categoryId = categorySelect.value;
            if (periodSelect) expense.period = periodSelect.value;

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
        const totalElement = document.getElementById('totalAmount');
        const budgetInput = document.getElementById('budgetInput');
        const progressBar = document.getElementById('progressBar');
        const budgetLeft = document.getElementById('budgetLeft');

        if (!totalElement) return;

        const total = this.data.expenses
            .filter(expense => !expense.completed && expense.period === this.currentPeriod)
            .reduce((sum, expense) => sum + expense.amount, 0);

        totalElement.textContent = total.toLocaleString() + ' ₽';

        const budget = this.data.budget;

        if (budgetInput) budgetInput.value = budget;

        if (budget > 0 && progressBar && budgetLeft) {
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
        } else if (progressBar && budgetLeft) {
            progressBar.style.width = '0%';
            budgetLeft.textContent = 'Установите бюджет';
        }
    }

    updatePeriodLabel() {
        const element = document.getElementById('currentPeriod');
        if (!element) return;

        const labels = {
            daily: 'Сегодня',
            weekly: 'Эта неделя',
            monthly: 'Этот месяц',
            periodic: 'Все периоды'
        };
        element.textContent = `(${labels[this.currentPeriod]})`;
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
    console.log("DOM загружен, инициализируем приложение...");
    window.tracker = new FinanceTracker();
    window.tracker.init();
});
