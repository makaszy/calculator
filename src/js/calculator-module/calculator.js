import Operation from './operation-class/operation';
import PubSub from '../pub-sub-module/PubSub';
import solveInfix from './solve-infix-function/solveInfix';

const calculator = {
  operations: [],
  keysPubSub: new PubSub(),
  inputsPubSub: new PubSub(),
  
  // gets current operation
  getCurrentOperation() {
    return this.operations[this.operations.length - 1];
  },

  // returns the operation, prepped and result values
  getCurrentOperationValues() {
    const valueStrings = this.getCurrentOperation().getValueStrings();
    const { currentValue, preppedValue } = valueStrings;
    return {
      operationValue: currentValue,
      preppedValue,
      resultValue: preppedValue ? solveInfix(preppedValue) : ' ',
    };
  },

  // updates the values of the operation, result, and history inputs
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

  // publishes the new operation that keys have to subscribe to
  updateKeySubscriptions() {
    this.keysPubSub.publish(this.getCurrentOperation());
  },

  // subscribes to the pubSub property of the current operation
  subscribeToCurrent() {
    this.getCurrentOperation().pubSub.subscribe(
      this.updateInputsValues.bind(calculator)
    );
  },

  // turns previous operation into an object with completeEquation method.
  retireCurrentOperation() {
    const currentOperationValues = this.getCurrentOperationValues();
    if (
      this.operations.length > 0
      && currentOperationValues.resultValue !== ' '
    ) {
      const lastOperationIndex = this.operations.length - 1;
      this.operations[lastOperationIndex] = {
        completeEquation: `${currentOperationValues.preppedValue} = ${currentOperationValues.resultValue}`,
      };
    }
  },

  // creates a new operation
  newOperation() {
    if (this.operations.length === 0) {
      this.operations = [new Operation()];
    }
    this.retireCurrentOperation();
    this.operations = [...this.operations, new Operation()];
    this.updateKeySubscriptions();
    this.subscribeToCurrent();
    this.updateInputsValues();
  },
};

export default calculator;
