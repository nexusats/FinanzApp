const DEFAULT_STATE = {
  income: 3500000,
  expense: 1650000,
  movements: [
    { type: 'income', category: 'Salario', amount: 3500000 },
    { type: 'expense', category: 'Alimentación', amount: 850000 },
    { type: 'expense', category: 'Transporte', amount: 300000 },
    { type: 'expense', category: 'Servicios', amount: 500000 },
  ],
};

const STORAGE_KEY = 'finanzapp-demo-state-v2';

const categoryOptions = {
  income: ['Salario', 'Venta', 'Bonificación', 'Ahorro', 'Otro ingreso'],
  expense: ['Alimentación', 'Transporte', 'Servicios', 'Salud', 'Educación', 'Otro gasto'],
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
const resetButton = document.querySelector('#resetDemo');
const feedback = document.querySelector('#movementFeedback');
const balanceValue = document.querySelector('#balanceValue');
const incomeValue = document.querySelector('#incomeValue');
const expenseValue = document.querySelector('#expenseValue');
const budgetText = document.querySelector('#budgetText');
const budgetProgress = document.querySelector('#budgetProgress');
const movementList = document.querySelector('#movementList');

let state = loadState();

function cloneDefaultState() {
  return {
    income: DEFAULT_STATE.income,
    expense: DEFAULT_STATE.expense,
    movements: DEFAULT_STATE.movements.map((movement) => ({ ...movement })),
  };
}

function loadState() {
  try {
    const storedState = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (
      storedState &&
      Number.isFinite(storedState.income) &&
      Number.isFinite(storedState.expense) &&
      Array.isArray(storedState.movements)
    ) {
      return storedState;
    }
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
  }

  return cloneDefaultState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function populateCategories(type) {
  const options = categoryOptions[type] || categoryOptions.income;

  categoryInput.innerHTML = '';

  options.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryInput.appendChild(option);
  });
}

function showFeedback(message, variant = 'success') {
  feedback.textContent = message;
  feedback.className = `form-feedback ${variant}`;
}

function clearFeedback() {
  feedback.textContent = '';
  feedback.className = 'form-feedback';
  amountInput.classList.remove('is-invalid');
}

function validateAmount(amount) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Ingresa un valor válido para registrar el movimiento.';
  }

  if (amount < 1000) {
    return 'El valor mínimo para la demo es de $1.000 COP.';
  }

  return '';
}

function renderTotals() {
  const balance = state.income - state.expense;
  const budgetPercent = state.income > 0
    ? Math.min(Math.round((state.expense / state.income) * 100), 100)
    : 0;

  balanceValue.textContent = formatter.format(balance);
  incomeValue.textContent = formatter.format(state.income);
  expenseValue.textContent = formatter.format(state.expense);
  budgetText.textContent = `${budgetPercent}%`;
  budgetProgress.style.width = `${budgetPercent}%`;
  budgetProgress.parentElement.setAttribute('aria-valuenow', String(budgetPercent));
}

function createMovementItem(movement) {
  const item = document.createElement('li');
  const label = document.createElement('span');
  const value = document.createElement('strong');

  label.textContent = movement.category;
  value.className = movement.type === 'income' ? 'income' : 'expense';
  value.textContent = `${movement.type === 'income' ? '+' : '-'}${formatter.format(movement.amount)}`;

  item.append(label, value);

  return item;
}

function renderMovements() {
  movementList.innerHTML = '';

  state.movements.slice(0, 6).forEach((movement) => {
    movementList.appendChild(createMovementItem(movement));
  });
}

function addMovement(type, category, amount) {
  const movement = { type, category, amount };

  if (type === 'income') {
    state.income += amount;
  } else {
    state.expense += amount;
  }

  state.movements.unshift(movement);
  state.movements = state.movements.slice(0, 10);

  saveState();
  renderTotals();
  renderMovements();

  showFeedback('Movimiento registrado correctamente en la demo.', 'success');
}

function resetDemo() {
  state = cloneDefaultState();
  saveState();
  renderTotals();
  renderMovements();
  populateCategories(typeInput.value);
  form.reset();
  typeInput.value = 'income';
  populateCategories('income');
  showFeedback('La demo volvió a sus valores iniciales.', 'info');
}

typeInput.addEventListener('change', () => {
  populateCategories(typeInput.value);
});

amountInput.addEventListener('input', clearFeedback);

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const type = typeInput.value;
  const category = categoryInput.value;
  const amount = Number(amountInput.value);
  const validationMessage = validateAmount(amount);

  if (validationMessage) {
    amountInput.classList.add('is-invalid');
    amountInput.focus();
    showFeedback(validationMessage, 'error');
    return;
  }

  addMovement(type, category, amount);

  form.reset();
  typeInput.value = 'income';
  populateCategories('income');
});

resetButton.addEventListener('click', resetDemo);

document.querySelectorAll('.navbar .nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    const navMenu = document.querySelector('#mainNav');

    if (navMenu.classList.contains('show')) {
      bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
    }
  });
});

populateCategories(typeInput.value);
renderTotals();
renderMovements();
