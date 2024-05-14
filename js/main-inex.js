let dataBaseIncome;
let dataBaseExpenses;

// Selectores
const incomeForm = document.querySelector('#add-income');
const expensesForm = document.querySelector('#add-expenses');
const incomeList = document.querySelector('#income-partial');
const expensesList = document.querySelector('#expenses-partial');

// Selectores inputs income form
const inputIncome = document.querySelector('#income');
const inputIncomeAmount = document.querySelector('#income-amount');
const inputIncomeDate = document.querySelector('#income-date');

// Selectores inputs expenses form
const inputExpenses = document.querySelector('#expenses');
const inputExpensesAmount = document.querySelector('#expenses-amount');
const inputExpensesDate = document.querySelector('#expenses-date');

// Definir lenguaje del navegador para formatear la fecha según ubicación del usuario
const locale = navigator.language;

// Eventos
document.addEventListener('DOMContentLoaded', createDBIncome);
document.addEventListener('DOMContentLoaded', createDBExpenses);
incomeForm.addEventListener('submit', addIncome);
expensesForm.addEventListener('submit', addExpenses);

// Selectores de nodos para totales y restante
const totalNodeIncome = '#income-total';
const totalNodeExpenses = '#expenses-total';
const nodeIncome = '.income-value';
const nodeExpenses = '.expenses-value';

// Tomamos la cantidad de ingresos
let initialValue = 0;

const calculateTotal = (num, node) => {
	const totalValue = (initialValue += num);
	node.innerHTML = totalValue;
	return
};

const getTotalNode = nodeTotal => document.querySelector(nodeTotal);

function getTotal(nodeSelect) {
	let sum = 0;
	const values = Array.from(document.querySelectorAll(nodeSelect));
	const getValues = values.map((node) => Number(node.innerHTML.replace('$ ', '')));
	// Referencia para eliminar puntos y comas
	//.replaceAll('.', '').replace(',', '.') || 0

	getValues.forEach((element) => (sum += element));

	return sum;
};

const renderTotal = (nodeTotal, nodeSelect) => {
	const node = getTotalNode(nodeTotal);
	return (node.innerHTML = getTotal(nodeSelect))
};


function addIncome(e) {

	e.preventDefault();

	// Leer datos del form ingresos
	const income = document.querySelector('#income').value;
	const incomeAmount = Number(document.querySelector('#income-amount').value);

	// const income = calculateIncome(incomeAmount);
	const incomeDate = document.querySelector('#income-date').value;

	// Validamos
	if (income === '' || incomeAmount === '' || incomeDate === '') {
		return printAlert('Todos los campos son obligatorios', 'error', 'income');
	};
	if (incomeAmount <= 0 || isNaN(incomeAmount)) {
		return printAlert('Cantidad no válida', 'error', 'income');
	};

	// Insertar en IndexedDB
	const transaction = dataBaseIncome.transaction(['income'], 'readwrite');

	// Habilitar el objectStore
	const objectStore = transaction.objectStore('income');

	// Crear objeto para insertar en la DB
	const incomeAdd = {
		income,
		incomeAmount,
		incomeDate
	};

	// Insertar en la DB
	objectStore.add(incomeAdd);

	transaction.oncomplete = () => {
		readDB(dataBaseIncome, 'income');
		clearHTML(incomeList);
		printAlert('Se agregó correctamente', 'success', 'income');
	};

	// Reiniciar el form
	incomeForm.reset();
};

function addExpenses(e) {

	e.preventDefault();

	// Leer datos del form egresos
	const expenses = document.querySelector('#expenses').value;
	const expensesAmount = Number(document.querySelector('#expenses-amount').value);

	const expensesDate = document.querySelector('#expenses-date').value;

	// Validamos
	if (expenses === '' || expensesAmount === '' || expensesDate === '') {
		return printAlert('Todos los campos son obligatorios', 'error', 'expenses');
	};
	if (expensesAmount <= 0 || isNaN(expensesAmount)) {
		return printAlert('Cantidad no válida', 'error', 'expenses');
	};

	// Insertar en IndexedDB
	const transaction = dataBaseExpenses.transaction(['expenses'], 'readwrite');

	// Habilitar el objectStore
	const objectStore = transaction.objectStore('expenses');

	// Crear objeto para insertar en la DB
	const expensesAdd = {
		expenses,
		expensesAmount,
		expensesDate
	};

	// Insertar en la DB
	objectStore.add(expensesAdd);

	transaction.oncomplete = () => {
		readDB(dataBaseExpenses, 'expenses');
		clearHTML(expensesList);
		printAlert('Se agregó correctamente', 'success', 'expenses');
	};

	// Reiniciar el form
	expensesForm.reset();
};

