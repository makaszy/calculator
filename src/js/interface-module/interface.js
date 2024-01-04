import PubSub from '../pub-sub-module/PubSub';
import calculator from '../calculator-module/calculator';

// displays the values of inputs
const inputOperation = document.querySelector('.display__input--operation');
const inputHistory = document.querySelector('.display__input--history');
const inputResult = document.querySelector('.display__input--result');

function displayInputValues(obj) {
  inputOperation.textContent = obj.operationValue;
  inputHistory.textContent = obj.historyValue;
  inputResult.textContent = obj.resultValue;
}

function resizeInput(input) {
  input.style.height = 'auto';
  const newHeight = input.scrollHeight;
  input.style.height = newHeight + 'px';
}

function getMaxHeight(input) {
  let computedMaxHeight = window.getComputedStyle(input).maxHeight;
  let currentMaxHeight = parseInt(computedMaxHeight) || 0;
  return currentMaxHeight;
}

function resizeFont(input, fontSize) {
  let currentInputHeight = parseInt(input.style.height);
    let currentMaxHeight = getMaxHeight(input);
    if ( (currentInputHeight > currentMaxHeight) && (input.style.fontSize !== fontSize)) { 
      input.style.fontSize = fontSize;
    }
}

function adjustContent() {
  const inputs = [inputOperation, inputHistory, inputResult];
  inputs.forEach((input) => {
    resizeInput(input);
    resizeFont(input, '75%');
    resizeInput(input);
  })
}

calculator.inputsPubSub.subscribe(displayInputValues);
calculator.inputsPubSub.subscribe(adjustContent);


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
const modalText = document.querySelector(".modal-content__text");

function showModal() {
  modal.style.display = 'block';
}
function hideModal() {
  modal.style.display = 'none';
}

// for pc
modalIcon.addEventListener('mouseover', showModal);
modalIcon.addEventListener('mouseout', hideModal);

// for touchscreens
modalIcon.addEventListener('click', showModal);
modalIcon.addEventListener('touchend', hideModal);

function updateModal(text) {
  modalIcon.setAttribute('style', 'display: block');
  modalText.textContent = text;
}

function hideModalIcon() {
  modalIcon.setAttribute('style', 'display: none');
  hideModal();
}

calculator.alertModalPubSub.subscribe(updateModal);
calculator.inputsPubSub.subscribe(hideModalIcon);
