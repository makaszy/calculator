import PubSub from '../pub-sub-module/PubSub';
import solveInfix from '../calculation-module/solveInfix';

const operationInput = {
  input: document.querySelector('.display__input--operation'),
  lastCharIsOperator() {
    if (this.input.value.length < 2) {
      return false;
    }
    return this.input.value.charAt(this.input.value.length - 1) === ' ' && !this.lastCharIsEndParenthesis();
  },
  lastCharIsEndParenthesis() {
    if (this.input.value.length < 2) {
      return false;
    }
    return this.input.value.charAt(this.input.value.length - 1) === ')';
  },
  setValue(value) {
    if (this.lastCharIsEndParenthesis()) {
      console.log('please add an operator'); // replace with a pop up
    } else {
      this.input.value += value;
    }
  },
  setOperator(value) {
    if (this.lastCharIsOperator()) {
      this.input.value = this.input.value.substring(0, this.input.value.length - 3);
    }
    this.input.value += value;
  },
  setDecimal(value) {
    if (this.lastCharIsOperator()) {
      this.input.value += `0${value}`;
    } else {
      const sections = this.input.value.split(' ');
      const lastSection = sections[sections.length - 1];
      if (lastSection.includes('.')) {
        console.log('only 1 decimal allowed'); // replace with a pop up;
      } else {
        this.input.value += value;
      }
    }
  },
  del() {
    if (this.lastCharIsOperator()) {
      this.input.value = this.input.value.substring(0, this.input.value.length - 3);
    } else {
      this.input.value = this.input.value.substring(0, this.input.value.length - 1);
    }
  },
  setParenthesisStart(value) {
    if (this.input.value.length === 0 || this.lastCharIsOperator()) {
      this.input.value += value;
    } else if (!this.lastCharIsOperator()) {
      console.log('parentheses require a preceding operator'); // replace with a pop up
    }
  },
  setParenthesisEnd(value) {
    const sections = this.input.value.split(' ');
    const parenthesisStart = sections.filter((section) => section === '(');
    const parenthesisEnd = sections.filter((section) => section === ')');
    if (parenthesisStart.length > parenthesisEnd.length) {
      this.input.value += value;
    } else {
      console.log('Start parenthesis missing');
    }
  },
  getValue() {
    return this.input.value;
  },
};
// operand keys
const operandPubSub = new PubSub();
operandPubSub.subscribe(operationInput.setValue.bind(operationInput));
const operands = document.querySelectorAll('.calculator__key--operand');
operands.forEach((operand) => {
  operand.addEventListener('click', () => {
    operandPubSub.publish(operand.value);
  });
});
// operator keys
const operatorPubSub = new PubSub();
operatorPubSub.subscribe(operationInput.setOperator.bind(operationInput));
const operators = document.querySelectorAll('.calculator__key--operator');
operators.forEach((operator) => {
  operator.addEventListener('click', () => {
    operatorPubSub.publish(operator.value);
  });
});
// decimal key
const decimalPubSub = new PubSub();
decimalPubSub.subscribe(operationInput.setDecimal.bind(operationInput));
const decimal = document.querySelector('.calculator__key--decimal');
decimal.addEventListener('click', () => {
  decimalPubSub.publish(decimal.value);
});
// delete key
const delPubSub = new PubSub();
const del = document.querySelector('.calculator__key--del');
delPubSub.subscribe(operationInput.del.bind(operationInput));
del.addEventListener('click', () => {
  delPubSub.publish();
});
// clear key
const clear = document.querySelector('.calculator__key--clear');
clear.addEventListener('click', () => {
  window.location.reload();
});
// parenthesis start key
const parenthesisStartPubSub = new PubSub();
parenthesisStartPubSub.subscribe(operationInput.setParenthesisStart.bind(operationInput));
const parenthesisStart = document.querySelector('.calculator__key--parenthesis-start');
parenthesisStart.addEventListener('click', () => {
  parenthesisStartPubSub.publish(parenthesisStart.value);
});
// parenthesis end key
const parenthesisEndPubSub = new PubSub();
parenthesisEndPubSub.subscribe(operationInput.setParenthesisEnd.bind(operationInput));
const parenthesisEnd = document.querySelector('.calculator__key--parenthesis-end');
parenthesisEnd.addEventListener('click', () => {
  parenthesisEndPubSub.publish(parenthesisEnd.value);
});

// solve key
const solvePubSub = new PubSub();

const solve = document.querySelector('.calculator__key--solve');

solve.addEventListener('click', () => {
  solvePubSub.publish(operationInput.getValue());
});
const historyInput = {
  input: document.querySelector('.display__input--history'),
  historyArr: [],
  addOperation(operation) {
    this.historyArr.push(`${operation} = ${solveInfix(operation)}`);
    this.input.value = this.historyArr;
  },
};

solvePubSub.subscribe(historyInput.addOperation.bind(historyInput));
