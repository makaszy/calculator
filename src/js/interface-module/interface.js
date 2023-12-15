import PubSub from '../pub-sub-module/PubSub';
import solveInfix from '../calculation-module/solveInfix';

const operation = {
  valueArr: [],
  pubSub: new PubSub(),

  publishChange() {
    this.pubSub.publish({
      currentValue: this.valueArr.join(' '),
      preppedValue: this.prepIncompleteValueArr().join(' '),
    });
  },
  publishComplete() {
    this.pubSub.publish({
      completeCalculation: this.prepIncompleteValueArr().join(' '),
    });
  },

  lastValueIsType(type, arr = this.valueArr) {
    if (arr.length === 0) {
      return false;
    }
    const lastValue = arr[arr.length - 1];
    switch (type) {
      case 'operand': {
        return !Number.isNaN(Number(lastValue));
      }
      case 'operator': {
        const validOperators = ['+', '-', '*', '/', '^'];
        return validOperators.includes(lastValue);
      }
      case 'start-parenthesis': {
        return lastValue === '(';
      }
      case 'end-parenthesis': {
        return lastValue === ')';
      }
      default:
        return 'invalid type';
    }
  },
  addOperand(operand) {
    if (this.lastValueIsType('end-parenthesis')) {
      console.log('please add an operator');
      return; // replace with a pop up
    }
    if (this.lastValueIsType('operand')) {
      this.valueArr[this.valueArr.length - 1] += operand;
    } else {
      this.valueArr.push(operand);
    }
    this.publishChange();
  },
  addOperator(operator) {
    if (this.lastValueIsType('operator')) {
      this.valueArr.pop();
    }
    this.valueArr.push(operator);
    this.publishChange();
  },
  addDecimal() {
    if (this.lastValueIsType('operator') || this.valueArr.length === 0) {
      this.valueArr.push('0.');
    } else if (this.valueArr[this.valueArr.length - 1].includes('.')) {
      console.log('only 1 decimal allowed');
      return; // replace with a pop up;
    } else if (this.lastValueIsType('end-parenthesis')) {
      console.log('add an operator first');
      return;
    } else {
      this.valueArr[this.valueArr.length - 1] += '.';
    }
    this.publishChange();
  },
  addParenthesisStart() {
    if (this.valueArr[this.valueArr.length - 1] === 0 || this.lastValueIsType('operator') || this.lastValueIsType('start-parenthesis') ) {
      this.valueArr.push('(');
      this.publishChange();
    } else {
      console.log('parenthesis require an operator');
    }
  },
  addParenthesisEnd() {
    const parenthesisStart = this.valueArr.filter((section) => section === '(');
    const parenthesisEnd = this.valueArr.filter((section) => section === ')');
    if (parenthesisStart.length > parenthesisEnd.length) {
      this.valueArr.push(')');
      this.publishChange();
    } else {
      console.log('Start parenthesis missing');
    }
  },
  addMissingParenthesisEnd(arr) {
    const parenthesisStart = arr.filter((section) => section === '(');
    const parenthesisEnd = arr.filter((section) => section === ')');
    if (parenthesisStart.length !== parenthesisEnd.length) {
      while (parenthesisStart.length > parenthesisEnd.length) {
        arr.push(')');
        parenthesisEnd.push(')');
      }
    }
    return arr;
  },
  prepIncompleteValueArr() {
    let arr = this.valueArr.slice();
    while (this.lastValueIsType('operator', arr) || this.lastValueIsType('start-parenthesis', arr)) {
      arr.pop();
    }
    arr = this.addMissingParenthesisEnd(arr);
    console.log(arr);
    return arr;
  },
  dltValue() {
    if (this.valueArr.length === 0) {
      return;
    }
    const lastValue = this.valueArr[this.valueArr.length - 1];
    if (!this.lastValueIsType('operand')) {
      this.valueArr.pop();
    } else {
      const modifiedLastValue = lastValue.slice(0, -1);
      if (modifiedLastValue.length > 0) {
        this.valueArr[this.valueArr.length - 1] = modifiedLastValue;
      } else {
        this.valueArr.pop();
      }
    }
    this.publishChange();
  },
  newOperation() {
    this.publishComplete();
    this.valueArr = [];
  },
};

function showValue(obj) {
  const inputOperation = document.querySelector('.display__input--operation');
  const inputHistory = document.querySelector('.display__input--history');
  const inputResult = document.querySelector('.display__input--result');
  if (obj.completeCalculation) {
    inputHistory.value += `${obj.completeCalculation} = ${solveInfix(obj.completeCalculation)}`;
    inputResult.value = ' ';
    inputOperation.value = ' ';
  } else {
    inputOperation.value = obj.currentValue;
    inputResult.value = solveInfix(obj.preppedValue);
  }
}
operation.pubSub.subscribe(showValue);

// solve key
const solvePubSub = new PubSub();
solvePubSub.subscribe(operation.newOperation.bind(operation));
const solveKey = document.querySelector('.calculator__key--solve');
solveKey.addEventListener('click', () => {
  solvePubSub.publish();
});

// operand keys
const operandPubSub = new PubSub();
operandPubSub.subscribe(operation.addOperand.bind(operation));
const operands = document.querySelectorAll('.calculator__key--operand');
operands.forEach((operand) => {
  operand.addEventListener('click', () => {
    operandPubSub.publish(operand.value);
  });
});
// operator keys
const operatorPubSub = new PubSub();
operatorPubSub.subscribe(operation.addOperator.bind(operation));
const operators = document.querySelectorAll('.calculator__key--operator');
operators.forEach((operator) => {
  operator.addEventListener('click', () => {
    operatorPubSub.publish(operator.value);
  });
});
// decimal key
const decimalPubSub = new PubSub();
decimalPubSub.subscribe(operation.addDecimal.bind(operation));
const decimal = document.querySelector('.calculator__key--decimal');
decimal.addEventListener('click', () => {
  decimalPubSub.publish();
});
// delete key
const delPubSub = new PubSub();
const del = document.querySelector('.calculator__key--del');
delPubSub.subscribe(operation.dltValue.bind(operation));
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
parenthesisStartPubSub.subscribe(operation.addParenthesisStart.bind(operation));
const parenthesisStart = document.querySelector('.calculator__key--parenthesis-start');
parenthesisStart.addEventListener('click', () => {
  parenthesisStartPubSub.publish();
});
// parenthesis end key
const parenthesisEndPubSub = new PubSub();
parenthesisEndPubSub.subscribe(operation.addParenthesisEnd.bind(operation));
const parenthesisEnd = document.querySelector('.calculator__key--parenthesis-end');
parenthesisEnd.addEventListener('click', () => {
  parenthesisEndPubSub.publish();
});
