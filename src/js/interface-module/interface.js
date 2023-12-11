import PubSub from '../pub-sub-module/PubSub';

const operationInput = {
  input: document.querySelector('.display__input--operation'),
  lastCharIsOperator() {
    return this.input.value.charAt(this.input.value.length - 1) === ' ';
  },
  setValue(value) {
    this.input.value += value;
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
        console.log('only 1 decimal allowed'); //replace with a pop up;
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
