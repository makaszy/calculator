import PubSub from '../pub-sub-module/PubSub';

const operationInput = {
  input: document.querySelector('.display__input--operation'),
  setValue(value) {
    this.input.value += value;
  },
  setOperator(value) {
    if (this.input.value.charAt(this.input.value.length - 1) === ' ') {
      this.input.value = this.input.value.substring(0, this.input.value.length - 3);
    }
    this.input.value += value;
  },
  setDecimal(value) {
    if (this.input.value.charAt(this.input.value.length - 1) === ' ') {
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
