import PubSub from '../pub-sub-module/PubSub';
import calculator from '../calculator-module/calculator';

// displays the values of inputs
const inputOperation = document.querySelector('.display__input--operation');
const inputHistory = document.querySelector('.display__input--history');
const inputResult = document.querySelector('.display__input--result');

function scrollToNewest() {
  [inputOperation, inputHistory, inputResult].forEach((input) => {
    input.scrollTop = input.scrollHeight;
  })
}

function displayInputValues(obj) {
  inputOperation.textContent = obj.operationValue;
  inputHistory.textContent = obj.historyValue;
  inputResult.textContent = obj.resultValue;
}

calculator.inputsPubSub.subscribe(displayInputValues);

calculator.inputsPubSub.subscribe(scrollToNewest);

// group subscribe function
const operandPubSub = new PubSub();
const operatorPubSub = new PubSub();
const decimalPubSub = new PubSub();
const dltPubSub = new PubSub();
const parenthesisStartPubSub = new PubSub();
const parenthesisEndPubSub = new PubSub();

function subscribeNewOperation(newOperation) {
  operandPubSub.subscribe(newOperation.addOperand.bind(newOperation));
  operatorPubSub.subscribe(newOperation.addOperator.bind(newOperation));
  decimalPubSub.subscribe(newOperation.addDecimal.bind(newOperation));
  dltPubSub.subscribe(newOperation.dltValue.bind(newOperation));
  parenthesisStartPubSub.subscribe(
    newOperation.addParenthesisStart.bind(newOperation),
  );
  parenthesisEndPubSub.subscribe(
    newOperation.addParenthesisEnd.bind(newOperation),
  );
}

calculator.keysPubSub.subscribe(subscribeNewOperation);

// solve key
const solvePubSub = new PubSub();
solvePubSub.subscribe(calculator.newOperation.bind(calculator));
const solveKey = document.querySelector('.calculator__key--solve');
solveKey.addEventListener('click', () => {
  solvePubSub.publish();
});
// operand keys
const operands = document.querySelectorAll('.calculator__key--operand');
operands.forEach((operand) => {
  operand.addEventListener('click', () => {
    operandPubSub.publish(operand.value);
  });
});
// operator keys
const operators = document.querySelectorAll('.calculator__key--operator');
operators.forEach((operator) => {
  operator.addEventListener('click', () => {
    operatorPubSub.publish(operator.value);
  });
});
// decimal key
const decimal = document.querySelector('.calculator__key--decimal');
decimal.addEventListener('click', () => {
  decimalPubSub.publish();
});
// delete key
const dlt = document.querySelector('.calculator__key--del');
dlt.addEventListener('click', () => {
  dltPubSub.publish();
});
// clear key
const clear = document.querySelector('.calculator__key--clear');
clear.addEventListener('click', () => {
  window.location.reload();
});
// parenthesis start key
const parenthesisStart = document.querySelector(
  '.calculator__key--parenthesis-start',
);
parenthesisStart.addEventListener('click', () => {
  parenthesisStartPubSub.publish();
});
// parenthesis end key
const parenthesisEnd = document.querySelector(
  '.calculator__key--parenthesis-end',
);
parenthesisEnd.addEventListener('click', () => {
  parenthesisEndPubSub.publish();
});

// alert modal
const modalIcon = document.querySelector('.display__alert-icon');
const modal = document.querySelector('.display__modal');
const modalContent = document.querySelector('.modal-content')
const modalText = document.querySelector(".modal-content__text");


function delay(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

async function showTransitionModal() {
  modal.style.display = 'block';
  await delay(0);
  modalContent.classList.add('transition-in--modal');
  await delay(300);
}

async function showModal() {
   await showTransitionModal()
   modalText.style.display = 'block'
}

async function showTransitionIcon() {
  modalIcon.style.display = 'block';
  await delay(0);
  modalIcon.classList.add('transition-in--alert-icon');
  await delay(500);
}

function hideModal() {
  modal.style.display = 'none';
  modalContent.classList.remove('transition-in--modal');
  modalText.style.display = "none";
} 

// for pc
modalIcon.addEventListener('mouseover', showModal);
modalIcon.addEventListener('mouseout', hideModal);

// for touchscreens
modalIcon.addEventListener('click', showModal);
modalIcon.addEventListener('touchend', hideModal);

async function updateModal(text) {
  await showTransitionIcon();
  modalText.textContent = text;
}

function hideModalIcon() {
  modalIcon.classList.remove('transition-in--alert-icon');
  modalIcon.setAttribute('style', 'display: none');
  hideModal();
}

calculator.alertModalPubSub.subscribe(updateModal);
calculator.inputsPubSub.subscribe(hideModalIcon);
