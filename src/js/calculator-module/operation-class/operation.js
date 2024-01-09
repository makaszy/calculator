import PubSub from '../../pub-sub-module/PubSub';

// contains the mathematical operation, previous operations, methods, and pubSubs

class Operation {
  constructor() {
    this.valueArr = [];
    this.pubSub = new PubSub();
    this.alertPubSub = new PubSub();
  }

  static lastValueIsType(type, arr) {
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
  }

  static addMissingParenthesisEnd(arr) {
    const parenthesisStart = arr.filter((section) => section === '(');
    const parenthesisEnd = arr.filter((section) => section === ')');
    if (parenthesisStart.length !== parenthesisEnd.length) {
      while (parenthesisStart.length > parenthesisEnd.length) {
        arr.push(')');
        parenthesisEnd.push(')');
      }
    }
    return arr;
  }

  static prepIncompleteValueArr(arr) {
    while (Operation.lastValueIsType('operator', arr) || Operation.lastValueIsType('start-parenthesis', arr)) {
      arr.pop();
    }
    return Operation.addMissingParenthesisEnd(arr);
  }

  publishChange() {
    this.pubSub.publish();
  }

  publishAlert(alertTxt) {
    this.alertPubSub.publish(alertTxt);
  }

  getValueStrings() {
    return {
      currentValue: this.valueArr.join(' '),
      preppedValue: Operation.prepIncompleteValueArr(this.valueArr.slice()).join(' '),
    };
  }

  addOperand(operand) {
    if (Operation.lastValueIsType('end-parenthesis', this.valueArr)) {
      this.publishAlert('Please add an operator!');
      return;
    }
    if (Operation.lastValueIsType('operand', this.valueArr)) {
      this.valueArr[this.valueArr.length - 1] += operand;
    } else {
      this.valueArr.push(operand);
    }
    this.publishChange();
  }

  addOperator(operator) {
    if (Operation.lastValueIsType('operator', this.valueArr)) {
      this.valueArr.pop();
    } else if (Operation.lastValueIsType('start-parenthesis', this.valueArr) || this.valueArr.length === 0) {
      this.publishAlert('Please add an operand first!');
    } else {
      this.valueArr.push(operator);
      this.publishChange();
    }
  }

  addDecimal() {
    if (Operation.lastValueIsType('operator', this.valueArr) || this.valueArr.length === 0) {
      this.valueArr.push('0.');
    } else if (this.valueArr[this.valueArr.length - 1].includes('.')) {
      this.publishAlert('Only 1 decimal is allowed!');
      return;
    } else if (Operation.lastValueIsType('end-parenthesis', this.valueArr)) {
      this.publishAlert('Please add an operator first!');
      return;
    } else {
      this.valueArr[this.valueArr.length - 1] += '.';
    }
    this.publishChange();
  }

  addParenthesisStart() {
    if (this.valueArr.length === 0 || Operation.lastValueIsType('operator', this.valueArr) || Operation.lastValueIsType('start-parenthesis', this.valueArr)) {
      this.valueArr.push('(');
      this.publishChange();
    } else {
      this.publishAlert('Parenthesis require an operator!');
    }
  }

  addParenthesisEnd() {
    const parenthesisStart = this.valueArr.filter((section) => section === '(');
    const parenthesisEnd = this.valueArr.filter((section) => section === ')');
    if (parenthesisStart.length > parenthesisEnd.length) {
      this.valueArr.push(')');
      this.publishChange();
    } else {
      this.publishAlert('Start parenthesis is missing!');
    }
  }

  dltValue() {
    if (this.valueArr.length === 0) {
      return;
    }
    const lastValue = this.valueArr[this.valueArr.length - 1];
    if (!Operation.lastValueIsType('operand', this.valueArr)) {
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
  }
}

export default Operation;
