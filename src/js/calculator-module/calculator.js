import Operation from './operation-class/operation';
import PubSub from '../pub-sub-module/PubSub';
import solveInfix from './solve-infix-function/solveInfix';

const calculator = {
  operations: [],
  keysPubSub: new PubSub(),
  inputsPubSub: new PubSub(),

  getCurrentOperation() {
    return this.operations[this.operations.length - 1];
  },
  getPreviousOperation() {
    return this.operations[this.operations.length - 2];
  },

  getCurrentOperationValues() {
    const valueStrings = this.getCurrentOperation().getValueStrings();
    const { currentValue, preppedValue } = valueStrings;
    return {
      operationValue: currentValue,
      preppedValue,
      resultValue: preppedValue ? solveInfix(preppedValue) : ' ',
    };
  },

  updateInputsValues() {
    let historyValues = [];
    if (this.operations.length > 1) {
      historyValues = this.operations
        .filter((operation) => operation.completeEquation)
        .map((operation) => operation.completeEquation);
    }
    this.inputsPubSub.publish({
      ...this.getCurrentOperationValues(),
      historyValue: historyValues,
    });
  },
  updateKeySubscriptions() {
    // publishes the new operation that keys have to subscribe to
    this.keysPubSub.publish(this.getCurrentOperation());
  },
  subscribeToCurrent() {
    // subscribes to the pubSub property of the current operation
    this.getCurrentOperation().pubSub.subscribe(
      this.updateInputsValues.bind(calculator)
    );
  },

  newOperation() {
    if (this.operations.length === 0) {
      this.operations = [new Operation()];
    }
    const currentOperationValues = this.getCurrentOperationValues();
    if (
      this.operations.length > 0
      && currentOperationValues.resultValue !== ' '
    ) {
      const lastOperationIndex = this.operations.length - 1;
      this.operations[lastOperationIndex] = {
        completeEquation: `${currentOperationValues.preppedValue} = ${currentOperationValues.resultValue}`,
      };
      this.operations = [...this.operations, new Operation()];
    }
    this.updateKeySubscriptions();
    this.subscribeToCurrent();
    this.updateInputsValues();
  },
};

calculator.newOperation();

export default calculator;
