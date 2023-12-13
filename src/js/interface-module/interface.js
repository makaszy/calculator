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

  lastValueIsType(type) {
    if (this.valueArr.length === 0) {
      return false;
    }
    const lastValue = this.valueArr[this.valueArr.length - 1];
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
    if (this.lastValueIsType('end-parenthesis')) {
      console.log('please add an operand first'); // replace with a pop up
      return;
    }
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
    if (this.valueArr[this.valueArr.length - 1] === 0 || this.lastValueIsType('operator') || this.lastValueIsType('parenthesis-start')) {
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
    } else {
      console.log('Start parenthesis missing');
    }
  },
  addMissingParenthesisEnd(arr) {
    const parenthesisStart = this.valueArr.filter((section) => section === '(');
    const parenthesisEnd = this.valueArr.filter((section) => section === ')');
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
    if (this.lastValueIsType('operator')) {
      arr.pop();
    }
    arr = this.addMissingParenthesisEnd(arr);
    return arr;
  },
  dltValue() {
    if (this.valueArr.length !== 0) {
      if (!this.lastValueIsType('operand')) {
        this.valueArr.pop();
      } else {
        let lastElement = this.valueArr[this.valueArr.length - 1];
        lastElement = lastElement.substring(0, this.valueArr.length - 1);
        if (this.valueArr[this.valueArr.length - 1].length === 0) {
          this.valueArr.pop();
        }
      }
      this.publishChange();
    }
  },
};

/* const operationInput = {
  input: document.querySelector('.display__input--operation'),
 */
  /* getLastCharsSubstr(num) {
    const value = this.getValue();
    return value.substring(value.length - num)
  }

  isType(type) {
    if (this.input.value.length < 2) {
      return false;
    }
    switch (type) {
      case 'operator': {
        const validOperators = ['+', '-', '*', '/', '^'];
        const lastCharsTrimmed = this.getLastCharsSubstr(3).trim();
        //const lastThreeCharTrimmed = value.substring(value.length - 3).trim();
        return validOperators.includes(lastCharsTrimmed);
      }
      case 'start-parenthesis':
        const lastTwoCharTrimmed = value.substring(value-length - 2).trim();

        return value.charAt(va);
      default:
        return 'unknown parameter';
    }
  }, */

/*   lastCharIsOperator() {
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
  lastCharIsStartParenthesis() {
    if (this.input.value.length < 2) {
      return false;
    }

  }, */
/*   setValue(value) {
    if (this.lastCharIsEndParenthesis()) {
      console.log('please add an operator'); // replace with a pop up
    } else {
      this.input.value += value;
    }
  }, */
/*   setOperator(value) {
    if (this.lastCharIsOperator() && !this.lastCharIsEndParenthesis()) {
      this.input.value = this.input.value.substring(0, this.input.value.length - 3);
      this.input.value += value;
    } else if (this.lastCharIsEndParenthesis()) {
      console.log('please set an operand');
    } else {
      this.input.value += value;
    }
    
  }, */
/*   setDecimal(value) {
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
  }, */
/*   del() {
    if (this.lastCharIsOperator()) {
      this.input.value = this.input.value.substring(0, this.input.value.length - 3);
    } else if(this.lastCharIsEndParenthesis()) {
      this.input.value = this.input.value.substring(0, this.input.value.length - 2);
    } else {
      this.input.value = this.input.value.substring(0, this.input.value.length - 1);
    }
  }, */
/*   setParenthesisStart(value) {
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
  }, */
 /*  solveValue() {
    if (this.lastCharIsOperator()) {
      this.input.value = this.input.value.substring(0, this.input.value.length - 3);
    }
    const sections = this.input.value.split(' ');
    const parenthesisStart = sections.filter((section) => section === '(');
    let parenthesisEnd = sections.filter((section) => section === ')');
    if (parenthesisStart.length !== parenthesisEnd.length) {
      while (parenthesisStart.length > parenthesisEnd.length) {
        this.input.value += ' )';
        parenthesisEnd += ' )';
      }
      return this.input.value;
    }
    return this.input.value;
  }, */

/*   getValue() {
    return this.input.value;
  },
}; */
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

solve.addEventListener('click', async () => {
  const result = await operationInput.solveValue();
  solvePubSub.publish(result);
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