function getRemaining() {

	const remaining = document.querySelector('#remaining');
	const getRemaining = (renderTotal(totalNodeIncome, nodeIncome) - renderTotal(totalNodeExpenses, nodeExpenses));

	// Chequear Restante disponible y modificar color de fondo
	const remainingDiv = document.querySelector('.remaining');

	if (getRemaining < renderTotal(totalNodeIncome, nodeIncome) * .25) {
		remainingDiv.classList.remove('alert-success', 'alert-warning');
		remainingDiv.classList.add('alert-danger');
	} else if (getRemaining < renderTotal(totalNodeIncome, nodeIncome) * .5) {
		remainingDiv.classList.remove('alert-success', 'alert-danger');
		remainingDiv.classList.add('alert-warning');
	} else {
		remainingDiv.classList.remove('alert-danger', 'alert-warning');
		remainingDiv.classList.add('alert-success');
	};

	remaining.innerHTML = getRemaining;
	return
};

function createDBIncome() {
	// Crear la base de datos indexedDB versión 1.0
	const createDBIncome = window.indexedDB.open('income', 1);

	// Si hay un error
	createDBIncome.onerror = () => {
		console.log('Hubo un error al crear la DB')
	};

	// Si se crea corectamente
	createDBIncome.onsuccess = () => {
		console.log('La DB se creó correctamente')
		dataBaseIncome = createDBIncome.result;
		// Leer el contenido de la DB
		readDB(dataBaseIncome, 'income')
	};

	// Definir el schema
	createDBIncome.onupgradeneeded = function (e) {
		const db = e.target.result;

		const objectStore = db.createObjectStore('income', {
			keyPath: 'id',
			autoIncrement: true
		});

		// Definir columnas
		objectStore.createIndex('income', 'income', { unique: false });
		objectStore.createIndex('amount', 'amount', { unique: false });
		objectStore.createIndex('date', 'date', { unique: false });
		objectStore.createIndex('id', 'id', { unique: true });

		console.log('DB creada y lista');
	};
};

function createDBExpenses() {
	// Crear la base de datos indexedDB versión 1.0
	const createDBExpenses = window.indexedDB.open('expenses', 1);

	// Si hay un error
	createDBExpenses.onerror = () => {
		console.log('Hubo un error al crear la DB')
	};

	// Si se crea corectamente
	createDBExpenses.onsuccess = () => {
		console.log('La DB se creó correctamente')
		dataBaseExpenses = createDBExpenses.result;
		// Leer el contenido de la DB
		readDB(dataBaseExpenses, 'expenses')
	};

	// Definir el schema
	createDBExpenses.onupgradeneeded = function (e) {
		const db = e.target.result;

		const objectStore = db.createObjectStore('expenses', {
			keyPath: 'id',
			autoIncrement: true
		});

		// Definir columnas
		objectStore.createIndex('expenses', 'expenses', { unique: false });
		objectStore.createIndex('amount', 'amount', { unique: false });
		objectStore.createIndex('date', 'date', { unique: false });
		objectStore.createIndex('id', 'id', { unique: true });

		console.log('DB creada y lista');
	};
};

function readDB(DB, nameDB) {
	// Leer el contenido de la DB
	const objectStore = DB.transaction(nameDB).objectStore(nameDB);
	if (nameDB === 'income') {
		objectStore.openCursor().onsuccess = (e) => {
			const data = e.target.result;
			// Imprimir el contenido de la DB
			printDBIncome(data);
		};
	} else {
		objectStore.openCursor().onsuccess = (e) => {
			const data = e.target.result;
			// Imprimir el contenido de la DB
			printDBExpenses(data);
		};
	};
};

