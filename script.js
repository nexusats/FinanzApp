const state = {
  income: 3500000,
  expense: 1650000,
};

const formatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const form = document.querySelector('#movementForm');
const typeInput = document.querySelector('#movementType');
const categoryInput = document.querySelector('#movementCategory');
const amountInput = document.querySelector('#movementAmount');
const balanceValue = document.querySelector('#balanceValue');
const incomeValue = document.querySelector('#incomeValue');
const expenseValue = document.querySelector('#expenseValue');
const movementList = document.querySelector('#movementList');

function renderTotals() {
  const balance = state.income - state.expense;
  balanceValue.textContent = formatter.format(balance);
  incomeValue.textContent = formatter.format(state.income);
  expenseValue.textContent = formatter.format(state.expense);
}

function addMovement(type, category, amount) {
  if (type === 'income') {
    state.income += amount;
  } else {
    state.expense += amount;
  }

  const item = document.createElement('li');
  const label = document.createElement('span');
  const value = document.createElement('strong');

  label.textContent = category;
  value.className = type === 'income' ? 'income' : 'expense';
  value.textContent = `${type === 'income' ? '+' : '-'}${formatter.format(amount)}`;

  item.append(label, value);
  movementList.prepend(item);
  renderTotals();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const type = typeInput.value;
  const category = categoryInput.value;
  const amount = Number(amountInput.value);

  if (!amount || amount < 1000) {
    amountInput.focus();
    return;
  }

  addMovement(type, category, amount);
  form.reset();
  typeInput.value = 'income';
});

renderTotals();
