import PubSub from '../pub-sub-module/PubSub';
import calculator from '../calculator-module/calculator';

// displays the values of inputs
const inputOperation = document.querySelector('.display__input--operation');
const inputHistory = document.querySelector('.display__input--history');
const inputResult = document.querySelector('.display__input--result');

function displayInputValues(obj) {
  inputOperation.value = obj.operationValue;
  inputHistory.value = obj.historyValue;
  inputResult.value = obj.resultValue;
}

calculator.inputsPubSub.subscribe(displayInputValues);

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