function printDBIncome(data) {

	if (data) {
		const { income, incomeAmount, incomeDate, id } = data.value;

		const newIncome = document.createElement('li');
		newIncome.className = 'list-group-item d-flex justify-content-between align-items-center';

		// Formatear fecha
		const incomeDay = new Date(incomeDate);
		const incomeDayFormat = incomeDay.toLocaleDateString(locale, {
			timeZone: 'UTC'
		});

		// Generar el HTML del egreso
		// Duplicamos el span y lo ocultamos para poder tomar el monto sin formatear y poder realizar la suma total
		newIncome.innerHTML = `
        <div class="col-lg-3">${incomeDayFormat}</div>
        <div class="col-lg-3">${income}</div>
        <div class="col-lg-3"><span class="income-value">$ ${incomeAmount}</span></div>        
        `;

		// Botón para eliminar un ingreso
		const btnDeleteInc = document.createElement('button');
		btnDeleteInc.classList.add('btn', 'btn-danger', 'mr-2');
		btnDeleteInc.innerHTML = '<div><i class="fa fa-trash"></i></div>';
		btnDeleteInc.onclick = () => deleteRecord(dataBaseIncome, 'income', id, incomeList);

		// Agregar al HTML
		newIncome.appendChild(btnDeleteInc);
		incomeList.appendChild(newIncome);
		// Ir al siguiente ingreso
		data.continue()
	};

	// Imprimimos el total de ingresos
	renderTotal(totalNodeIncome, nodeIncome);

	// Calculamos el restante
	getRemaining();
};

function printDBExpenses(data) {

	if (data) {
		const { expenses, expensesAmount, expensesDate, id } = data.value;

		const newExpenses = document.createElement('li');
		newExpenses.className = 'list-group-item d-flex justify-content-between align-items-center';

		// Formatear fecha
		const expensesDay = new Date(expensesDate);
		const expensesDayFormat = expensesDay.toLocaleDateString(locale, {
			timeZone: 'UTC'
		});

		// Generar el HTML del egreso
		// Duplicamos el span y lo ocultamos para poder tomar el monto sin formatear y poder realizar la suma total
		newExpenses.innerHTML = `
        <div class="col-lg-3">${expensesDayFormat}</div>
        <div class="col-lg-3">${expenses}</div>
        <div class="col-lg-3"><span class="expenses-value">$ ${expensesAmount}</span></div>        
        `;

		// Botón para eliminar un ingreso
		const btnDeleteExp = document.createElement('button');
		btnDeleteExp.classList.add('btn', 'btn-danger', 'mr-2');
		btnDeleteExp.innerHTML = '<div><i class="fa fa-trash"></i></div>';
		btnDeleteExp.onclick = () => deleteRecord(dataBaseExpenses, 'expenses', id, expensesList);

		// Agregar al HTML
		newExpenses.appendChild(btnDeleteExp);
		expensesList.appendChild(newExpenses);
		// Ir al siguiente ingreso
		data.continue()
	};

	// Imprimimos el total de ingresos
	renderTotal(totalNodeExpenses, nodeExpenses);

	// Calculamos el restante
	getRemaining();
};

function deleteRecord(database, nameDB, id, list) {

	if (window.confirm("Seguro quiere eliminar el registro?")) {

		// Eliminar el ingreso
		const transaction = database.transaction([nameDB], 'readwrite');
		const objectStore = transaction.objectStore(nameDB);

		objectStore.delete(id);

		transaction.oncomplete = () => {
			// Mostrar mensaje
			printAlert('Se eliminó correctamente', 'success', nameDB);

			// Refrescar ingresos
			nameDB === 'income' ? readDB(dataBaseIncome, nameDB) : readDB(dataBaseExpenses, 'expenses');

			// Limpiar items repetidos
			clearHTML(list);
		};
	};
};

function printAlert(message, type, block) {
	// Crear el div
	const divMessage = document.createElement('div');
	divMessage.classList.add('text-center', 'alert');

	type === 'error' ? divMessage.classList.add('alert-danger') : divMessage.classList.add('alert-success')

	// Mensaje de error
	divMessage.textContent = message;

	block === 'income' ? document.querySelector('.printAlertIncome').insertBefore(divMessage, incomeForm) : document.querySelector('.printAlertExpenses').insertBefore(divMessage, expensesForm);

	// Quitar mensaje
	setTimeout(() => {
		divMessage.remove();
	}, 3000);
};

// Limpiar ingresos
const clearHTML = list => {
	while (list.firstChild) {
		list.removeChild(list.firstChild)
	}
};