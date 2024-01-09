/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/calculator-module/calculator.js":
/*!************************************************!*\
  !*** ./src/js/calculator-module/calculator.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _operation_class_operation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./operation-class/operation */ "./src/js/calculator-module/operation-class/operation.js");
/* harmony import */ var _pub_sub_module_PubSub__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../pub-sub-module/PubSub */ "./src/js/pub-sub-module/PubSub.js");
/* harmony import */ var _solve_infix_function_solveInfix__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./solve-infix-function/solveInfix */ "./src/js/calculator-module/solve-infix-function/solveInfix.js");



const calculator = {
  operations: [],
  keysPubSub: new _pub_sub_module_PubSub__WEBPACK_IMPORTED_MODULE_1__["default"](),
  inputsPubSub: new _pub_sub_module_PubSub__WEBPACK_IMPORTED_MODULE_1__["default"](),
  alertModalPubSub: new _pub_sub_module_PubSub__WEBPACK_IMPORTED_MODULE_1__["default"](),
  // gets current operation
  getCurrentOperation() {
    return this.operations[this.operations.length - 1];
  },
  // returns the operation, prepped and result values
  getCurrentOperationValues() {
    const valueStrings = this.getCurrentOperation().getValueStrings();
    const {
      currentValue,
      preppedValue
    } = valueStrings;
    return {
      operationValue: currentValue,
      preppedValue,
      resultValue: preppedValue ? (0,_solve_infix_function_solveInfix__WEBPACK_IMPORTED_MODULE_2__["default"])(preppedValue) : ' '
    };
  },
  // updates the values of the operation, result, and history inputs
  updateInputsValues() {
    let historyValues = [];
    if (this.operations.length > 1) {
      historyValues = this.operations.filter(operation => operation.completeEquation).map(operation => operation.completeEquation);
    }
    this.inputsPubSub.publish({
      ...this.getCurrentOperationValues(),
      historyValue: historyValues
    });
  },
  // publishes the new operation that keys have to subscribe to
  updateKeySubscriptions() {
    this.keysPubSub.publish(this.getCurrentOperation());
  },
  publishAlert(alertTxt) {
    this.alertModalPubSub.publish(alertTxt);
  },
  // subscribes to the pubSub property of the current operation
  subscribeToCurrent() {
    this.getCurrentOperation().pubSub.subscribe(this.updateInputsValues.bind(calculator));
    this.getCurrentOperation().alertPubSub.subscribe(this.publishAlert.bind(calculator));
  },
  // turns previous operation into an object with completeEquation method.
  retireCurrentOperation() {
    const currentOperationValues = this.getCurrentOperationValues();
    if (this.operations.length > 0 && currentOperationValues.resultValue !== ' ') {
      const lastOperationIndex = this.operations.length - 1;
      this.operations[lastOperationIndex] = {
        completeEquation: `${currentOperationValues.preppedValue} = ${currentOperationValues.resultValue}`
      };
    }
  },
  // creates a new operation
  newOperation() {
    if (this.operations.length === 0) {
      this.operations = [new _operation_class_operation__WEBPACK_IMPORTED_MODULE_0__["default"]()];
    }
    this.retireCurrentOperation();
    this.operations = [...this.operations, new _operation_class_operation__WEBPACK_IMPORTED_MODULE_0__["default"]()];
    this.updateKeySubscriptions();
    this.subscribeToCurrent();
    this.updateInputsValues();
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (calculator);

/***/ }),

/***/ "./src/js/calculator-module/operation-class/operation.js":
/*!***************************************************************!*\
  !*** ./src/js/calculator-module/operation-class/operation.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _pub_sub_module_PubSub__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../pub-sub-module/PubSub */ "./src/js/pub-sub-module/PubSub.js");


// contains the mathematical operation, previous operations, methods, and pubSubs

class Operation {
  constructor() {
    this.valueArr = [];
    this.pubSub = new _pub_sub_module_PubSub__WEBPACK_IMPORTED_MODULE_0__["default"]();
    this.alertPubSub = new _pub_sub_module_PubSub__WEBPACK_IMPORTED_MODULE_0__["default"]();
  }
  static lastValueIsType(type, arr) {
    if (arr.length === 0) {
      return false;
    }
    const lastValue = arr[arr.length - 1];
    switch (type) {
      case 'operand':
        {
          return !Number.isNaN(Number(lastValue));
        }
      case 'operator':
        {
          const validOperators = ['+', '-', '*', '/', '^'];
          return validOperators.includes(lastValue);
        }
      case 'start-parenthesis':
        {
          return lastValue === '(';
        }
      case 'end-parenthesis':
        {
          return lastValue === ')';
        }
      default:
        return 'invalid type';
    }
  }
  static addMissingParenthesisEnd(arr) {
    const parenthesisStart = arr.filter(section => section === '(');
    const parenthesisEnd = arr.filter(section => section === ')');
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
      preppedValue: Operation.prepIncompleteValueArr(this.valueArr.slice()).join(' ')
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
    const parenthesisStart = this.valueArr.filter(section => section === '(');
    const parenthesisEnd = this.valueArr.filter(section => section === ')');
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Operation);

/***/ }),

/***/ "./src/js/calculator-module/solve-infix-function/solve-postfix-function/handle-operator-function/handleOperator.js":
/*!*************************************************************************************************************************!*\
  !*** ./src/js/calculator-module/solve-infix-function/solve-postfix-function/handle-operator-function/handleOperator.js ***!
  \*************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function handleOperator(operator, stack) {
  const operand1 = stack.pop();
  const operand2 = stack.pop();
  switch (operator) {
    case '+':
      return stack.push(operand2 + operand1);
    case '-':
      return stack.push(operand2 - operand1);
    case '/':
      return stack.push(operand2 / operand1);
    case '*':
      return stack.push(operand2 * operand1);
    case '^':
      return stack.push(operand2 ** operand1);
    default:
      throw Error('unknown operator');
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (handleOperator);

/***/ }),

/***/ "./src/js/calculator-module/solve-infix-function/solve-postfix-function/solvePostfix.js":
/*!**********************************************************************************************!*\
  !*** ./src/js/calculator-module/solve-infix-function/solve-postfix-function/solvePostfix.js ***!
  \**********************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _handle_operator_function_handleOperator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./handle-operator-function/handleOperator */ "./src/js/calculator-module/solve-infix-function/solve-postfix-function/handle-operator-function/handleOperator.js");

function solvePostfix(str) {
  const stack = [];
  const strArr = str.split(' ');
  const isOperand = char => !Number.isNaN(Number(char));
  for (let i = 0; i < strArr.length; i += 1) {
    const currentChar = strArr[i];
    if (isOperand(currentChar)) {
      stack.push(+currentChar);
    } else {
      (0,_handle_operator_function_handleOperator__WEBPACK_IMPORTED_MODULE_0__["default"])(currentChar, stack);
    }
  }
  return stack.pop();
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (solvePostfix);

/***/ }),

/***/ "./src/js/calculator-module/solve-infix-function/solveInfix.js":
/*!*********************************************************************!*\
  !*** ./src/js/calculator-module/solve-infix-function/solveInfix.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _to_postfix_function_toPostfix__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./to-postfix-function/toPostfix */ "./src/js/calculator-module/solve-infix-function/to-postfix-function/toPostfix.js");
/* harmony import */ var _solve_postfix_function_solvePostfix__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./solve-postfix-function/solvePostfix */ "./src/js/calculator-module/solve-infix-function/solve-postfix-function/solvePostfix.js");


function solveInfix(string) {
  // accepts space separated infix strings
  const postFix = (0,_to_postfix_function_toPostfix__WEBPACK_IMPORTED_MODULE_0__["default"])(string);
  return (0,_solve_postfix_function_solvePostfix__WEBPACK_IMPORTED_MODULE_1__["default"])(postFix);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (solveInfix);

/***/ }),

/***/ "./src/js/calculator-module/solve-infix-function/to-postfix-function/operator-precedence-function/getOperatorPrecedence.js":
/*!*********************************************************************************************************************************!*\
  !*** ./src/js/calculator-module/solve-infix-function/to-postfix-function/operator-precedence-function/getOperatorPrecedence.js ***!
  \*********************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// function that returns the precedence of operators

function getOperatorPrecedence(op) {
  switch (op) {
    case '^':
      return 3;
    case '/':
    case '*':
      return 2;
    case '+':
    case '-':
      return 1;
    default:
      return -1;
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getOperatorPrecedence);

/***/ }),

/***/ "./src/js/calculator-module/solve-infix-function/to-postfix-function/toPostfix.js":
/*!****************************************************************************************!*\
  !*** ./src/js/calculator-module/solve-infix-function/to-postfix-function/toPostfix.js ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _operator_precedence_function_getOperatorPrecedence__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./operator-precedence-function/getOperatorPrecedence */ "./src/js/calculator-module/solve-infix-function/to-postfix-function/operator-precedence-function/getOperatorPrecedence.js");
 // getOperatorPrecedence

function toPostfix(str) {
  const stack = []; // stack for operators
  const result = []; // final result string
  const isOperand = char => !Number.isNaN(Number(char)); // checks if char is a number
  const handleOpeningParenthesis = char => stack.push(char);
  const handleClosingParenthesis = () => {
    while (stack.length !== 0 && stack[stack.length - 1] !== '(') {
      result.push(stack.pop());
    }
    stack.pop(); // remove the opening parenthesis
  };
  const handleOperator = char => {
    while (stack.length !== 0 && (0,_operator_precedence_function_getOperatorPrecedence__WEBPACK_IMPORTED_MODULE_0__["default"])(char) <= (0,_operator_precedence_function_getOperatorPrecedence__WEBPACK_IMPORTED_MODULE_0__["default"])(stack[stack.length - 1])) {
      result.push(stack.pop());
      // pop stack to result until the top operator has less precedence or the stack is empty
    }
    stack.push(char);
    // push operator to stack
  };
  const splitStr = str.trim().split(' ').filter(char => char !== ' ');
  splitStr.forEach(currentChar => {
    if (isOperand(currentChar)) {
      result.push(currentChar);
    } else if (currentChar === '(') {
      handleOpeningParenthesis(currentChar);
    } else if (currentChar === ')') {
      handleClosingParenthesis();
    } else {
      handleOperator(currentChar);
    }
  });
  while (stack.length !== 0) {
    // pop the remaining to the result
    result.push(stack.pop());
  }
  return result.join(' ');
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (toPostfix);

/***/ }),

/***/ "./src/js/interface-module/interface.js":
/*!**********************************************!*\
  !*** ./src/js/interface-module/interface.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _pub_sub_module_PubSub__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../pub-sub-module/PubSub */ "./src/js/pub-sub-module/PubSub.js");
/* harmony import */ var _calculator_module_calculator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../calculator-module/calculator */ "./src/js/calculator-module/calculator.js");



// displays the values of inputs
const inputOperation = document.querySelector('.display__input--operation');
const inputHistory = document.querySelector('.display__input--history');
const inputResult = document.querySelector('.display__input--result');
function scrollToNewest() {
  [inputOperation, inputHistory, inputResult].forEach(input => {
    // eslint-disable-next-line no-param-reassign
    input.scrollTop = input.scrollHeight;
  });
}
function displayInputValues(obj) {
  inputOperation.textContent = obj.operationValue;
  inputHistory.textContent = obj.historyValue.join('\n');
  inputResult.textContent = obj.resultValue === ' ' ? ' ' : ` = ${obj.resultValue}`;
}
_calculator_module_calculator__WEBPACK_IMPORTED_MODULE_1__["default"].inputsPubSub.subscribe(displayInputValues);
_calculator_module_calculator__WEBPACK_IMPORTED_MODULE_1__["default"].inputsPubSub.subscribe(scrollToNewest);

// group subscribe function
const operandPubSub = new _pub_sub_module_PubSub__WEBPACK_IMPORTED_MODULE_0__["default"]();
const operatorPubSub = new _pub_sub_module_PubSub__WEBPACK_IMPORTED_MODULE_0__["default"]();
const decimalPubSub = new _pub_sub_module_PubSub__WEBPACK_IMPORTED_MODULE_0__["default"]();
const dltPubSub = new _pub_sub_module_PubSub__WEBPACK_IMPORTED_MODULE_0__["default"]();
const parenthesisStartPubSub = new _pub_sub_module_PubSub__WEBPACK_IMPORTED_MODULE_0__["default"]();
const parenthesisEndPubSub = new _pub_sub_module_PubSub__WEBPACK_IMPORTED_MODULE_0__["default"]();
function subscribeNewOperation(newOperation) {
  operandPubSub.subscribe(newOperation.addOperand.bind(newOperation));
  operatorPubSub.subscribe(newOperation.addOperator.bind(newOperation));
  decimalPubSub.subscribe(newOperation.addDecimal.bind(newOperation));
  dltPubSub.subscribe(newOperation.dltValue.bind(newOperation));
  parenthesisStartPubSub.subscribe(newOperation.addParenthesisStart.bind(newOperation));
  parenthesisEndPubSub.subscribe(newOperation.addParenthesisEnd.bind(newOperation));
}
_calculator_module_calculator__WEBPACK_IMPORTED_MODULE_1__["default"].keysPubSub.subscribe(subscribeNewOperation);

// solve key
const solvePubSub = new _pub_sub_module_PubSub__WEBPACK_IMPORTED_MODULE_0__["default"]();
solvePubSub.subscribe(_calculator_module_calculator__WEBPACK_IMPORTED_MODULE_1__["default"].newOperation.bind(_calculator_module_calculator__WEBPACK_IMPORTED_MODULE_1__["default"]));
const solveKey = document.querySelector('.calculator__key--solve');
solveKey.addEventListener('click', () => {
  solvePubSub.publish();
});
// operand keys
const operands = document.querySelectorAll('.calculator__key--operand');
operands.forEach(operand => {
  operand.addEventListener('click', () => {
    operandPubSub.publish(operand.value);
  });
});
// operator keys
const operators = document.querySelectorAll('.calculator__key--operator');
operators.forEach(operator => {
  operator.addEventListener('click', () => {
    if (!operator.value) {
      operatorPubSub.publish(operator.dataset.value);
    } else {
      operatorPubSub.publish(operator.value);
    }
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
const parenthesisStart = document.querySelector('.calculator__key--parenthesis-start');
parenthesisStart.addEventListener('click', () => {
  parenthesisStartPubSub.publish();
});
// parenthesis end key
const parenthesisEnd = document.querySelector('.calculator__key--parenthesis-end');
parenthesisEnd.addEventListener('click', () => {
  parenthesisEndPubSub.publish();
});

// alert modal
const modalIcon = document.querySelector('.display__alert-icon');
const modal = document.querySelector('.display__modal');
const modalContent = document.querySelector('.modal-content');
const modalText = document.querySelector('.modal-content__text');
function delay(duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}
async function showTransitionModal() {
  modal.style.display = 'block';
  await delay(0);
  modalContent.classList.add('transition-in--modal');
  await delay(300);
}
async function showModal() {
  await showTransitionModal();
  modalText.style.display = 'block';
}
async function showTransitionIcon() {
  modalIcon.style.display = 'block';
  await delay(0);
  modalIcon.classList.add('transition-in--alert-icon');
  await delay(500);
}
function hideModal() {
  modal.style.display = 'none';
  modalContent.classList.remove('transition-in--modal');
  modalText.style.display = 'none';
}

// for pc
modalIcon.addEventListener('mouseover', showModal);
modalIcon.addEventListener('mouseout', hideModal);

// for touchscreens
modalIcon.addEventListener('click', showModal);
modalIcon.addEventListener('touchend', hideModal);
async function updateModal(text) {
  await showTransitionIcon();
  modalText.textContent = text;
}
function hideModalIcon() {
  modalIcon.classList.remove('transition-in--alert-icon');
  modalIcon.setAttribute('style', 'display: none');
  hideModal();
}
_calculator_module_calculator__WEBPACK_IMPORTED_MODULE_1__["default"].alertModalPubSub.subscribe(updateModal);
_calculator_module_calculator__WEBPACK_IMPORTED_MODULE_1__["default"].inputsPubSub.subscribe(hideModalIcon);

/***/ }),

/***/ "./src/js/pub-sub-module/PubSub.js":
/*!*****************************************!*\
  !*** ./src/js/pub-sub-module/PubSub.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class PubSub {
  constructor() {
    this.subscribers = [];
  }
  subscribe(subscriber) {
    if (typeof subscriber !== 'function') {
      throw new Error(`${typeof subscriber} is not a valid argument, provide a function instead`);
    }
    this.subscribers.push(subscriber);
  }
  unsubscribe(subscriber) {
    if (typeof subscriber !== 'function') {
      throw new Error(`${typeof subscriber} is not a valid argument, provide a function instead`);
    }
    this.subscribers = this.subscribers.filter(sub => sub !== subscriber);
  }
  publish(payload) {
    this.subscribers.forEach(subscriber => subscriber(payload));
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PubSub);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*************************!*\
  !*** ./src/js/index.js ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _interface_module_interface__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./interface-module/interface */ "./src/js/interface-module/interface.js");
/* harmony import */ var _calculator_module_calculator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./calculator-module/calculator */ "./src/js/calculator-module/calculator.js");


_calculator_module_calculator__WEBPACK_IMPORTED_MODULE_1__["default"].newOperation();
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFFLE9BQU82RSxVQUFXLHNEQUFxRCxDQUFDO0lBQzdGO0lBQ0EsSUFBSSxDQUFDRCxXQUFXLEdBQUcsSUFBSSxDQUFDQSxXQUFXLENBQUMvSCxNQUFNLENBQUVrSSxHQUFHLElBQUtBLEdBQUcsS0FBS0YsVUFBVSxDQUFDO0VBQ3pFO0VBRUE1SCxPQUFPQSxDQUFDK0gsT0FBTyxFQUFFO0lBQ2YsSUFBSSxDQUFDSixXQUFXLENBQUN4RCxPQUFPLENBQUV5RCxVQUFVLElBQUtBLFVBQVUsQ0FBQ0csT0FBTyxDQUFDLENBQUM7RUFDL0Q7QUFDRjtBQUVBLGlFQUFlckosTUFBTTs7Ozs7O1VDeEJyQjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7OztBQ05zQztBQUNrQjtBQUV4REUscUVBQVUsQ0FBQ2lDLFlBQVksQ0FBQyxDQUFDLEMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYWxjdWxhdG9yLy4vc3JjL2pzL2NhbGN1bGF0b3ItbW9kdWxlL2NhbGN1bGF0b3IuanMiLCJ3ZWJwYWNrOi8vY2FsY3VsYXRvci8uL3NyYy9qcy9jYWxjdWxhdG9yLW1vZHVsZS9vcGVyYXRpb24tY2xhc3Mvb3BlcmF0aW9uLmpzIiwid2VicGFjazovL2NhbGN1bGF0b3IvLi9zcmMvanMvY2FsY3VsYXRvci1tb2R1bGUvc29sdmUtaW5maXgtZnVuY3Rpb24vc29sdmUtcG9zdGZpeC1mdW5jdGlvbi9oYW5kbGUtb3BlcmF0b3ItZnVuY3Rpb24vaGFuZGxlT3BlcmF0b3IuanMiLCJ3ZWJwYWNrOi8vY2FsY3VsYXRvci8uL3NyYy9qcy9jYWxjdWxhdG9yLW1vZHVsZS9zb2x2ZS1pbmZpeC1mdW5jdGlvbi9zb2x2ZS1wb3N0Zml4LWZ1bmN0aW9uL3NvbHZlUG9zdGZpeC5qcyIsIndlYnBhY2s6Ly9jYWxjdWxhdG9yLy4vc3JjL2pzL2NhbGN1bGF0b3ItbW9kdWxlL3NvbHZlLWluZml4LWZ1bmN0aW9uL3NvbHZlSW5maXguanMiLCJ3ZWJwYWNrOi8vY2FsY3VsYXRvci8uL3NyYy9qcy9jYWxjdWxhdG9yLW1vZHVsZS9zb2x2ZS1pbmZpeC1mdW5jdGlvbi90by1wb3N0Zml4LWZ1bmN0aW9uL29wZXJhdG9yLXByZWNlZGVuY2UtZnVuY3Rpb24vZ2V0T3BlcmF0b3JQcmVjZWRlbmNlLmpzIiwid2VicGFjazovL2NhbGN1bGF0b3IvLi9zcmMvanMvY2FsY3VsYXRvci1tb2R1bGUvc29sdmUtaW5maXgtZnVuY3Rpb24vdG8tcG9zdGZpeC1mdW5jdGlvbi90b1Bvc3RmaXguanMiLCJ3ZWJwYWNrOi8vY2FsY3VsYXRvci8uL3NyYy9qcy9pbnRlcmZhY2UtbW9kdWxlL2ludGVyZmFjZS5qcyIsIndlYnBhY2s6Ly9jYWxjdWxhdG9yLy4vc3JjL2pzL3B1Yi1zdWItbW9kdWxlL1B1YlN1Yi5qcyIsIndlYnBhY2s6Ly9jYWxjdWxhdG9yL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2NhbGN1bGF0b3Ivd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2NhbGN1bGF0b3Ivd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9jYWxjdWxhdG9yL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vY2FsY3VsYXRvci8uL3NyYy9qcy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT3BlcmF0aW9uIGZyb20gJy4vb3BlcmF0aW9uLWNsYXNzL29wZXJhdGlvbic7XG5pbXBvcnQgUHViU3ViIGZyb20gJy4uL3B1Yi1zdWItbW9kdWxlL1B1YlN1Yic7XG5pbXBvcnQgc29sdmVJbmZpeCBmcm9tICcuL3NvbHZlLWluZml4LWZ1bmN0aW9uL3NvbHZlSW5maXgnO1xuXG5jb25zdCBjYWxjdWxhdG9yID0ge1xuICBvcGVyYXRpb25zOiBbXSxcbiAga2V5c1B1YlN1YjogbmV3IFB1YlN1YigpLFxuICBpbnB1dHNQdWJTdWI6IG5ldyBQdWJTdWIoKSxcbiAgYWxlcnRNb2RhbFB1YlN1YjogbmV3IFB1YlN1YigpLFxuXG4gIC8vIGdldHMgY3VycmVudCBvcGVyYXRpb25cbiAgZ2V0Q3VycmVudE9wZXJhdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5vcGVyYXRpb25zW3RoaXMub3BlcmF0aW9ucy5sZW5ndGggLSAxXTtcbiAgfSxcblxuICAvLyByZXR1cm5zIHRoZSBvcGVyYXRpb24sIHByZXBwZWQgYW5kIHJlc3VsdCB2YWx1ZXNcbiAgZ2V0Q3VycmVudE9wZXJhdGlvblZhbHVlcygpIHtcbiAgICBjb25zdCB2YWx1ZVN0cmluZ3MgPSB0aGlzLmdldEN1cnJlbnRPcGVyYXRpb24oKS5nZXRWYWx1ZVN0cmluZ3MoKTtcbiAgICBjb25zdCB7IGN1cnJlbnRWYWx1ZSwgcHJlcHBlZFZhbHVlIH0gPSB2YWx1ZVN0cmluZ3M7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9wZXJhdGlvblZhbHVlOiBjdXJyZW50VmFsdWUsXG4gICAgICBwcmVwcGVkVmFsdWUsXG4gICAgICByZXN1bHRWYWx1ZTogcHJlcHBlZFZhbHVlID8gc29sdmVJbmZpeChwcmVwcGVkVmFsdWUpIDogJyAnLFxuICAgIH07XG4gIH0sXG5cbiAgLy8gdXBkYXRlcyB0aGUgdmFsdWVzIG9mIHRoZSBvcGVyYXRpb24sIHJlc3VsdCwgYW5kIGhpc3RvcnkgaW5wdXRzXG4gIHVwZGF0ZUlucHV0c1ZhbHVlcygpIHtcbiAgICBsZXQgaGlzdG9yeVZhbHVlcyA9IFtdO1xuICAgIGlmICh0aGlzLm9wZXJhdGlvbnMubGVuZ3RoID4gMSkge1xuICAgICAgaGlzdG9yeVZhbHVlcyA9IHRoaXMub3BlcmF0aW9uc1xuICAgICAgICAuZmlsdGVyKChvcGVyYXRpb24pID0+IG9wZXJhdGlvbi5jb21wbGV0ZUVxdWF0aW9uKVxuICAgICAgICAubWFwKChvcGVyYXRpb24pID0+IG9wZXJhdGlvbi5jb21wbGV0ZUVxdWF0aW9uKTtcbiAgICB9XG4gICAgdGhpcy5pbnB1dHNQdWJTdWIucHVibGlzaCh7XG4gICAgICAuLi50aGlzLmdldEN1cnJlbnRPcGVyYXRpb25WYWx1ZXMoKSxcbiAgICAgIGhpc3RvcnlWYWx1ZTogaGlzdG9yeVZhbHVlcyxcbiAgICB9KTtcbiAgfSxcblxuICAvLyBwdWJsaXNoZXMgdGhlIG5ldyBvcGVyYXRpb24gdGhhdCBrZXlzIGhhdmUgdG8gc3Vic2NyaWJlIHRvXG4gIHVwZGF0ZUtleVN1YnNjcmlwdGlvbnMoKSB7XG4gICAgdGhpcy5rZXlzUHViU3ViLnB1Ymxpc2godGhpcy5nZXRDdXJyZW50T3BlcmF0aW9uKCkpO1xuICB9LFxuXG4gIHB1Ymxpc2hBbGVydChhbGVydFR4dCkge1xuICAgIHRoaXMuYWxlcnRNb2RhbFB1YlN1Yi5wdWJsaXNoKGFsZXJ0VHh0KTtcbiAgfSxcblxuICAvLyBzdWJzY3JpYmVzIHRvIHRoZSBwdWJTdWIgcHJvcGVydHkgb2YgdGhlIGN1cnJlbnQgb3BlcmF0aW9uXG4gIHN1YnNjcmliZVRvQ3VycmVudCgpIHtcbiAgICB0aGlzLmdldEN1cnJlbnRPcGVyYXRpb24oKS5wdWJTdWIuc3Vic2NyaWJlKFxuICAgICAgdGhpcy51cGRhdGVJbnB1dHNWYWx1ZXMuYmluZChjYWxjdWxhdG9yKVxuICAgICk7XG4gICAgdGhpcy5nZXRDdXJyZW50T3BlcmF0aW9uKCkuYWxlcnRQdWJTdWIuc3Vic2NyaWJlKFxuICAgICAgdGhpcy5wdWJsaXNoQWxlcnQuYmluZChjYWxjdWxhdG9yKVxuICAgICk7XG4gIH0sXG5cbiAgLy8gdHVybnMgcHJldmlvdXMgb3BlcmF0aW9uIGludG8gYW4gb2JqZWN0IHdpdGggY29tcGxldGVFcXVhdGlvbiBtZXRob2QuXG4gIHJldGlyZUN1cnJlbnRPcGVyYXRpb24oKSB7XG4gICAgY29uc3QgY3VycmVudE9wZXJhdGlvblZhbHVlcyA9IHRoaXMuZ2V0Q3VycmVudE9wZXJhdGlvblZhbHVlcygpO1xuICAgIGlmIChcbiAgICAgIHRoaXMub3BlcmF0aW9ucy5sZW5ndGggPiAwICYmXG4gICAgICBjdXJyZW50T3BlcmF0aW9uVmFsdWVzLnJlc3VsdFZhbHVlICE9PSAnICdcbiAgICApIHtcbiAgICAgIGNvbnN0IGxhc3RPcGVyYXRpb25JbmRleCA9IHRoaXMub3BlcmF0aW9ucy5sZW5ndGggLSAxO1xuICAgICAgdGhpcy5vcGVyYXRpb25zW2xhc3RPcGVyYXRpb25JbmRleF0gPSB7XG4gICAgICAgIGNvbXBsZXRlRXF1YXRpb246IGAke2N1cnJlbnRPcGVyYXRpb25WYWx1ZXMucHJlcHBlZFZhbHVlfSA9ICR7Y3VycmVudE9wZXJhdGlvblZhbHVlcy5yZXN1bHRWYWx1ZX1gLFxuICAgICAgfTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gY3JlYXRlcyBhIG5ldyBvcGVyYXRpb25cbiAgbmV3T3BlcmF0aW9uKCkge1xuICAgIGlmICh0aGlzLm9wZXJhdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLm9wZXJhdGlvbnMgPSBbbmV3IE9wZXJhdGlvbigpXTtcbiAgICB9XG4gICAgdGhpcy5yZXRpcmVDdXJyZW50T3BlcmF0aW9uKCk7XG4gICAgdGhpcy5vcGVyYXRpb25zID0gWy4uLnRoaXMub3BlcmF0aW9ucywgbmV3IE9wZXJhdGlvbigpXTtcbiAgICB0aGlzLnVwZGF0ZUtleVN1YnNjcmlwdGlvbnMoKTtcbiAgICB0aGlzLnN1YnNjcmliZVRvQ3VycmVudCgpO1xuICAgIHRoaXMudXBkYXRlSW5wdXRzVmFsdWVzKCk7XG4gIH0sXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjYWxjdWxhdG9yO1xuIiwiaW1wb3J0IFB1YlN1YiBmcm9tICcuLi8uLi9wdWItc3ViLW1vZHVsZS9QdWJTdWInO1xuXG4vLyBjb250YWlucyB0aGUgbWF0aGVtYXRpY2FsIG9wZXJhdGlvbiwgcHJldmlvdXMgb3BlcmF0aW9ucywgbWV0aG9kcywgYW5kIHB1YlN1YnNcblxuY2xhc3MgT3BlcmF0aW9uIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy52YWx1ZUFyciA9IFtdO1xuICAgIHRoaXMucHViU3ViID0gbmV3IFB1YlN1YigpO1xuICAgIHRoaXMuYWxlcnRQdWJTdWIgPSBuZXcgUHViU3ViKCk7XG4gIH1cblxuICBzdGF0aWMgbGFzdFZhbHVlSXNUeXBlKHR5cGUsIGFycikge1xuICAgIGlmIChhcnIubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGxhc3RWYWx1ZSA9IGFyclthcnIubGVuZ3RoIC0gMV07XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdvcGVyYW5kJzoge1xuICAgICAgICByZXR1cm4gIU51bWJlci5pc05hTihOdW1iZXIobGFzdFZhbHVlKSk7XG4gICAgICB9XG4gICAgICBjYXNlICdvcGVyYXRvcic6IHtcbiAgICAgICAgY29uc3QgdmFsaWRPcGVyYXRvcnMgPSBbJysnLCAnLScsICcqJywgJy8nLCAnXiddO1xuICAgICAgICByZXR1cm4gdmFsaWRPcGVyYXRvcnMuaW5jbHVkZXMobGFzdFZhbHVlKTtcbiAgICAgIH1cbiAgICAgIGNhc2UgJ3N0YXJ0LXBhcmVudGhlc2lzJzoge1xuICAgICAgICByZXR1cm4gbGFzdFZhbHVlID09PSAnKCc7XG4gICAgICB9XG4gICAgICBjYXNlICdlbmQtcGFyZW50aGVzaXMnOiB7XG4gICAgICAgIHJldHVybiBsYXN0VmFsdWUgPT09ICcpJztcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnaW52YWxpZCB0eXBlJztcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgYWRkTWlzc2luZ1BhcmVudGhlc2lzRW5kKGFycikge1xuICAgIGNvbnN0IHBhcmVudGhlc2lzU3RhcnQgPSBhcnIuZmlsdGVyKChzZWN0aW9uKSA9PiBzZWN0aW9uID09PSAnKCcpO1xuICAgIGNvbnN0IHBhcmVudGhlc2lzRW5kID0gYXJyLmZpbHRlcigoc2VjdGlvbikgPT4gc2VjdGlvbiA9PT0gJyknKTtcbiAgICBpZiAocGFyZW50aGVzaXNTdGFydC5sZW5ndGggIT09IHBhcmVudGhlc2lzRW5kLmxlbmd0aCkge1xuICAgICAgd2hpbGUgKHBhcmVudGhlc2lzU3RhcnQubGVuZ3RoID4gcGFyZW50aGVzaXNFbmQubGVuZ3RoKSB7XG4gICAgICAgIGFyci5wdXNoKCcpJyk7XG4gICAgICAgIHBhcmVudGhlc2lzRW5kLnB1c2goJyknKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycjtcbiAgfVxuXG4gIHN0YXRpYyBwcmVwSW5jb21wbGV0ZVZhbHVlQXJyKGFycikge1xuICAgIHdoaWxlIChPcGVyYXRpb24ubGFzdFZhbHVlSXNUeXBlKCdvcGVyYXRvcicsIGFycikgfHwgT3BlcmF0aW9uLmxhc3RWYWx1ZUlzVHlwZSgnc3RhcnQtcGFyZW50aGVzaXMnLCBhcnIpKSB7XG4gICAgICBhcnIucG9wKCk7XG4gICAgfVxuICAgIHJldHVybiBPcGVyYXRpb24uYWRkTWlzc2luZ1BhcmVudGhlc2lzRW5kKGFycik7XG4gIH1cblxuICBwdWJsaXNoQ2hhbmdlKCkge1xuICAgIHRoaXMucHViU3ViLnB1Ymxpc2goKTtcbiAgfVxuXG4gIHB1Ymxpc2hBbGVydChhbGVydFR4dCkge1xuICAgIHRoaXMuYWxlcnRQdWJTdWIucHVibGlzaChhbGVydFR4dCk7XG4gIH1cblxuICBnZXRWYWx1ZVN0cmluZ3MoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGN1cnJlbnRWYWx1ZTogdGhpcy52YWx1ZUFyci5qb2luKCcgJyksXG4gICAgICBwcmVwcGVkVmFsdWU6IE9wZXJhdGlvbi5wcmVwSW5jb21wbGV0ZVZhbHVlQXJyKHRoaXMudmFsdWVBcnIuc2xpY2UoKSkuam9pbignICcpLFxuICAgIH07XG4gIH1cblxuICBhZGRPcGVyYW5kKG9wZXJhbmQpIHtcbiAgICBpZiAoT3BlcmF0aW9uLmxhc3RWYWx1ZUlzVHlwZSgnZW5kLXBhcmVudGhlc2lzJywgdGhpcy52YWx1ZUFycikpIHtcbiAgICAgIHRoaXMucHVibGlzaEFsZXJ0KCdQbGVhc2UgYWRkIGFuIG9wZXJhdG9yIScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoT3BlcmF0aW9uLmxhc3RWYWx1ZUlzVHlwZSgnb3BlcmFuZCcsIHRoaXMudmFsdWVBcnIpKSB7XG4gICAgICB0aGlzLnZhbHVlQXJyW3RoaXMudmFsdWVBcnIubGVuZ3RoIC0gMV0gKz0gb3BlcmFuZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy52YWx1ZUFyci5wdXNoKG9wZXJhbmQpO1xuICAgIH1cbiAgICB0aGlzLnB1Ymxpc2hDaGFuZ2UoKTtcbiAgfVxuXG4gIGFkZE9wZXJhdG9yKG9wZXJhdG9yKSB7XG4gICAgaWYgKE9wZXJhdGlvbi5sYXN0VmFsdWVJc1R5cGUoJ29wZXJhdG9yJywgdGhpcy52YWx1ZUFycikpIHtcbiAgICAgIHRoaXMudmFsdWVBcnIucG9wKCk7XG4gICAgfSBlbHNlIGlmIChPcGVyYXRpb24ubGFzdFZhbHVlSXNUeXBlKCdzdGFydC1wYXJlbnRoZXNpcycsIHRoaXMudmFsdWVBcnIpIHx8IHRoaXMudmFsdWVBcnIubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLnB1Ymxpc2hBbGVydCgnUGxlYXNlIGFkZCBhbiBvcGVyYW5kIGZpcnN0IScpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnZhbHVlQXJyLnB1c2gob3BlcmF0b3IpO1xuICAgICAgdGhpcy5wdWJsaXNoQ2hhbmdlKCk7XG4gICAgfVxuICB9XG5cbiAgYWRkRGVjaW1hbCgpIHtcbiAgICBpZiAoT3BlcmF0aW9uLmxhc3RWYWx1ZUlzVHlwZSgnb3BlcmF0b3InLCB0aGlzLnZhbHVlQXJyKSB8fCB0aGlzLnZhbHVlQXJyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy52YWx1ZUFyci5wdXNoKCcwLicpO1xuICAgIH0gZWxzZSBpZiAodGhpcy52YWx1ZUFyclt0aGlzLnZhbHVlQXJyLmxlbmd0aCAtIDFdLmluY2x1ZGVzKCcuJykpIHtcbiAgICAgIHRoaXMucHVibGlzaEFsZXJ0KCdPbmx5IDEgZGVjaW1hbCBpcyBhbGxvd2VkIScpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoT3BlcmF0aW9uLmxhc3RWYWx1ZUlzVHlwZSgnZW5kLXBhcmVudGhlc2lzJywgdGhpcy52YWx1ZUFycikpIHtcbiAgICAgIHRoaXMucHVibGlzaEFsZXJ0KCdQbGVhc2UgYWRkIGFuIG9wZXJhdG9yIGZpcnN0IScpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnZhbHVlQXJyW3RoaXMudmFsdWVBcnIubGVuZ3RoIC0gMV0gKz0gJy4nO1xuICAgIH1cbiAgICB0aGlzLnB1Ymxpc2hDaGFuZ2UoKTtcbiAgfVxuXG4gIGFkZFBhcmVudGhlc2lzU3RhcnQoKSB7XG4gICAgaWYgKHRoaXMudmFsdWVBcnIubGVuZ3RoID09PSAwIHx8IE9wZXJhdGlvbi5sYXN0VmFsdWVJc1R5cGUoJ29wZXJhdG9yJywgdGhpcy52YWx1ZUFycikgfHwgT3BlcmF0aW9uLmxhc3RWYWx1ZUlzVHlwZSgnc3RhcnQtcGFyZW50aGVzaXMnLCB0aGlzLnZhbHVlQXJyKSkge1xuICAgICAgdGhpcy52YWx1ZUFyci5wdXNoKCcoJyk7XG4gICAgICB0aGlzLnB1Ymxpc2hDaGFuZ2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wdWJsaXNoQWxlcnQoJ1BhcmVudGhlc2lzIHJlcXVpcmUgYW4gb3BlcmF0b3IhJyk7XG4gICAgfVxuICB9XG5cbiAgYWRkUGFyZW50aGVzaXNFbmQoKSB7XG4gICAgY29uc3QgcGFyZW50aGVzaXNTdGFydCA9IHRoaXMudmFsdWVBcnIuZmlsdGVyKChzZWN0aW9uKSA9PiBzZWN0aW9uID09PSAnKCcpO1xuICAgIGNvbnN0IHBhcmVudGhlc2lzRW5kID0gdGhpcy52YWx1ZUFyci5maWx0ZXIoKHNlY3Rpb24pID0+IHNlY3Rpb24gPT09ICcpJyk7XG4gICAgaWYgKHBhcmVudGhlc2lzU3RhcnQubGVuZ3RoID4gcGFyZW50aGVzaXNFbmQubGVuZ3RoKSB7XG4gICAgICB0aGlzLnZhbHVlQXJyLnB1c2goJyknKTtcbiAgICAgIHRoaXMucHVibGlzaENoYW5nZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnB1Ymxpc2hBbGVydCgnU3RhcnQgcGFyZW50aGVzaXMgaXMgbWlzc2luZyEnKTtcbiAgICB9XG4gIH1cblxuICBkbHRWYWx1ZSgpIHtcbiAgICBpZiAodGhpcy52YWx1ZUFyci5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbGFzdFZhbHVlID0gdGhpcy52YWx1ZUFyclt0aGlzLnZhbHVlQXJyLmxlbmd0aCAtIDFdO1xuICAgIGlmICghT3BlcmF0aW9uLmxhc3RWYWx1ZUlzVHlwZSgnb3BlcmFuZCcsIHRoaXMudmFsdWVBcnIpKSB7XG4gICAgICB0aGlzLnZhbHVlQXJyLnBvcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBtb2RpZmllZExhc3RWYWx1ZSA9IGxhc3RWYWx1ZS5zbGljZSgwLCAtMSk7XG4gICAgICBpZiAobW9kaWZpZWRMYXN0VmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLnZhbHVlQXJyW3RoaXMudmFsdWVBcnIubGVuZ3RoIC0gMV0gPSBtb2RpZmllZExhc3RWYWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudmFsdWVBcnIucG9wKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucHVibGlzaENoYW5nZSgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE9wZXJhdGlvbjtcbiIsImZ1bmN0aW9uIGhhbmRsZU9wZXJhdG9yKG9wZXJhdG9yLCBzdGFjaykge1xuICBjb25zdCBvcGVyYW5kMSA9IHN0YWNrLnBvcCgpO1xuICBjb25zdCBvcGVyYW5kMiA9IHN0YWNrLnBvcCgpO1xuICBzd2l0Y2ggKG9wZXJhdG9yKSB7XG4gICAgY2FzZSAnKyc6XG4gICAgICByZXR1cm4gc3RhY2sucHVzaChvcGVyYW5kMiArIG9wZXJhbmQxKTtcbiAgICBjYXNlICctJzpcbiAgICAgIHJldHVybiBzdGFjay5wdXNoKG9wZXJhbmQyIC0gb3BlcmFuZDEpO1xuICAgIGNhc2UgJy8nOlxuICAgICAgcmV0dXJuIHN0YWNrLnB1c2gob3BlcmFuZDIgLyBvcGVyYW5kMSk7XG4gICAgY2FzZSAnKic6XG4gICAgICByZXR1cm4gc3RhY2sucHVzaChvcGVyYW5kMiAqIG9wZXJhbmQxKTtcbiAgICBjYXNlICdeJzpcbiAgICAgIHJldHVybiBzdGFjay5wdXNoKG9wZXJhbmQyICoqIG9wZXJhbmQxKTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgRXJyb3IoJ3Vua25vd24gb3BlcmF0b3InKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBoYW5kbGVPcGVyYXRvcjtcbiIsImltcG9ydCBoYW5kbGVPcGVyYXRvciBmcm9tICcuL2hhbmRsZS1vcGVyYXRvci1mdW5jdGlvbi9oYW5kbGVPcGVyYXRvcic7XG5cbmZ1bmN0aW9uIHNvbHZlUG9zdGZpeChzdHIpIHtcbiAgY29uc3Qgc3RhY2sgPSBbXTtcbiAgY29uc3Qgc3RyQXJyID0gc3RyLnNwbGl0KCcgJyk7XG4gIGNvbnN0IGlzT3BlcmFuZCA9IChjaGFyKSA9PiAhTnVtYmVyLmlzTmFOKE51bWJlcihjaGFyKSk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyQXJyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgY29uc3QgY3VycmVudENoYXIgPSBzdHJBcnJbaV07XG4gICAgaWYgKGlzT3BlcmFuZChjdXJyZW50Q2hhcikpIHtcbiAgICAgIHN0YWNrLnB1c2goK2N1cnJlbnRDaGFyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGFuZGxlT3BlcmF0b3IoY3VycmVudENoYXIsIHN0YWNrKTtcbiAgICB9XG4gIH0gcmV0dXJuIHN0YWNrLnBvcCgpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBzb2x2ZVBvc3RmaXg7XG4iLCJpbXBvcnQgdG9Qb3N0Zml4IGZyb20gJy4vdG8tcG9zdGZpeC1mdW5jdGlvbi90b1Bvc3RmaXgnO1xuaW1wb3J0IHNvbHZlUG9zdGZpeCBmcm9tICcuL3NvbHZlLXBvc3RmaXgtZnVuY3Rpb24vc29sdmVQb3N0Zml4JztcblxuZnVuY3Rpb24gc29sdmVJbmZpeChzdHJpbmcpIHsgLy8gYWNjZXB0cyBzcGFjZSBzZXBhcmF0ZWQgaW5maXggc3RyaW5nc1xuICBjb25zdCBwb3N0Rml4ID0gdG9Qb3N0Zml4KHN0cmluZyk7XG4gIHJldHVybiBzb2x2ZVBvc3RmaXgocG9zdEZpeCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHNvbHZlSW5maXg7XG4iLCIvLyBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHByZWNlZGVuY2Ugb2Ygb3BlcmF0b3JzXG5cbmZ1bmN0aW9uIGdldE9wZXJhdG9yUHJlY2VkZW5jZShvcCkge1xuICBzd2l0Y2ggKG9wKSB7XG4gICAgY2FzZSAnXic6XG4gICAgICByZXR1cm4gMztcbiAgICBjYXNlICcvJzpcbiAgICBjYXNlICcqJzpcbiAgICAgIHJldHVybiAyO1xuICAgIGNhc2UgJysnOlxuICAgIGNhc2UgJy0nOlxuICAgICAgcmV0dXJuIDE7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAtMTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBnZXRPcGVyYXRvclByZWNlZGVuY2U7XG4iLCJpbXBvcnQgZ2V0UHJlYyBmcm9tICcuL29wZXJhdG9yLXByZWNlZGVuY2UtZnVuY3Rpb24vZ2V0T3BlcmF0b3JQcmVjZWRlbmNlJzsgLy8gZ2V0T3BlcmF0b3JQcmVjZWRlbmNlXG5cbmZ1bmN0aW9uIHRvUG9zdGZpeChzdHIpIHtcbiAgY29uc3Qgc3RhY2sgPSBbXTsgLy8gc3RhY2sgZm9yIG9wZXJhdG9yc1xuICBjb25zdCByZXN1bHQgPSBbXTsgLy8gZmluYWwgcmVzdWx0IHN0cmluZ1xuICBjb25zdCBpc09wZXJhbmQgPSAoY2hhcikgPT4gIU51bWJlci5pc05hTihOdW1iZXIoY2hhcikpOyAvLyBjaGVja3MgaWYgY2hhciBpcyBhIG51bWJlclxuICBjb25zdCBoYW5kbGVPcGVuaW5nUGFyZW50aGVzaXMgPSAoY2hhcikgPT4gc3RhY2sucHVzaChjaGFyKTtcbiAgY29uc3QgaGFuZGxlQ2xvc2luZ1BhcmVudGhlc2lzID0gKCkgPT4ge1xuICAgIHdoaWxlIChzdGFjay5sZW5ndGggIT09IDAgJiYgc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0gIT09ICcoJykge1xuICAgICAgcmVzdWx0LnB1c2goc3RhY2sucG9wKCkpO1xuICAgIH1cbiAgICBzdGFjay5wb3AoKTsgLy8gcmVtb3ZlIHRoZSBvcGVuaW5nIHBhcmVudGhlc2lzXG4gIH07XG5cbiAgY29uc3QgaGFuZGxlT3BlcmF0b3IgPSAoY2hhcikgPT4ge1xuICAgIHdoaWxlIChzdGFjay5sZW5ndGggIT09IDAgJiYgZ2V0UHJlYyhjaGFyKSA8PSBnZXRQcmVjKHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdKSkge1xuICAgICAgcmVzdWx0LnB1c2goc3RhY2sucG9wKCkpO1xuICAgICAgLy8gcG9wIHN0YWNrIHRvIHJlc3VsdCB1bnRpbCB0aGUgdG9wIG9wZXJhdG9yIGhhcyBsZXNzIHByZWNlZGVuY2Ugb3IgdGhlIHN0YWNrIGlzIGVtcHR5XG4gICAgfVxuICAgIHN0YWNrLnB1c2goY2hhcik7XG4gICAgLy8gcHVzaCBvcGVyYXRvciB0byBzdGFja1xuICB9O1xuICBjb25zdCBzcGxpdFN0ciA9IHN0ci50cmltKCkuc3BsaXQoJyAnKS5maWx0ZXIoKGNoYXIpID0+IGNoYXIgIT09ICcgJyk7XG4gIHNwbGl0U3RyLmZvckVhY2goKGN1cnJlbnRDaGFyKSA9PiB7XG4gICAgaWYgKGlzT3BlcmFuZChjdXJyZW50Q2hhcikpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGN1cnJlbnRDaGFyKTtcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnRDaGFyID09PSAnKCcpIHtcbiAgICAgIGhhbmRsZU9wZW5pbmdQYXJlbnRoZXNpcyhjdXJyZW50Q2hhcik7XG4gICAgfSBlbHNlIGlmIChjdXJyZW50Q2hhciA9PT0gJyknKSB7XG4gICAgICBoYW5kbGVDbG9zaW5nUGFyZW50aGVzaXMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGFuZGxlT3BlcmF0b3IoY3VycmVudENoYXIpO1xuICAgIH1cbiAgfSk7XG4gIHdoaWxlIChzdGFjay5sZW5ndGggIT09IDApIHsgLy8gcG9wIHRoZSByZW1haW5pbmcgdG8gdGhlIHJlc3VsdFxuICAgIHJlc3VsdC5wdXNoKHN0YWNrLnBvcCgpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0LmpvaW4oJyAnKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdG9Qb3N0Zml4O1xuIiwiaW1wb3J0IFB1YlN1YiBmcm9tICcuLi9wdWItc3ViLW1vZHVsZS9QdWJTdWInO1xuaW1wb3J0IGNhbGN1bGF0b3IgZnJvbSAnLi4vY2FsY3VsYXRvci1tb2R1bGUvY2FsY3VsYXRvcic7XG5cbi8vIGRpc3BsYXlzIHRoZSB2YWx1ZXMgb2YgaW5wdXRzXG5jb25zdCBpbnB1dE9wZXJhdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kaXNwbGF5X19pbnB1dC0tb3BlcmF0aW9uJyk7XG5jb25zdCBpbnB1dEhpc3RvcnkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZGlzcGxheV9faW5wdXQtLWhpc3RvcnknKTtcbmNvbnN0IGlucHV0UmVzdWx0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRpc3BsYXlfX2lucHV0LS1yZXN1bHQnKTtcblxuZnVuY3Rpb24gc2Nyb2xsVG9OZXdlc3QoKSB7XG4gIFtpbnB1dE9wZXJhdGlvbiwgaW5wdXRIaXN0b3J5LCBpbnB1dFJlc3VsdF0uZm9yRWFjaCgoaW5wdXQpID0+IHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICBpbnB1dC5zY3JvbGxUb3AgPSBpbnB1dC5zY3JvbGxIZWlnaHQ7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkaXNwbGF5SW5wdXRWYWx1ZXMob2JqKSB7XG4gIGlucHV0T3BlcmF0aW9uLnRleHRDb250ZW50ID0gb2JqLm9wZXJhdGlvblZhbHVlO1xuICBpbnB1dEhpc3RvcnkudGV4dENvbnRlbnQgPSBvYmouaGlzdG9yeVZhbHVlLmpvaW4oJ1xcbicpO1xuICBpbnB1dFJlc3VsdC50ZXh0Q29udGVudCA9XG4gICAgb2JqLnJlc3VsdFZhbHVlID09PSAnICcgPyAnICcgOiBgID0gJHtvYmoucmVzdWx0VmFsdWV9YDtcbn1cblxuY2FsY3VsYXRvci5pbnB1dHNQdWJTdWIuc3Vic2NyaWJlKGRpc3BsYXlJbnB1dFZhbHVlcyk7XG5cbmNhbGN1bGF0b3IuaW5wdXRzUHViU3ViLnN1YnNjcmliZShzY3JvbGxUb05ld2VzdCk7XG5cbi8vIGdyb3VwIHN1YnNjcmliZSBmdW5jdGlvblxuY29uc3Qgb3BlcmFuZFB1YlN1YiA9IG5ldyBQdWJTdWIoKTtcbmNvbnN0IG9wZXJhdG9yUHViU3ViID0gbmV3IFB1YlN1YigpO1xuY29uc3QgZGVjaW1hbFB1YlN1YiA9IG5ldyBQdWJTdWIoKTtcbmNvbnN0IGRsdFB1YlN1YiA9IG5ldyBQdWJTdWIoKTtcbmNvbnN0IHBhcmVudGhlc2lzU3RhcnRQdWJTdWIgPSBuZXcgUHViU3ViKCk7XG5jb25zdCBwYXJlbnRoZXNpc0VuZFB1YlN1YiA9IG5ldyBQdWJTdWIoKTtcblxuZnVuY3Rpb24gc3Vic2NyaWJlTmV3T3BlcmF0aW9uKG5ld09wZXJhdGlvbikge1xuICBvcGVyYW5kUHViU3ViLnN1YnNjcmliZShuZXdPcGVyYXRpb24uYWRkT3BlcmFuZC5iaW5kKG5ld09wZXJhdGlvbikpO1xuICBvcGVyYXRvclB1YlN1Yi5zdWJzY3JpYmUobmV3T3BlcmF0aW9uLmFkZE9wZXJhdG9yLmJpbmQobmV3T3BlcmF0aW9uKSk7XG4gIGRlY2ltYWxQdWJTdWIuc3Vic2NyaWJlKG5ld09wZXJhdGlvbi5hZGREZWNpbWFsLmJpbmQobmV3T3BlcmF0aW9uKSk7XG4gIGRsdFB1YlN1Yi5zdWJzY3JpYmUobmV3T3BlcmF0aW9uLmRsdFZhbHVlLmJpbmQobmV3T3BlcmF0aW9uKSk7XG4gIHBhcmVudGhlc2lzU3RhcnRQdWJTdWIuc3Vic2NyaWJlKFxuICAgIG5ld09wZXJhdGlvbi5hZGRQYXJlbnRoZXNpc1N0YXJ0LmJpbmQobmV3T3BlcmF0aW9uKVxuICApO1xuICBwYXJlbnRoZXNpc0VuZFB1YlN1Yi5zdWJzY3JpYmUoXG4gICAgbmV3T3BlcmF0aW9uLmFkZFBhcmVudGhlc2lzRW5kLmJpbmQobmV3T3BlcmF0aW9uKVxuICApO1xufVxuXG5jYWxjdWxhdG9yLmtleXNQdWJTdWIuc3Vic2NyaWJlKHN1YnNjcmliZU5ld09wZXJhdGlvbik7XG5cbi8vIHNvbHZlIGtleVxuY29uc3Qgc29sdmVQdWJTdWIgPSBuZXcgUHViU3ViKCk7XG5zb2x2ZVB1YlN1Yi5zdWJzY3JpYmUoY2FsY3VsYXRvci5uZXdPcGVyYXRpb24uYmluZChjYWxjdWxhdG9yKSk7XG5jb25zdCBzb2x2ZUtleSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYWxjdWxhdG9yX19rZXktLXNvbHZlJyk7XG5zb2x2ZUtleS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgc29sdmVQdWJTdWIucHVibGlzaCgpO1xufSk7XG4vLyBvcGVyYW5kIGtleXNcbmNvbnN0IG9wZXJhbmRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNhbGN1bGF0b3JfX2tleS0tb3BlcmFuZCcpO1xub3BlcmFuZHMuZm9yRWFjaCgob3BlcmFuZCkgPT4ge1xuICBvcGVyYW5kLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIG9wZXJhbmRQdWJTdWIucHVibGlzaChvcGVyYW5kLnZhbHVlKTtcbiAgfSk7XG59KTtcbi8vIG9wZXJhdG9yIGtleXNcbmNvbnN0IG9wZXJhdG9ycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jYWxjdWxhdG9yX19rZXktLW9wZXJhdG9yJyk7XG5vcGVyYXRvcnMuZm9yRWFjaCgob3BlcmF0b3IpID0+IHtcbiAgb3BlcmF0b3IuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgaWYgKCFvcGVyYXRvci52YWx1ZSkge1xuICAgICAgb3BlcmF0b3JQdWJTdWIucHVibGlzaChvcGVyYXRvci5kYXRhc2V0LnZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3BlcmF0b3JQdWJTdWIucHVibGlzaChvcGVyYXRvci52YWx1ZSk7XG4gICAgfVxuICB9KTtcbn0pO1xuLy8gZGVjaW1hbCBrZXlcbmNvbnN0IGRlY2ltYWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2FsY3VsYXRvcl9fa2V5LS1kZWNpbWFsJyk7XG5kZWNpbWFsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICBkZWNpbWFsUHViU3ViLnB1Ymxpc2goKTtcbn0pO1xuLy8gZGVsZXRlIGtleVxuY29uc3QgZGx0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNhbGN1bGF0b3JfX2tleS0tZGVsJyk7XG5kbHQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gIGRsdFB1YlN1Yi5wdWJsaXNoKCk7XG59KTtcbi8vIGNsZWFyIGtleVxuY29uc3QgY2xlYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2FsY3VsYXRvcl9fa2V5LS1jbGVhcicpO1xuY2xlYXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbn0pO1xuLy8gcGFyZW50aGVzaXMgc3RhcnQga2V5XG5jb25zdCBwYXJlbnRoZXNpc1N0YXJ0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgJy5jYWxjdWxhdG9yX19rZXktLXBhcmVudGhlc2lzLXN0YXJ0J1xuKTtcbnBhcmVudGhlc2lzU3RhcnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gIHBhcmVudGhlc2lzU3RhcnRQdWJTdWIucHVibGlzaCgpO1xufSk7XG4vLyBwYXJlbnRoZXNpcyBlbmQga2V5XG5jb25zdCBwYXJlbnRoZXNpc0VuZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICcuY2FsY3VsYXRvcl9fa2V5LS1wYXJlbnRoZXNpcy1lbmQnXG4pO1xucGFyZW50aGVzaXNFbmQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gIHBhcmVudGhlc2lzRW5kUHViU3ViLnB1Ymxpc2goKTtcbn0pO1xuXG4vLyBhbGVydCBtb2RhbFxuY29uc3QgbW9kYWxJY29uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRpc3BsYXlfX2FsZXJ0LWljb24nKTtcbmNvbnN0IG1vZGFsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRpc3BsYXlfX21vZGFsJyk7XG5jb25zdCBtb2RhbENvbnRlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubW9kYWwtY29udGVudCcpO1xuY29uc3QgbW9kYWxUZXh0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1vZGFsLWNvbnRlbnRfX3RleHQnKTtcblxuZnVuY3Rpb24gZGVsYXkoZHVyYXRpb24pIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgc2V0VGltZW91dChyZXNvbHZlLCBkdXJhdGlvbik7XG4gIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzaG93VHJhbnNpdGlvbk1vZGFsKCkge1xuICBtb2RhbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgYXdhaXQgZGVsYXkoMCk7XG4gIG1vZGFsQ29udGVudC5jbGFzc0xpc3QuYWRkKCd0cmFuc2l0aW9uLWluLS1tb2RhbCcpO1xuICBhd2FpdCBkZWxheSgzMDApO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzaG93TW9kYWwoKSB7XG4gIGF3YWl0IHNob3dUcmFuc2l0aW9uTW9kYWwoKTtcbiAgbW9kYWxUZXh0LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzaG93VHJhbnNpdGlvbkljb24oKSB7XG4gIG1vZGFsSWNvbi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgYXdhaXQgZGVsYXkoMCk7XG4gIG1vZGFsSWNvbi5jbGFzc0xpc3QuYWRkKCd0cmFuc2l0aW9uLWluLS1hbGVydC1pY29uJyk7XG4gIGF3YWl0IGRlbGF5KDUwMCk7XG59XG5cbmZ1bmN0aW9uIGhpZGVNb2RhbCgpIHtcbiAgbW9kYWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgbW9kYWxDb250ZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3RyYW5zaXRpb24taW4tLW1vZGFsJyk7XG4gIG1vZGFsVGV4dC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xufVxuXG4vLyBmb3IgcGNcbm1vZGFsSWNvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCBzaG93TW9kYWwpO1xubW9kYWxJY29uLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgaGlkZU1vZGFsKTtcblxuLy8gZm9yIHRvdWNoc2NyZWVuc1xubW9kYWxJY29uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2hvd01vZGFsKTtcbm1vZGFsSWNvbi5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGhpZGVNb2RhbCk7XG5cbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZU1vZGFsKHRleHQpIHtcbiAgYXdhaXQgc2hvd1RyYW5zaXRpb25JY29uKCk7XG4gIG1vZGFsVGV4dC50ZXh0Q29udGVudCA9IHRleHQ7XG59XG5cbmZ1bmN0aW9uIGhpZGVNb2RhbEljb24oKSB7XG4gIG1vZGFsSWNvbi5jbGFzc0xpc3QucmVtb3ZlKCd0cmFuc2l0aW9uLWluLS1hbGVydC1pY29uJyk7XG4gIG1vZGFsSWNvbi5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2Rpc3BsYXk6IG5vbmUnKTtcbiAgaGlkZU1vZGFsKCk7XG59XG5cbmNhbGN1bGF0b3IuYWxlcnRNb2RhbFB1YlN1Yi5zdWJzY3JpYmUodXBkYXRlTW9kYWwpO1xuY2FsY3VsYXRvci5pbnB1dHNQdWJTdWIuc3Vic2NyaWJlKGhpZGVNb2RhbEljb24pO1xuIiwiY2xhc3MgUHViU3ViIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdWJzY3JpYmVycyA9IFtdO1xuICB9XG5cbiAgc3Vic2NyaWJlKHN1YnNjcmliZXIpIHtcbiAgICBpZiAodHlwZW9mIHN1YnNjcmliZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHt0eXBlb2Ygc3Vic2NyaWJlcn0gaXMgbm90IGEgdmFsaWQgYXJndW1lbnQsIHByb3ZpZGUgYSBmdW5jdGlvbiBpbnN0ZWFkYCk7XG4gICAgfVxuICAgIHRoaXMuc3Vic2NyaWJlcnMucHVzaChzdWJzY3JpYmVyKTtcbiAgfVxuXG4gIHVuc3Vic2NyaWJlKHN1YnNjcmliZXIpIHtcbiAgICBpZiAodHlwZW9mIHN1YnNjcmliZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHt0eXBlb2Ygc3Vic2NyaWJlcn0gaXMgbm90IGEgdmFsaWQgYXJndW1lbnQsIHByb3ZpZGUgYSBmdW5jdGlvbiBpbnN0ZWFkYCk7XG4gICAgfVxuICAgIHRoaXMuc3Vic2NyaWJlcnMgPSB0aGlzLnN1YnNjcmliZXJzLmZpbHRlcigoc3ViKSA9PiBzdWIgIT09IHN1YnNjcmliZXIpO1xuICB9XG5cbiAgcHVibGlzaChwYXlsb2FkKSB7XG4gICAgdGhpcy5zdWJzY3JpYmVycy5mb3JFYWNoKChzdWJzY3JpYmVyKSA9PiBzdWJzY3JpYmVyKHBheWxvYWQpKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQdWJTdWI7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCAnLi9pbnRlcmZhY2UtbW9kdWxlL2ludGVyZmFjZSc7XG5pbXBvcnQgY2FsY3VsYXRvciBmcm9tICcuL2NhbGN1bGF0b3ItbW9kdWxlL2NhbGN1bGF0b3InO1xuXG5jYWxjdWxhdG9yLm5ld09wZXJhdGlvbigpOyJdLCJuYW1lcyI6WyJPcGVyYXRpb24iLCJQdWJTdWIiLCJzb2x2ZUluZml4IiwiY2FsY3VsYXRvciIsIm9wZXJhdGlvbnMiLCJrZXlzUHViU3ViIiwiaW5wdXRzUHViU3ViIiwiYWxlcnRNb2RhbFB1YlN1YiIsImdldEN1cnJlbnRPcGVyYXRpb24iLCJsZW5ndGgiLCJnZXRDdXJyZW50T3BlcmF0aW9uVmFsdWVzIiwidmFsdWVTdHJpbmdzIiwiZ2V0VmFsdWVTdHJpbmdzIiwiY3VycmVudFZhbHVlIiwicHJlcHBlZFZhbHVlIiwib3BlcmF0aW9uVmFsdWUiLCJyZXN1bHRWYWx1ZSIsInVwZGF0ZUlucHV0c1ZhbHVlcyIsImhpc3RvcnlWYWx1ZXMiLCJmaWx0ZXIiLCJvcGVyYXRpb24iLCJjb21wbGV0ZUVxdWF0aW9uIiwibWFwIiwicHVibGlzaCIsImhpc3RvcnlWYWx1ZSIsInVwZGF0ZUtleVN1YnNjcmlwdGlvbnMiLCJwdWJsaXNoQWxlcnQiLCJhbGVydFR4dCIsInN1YnNjcmliZVRvQ3VycmVudCIsInB1YlN1YiIsInN1YnNjcmliZSIsImJpbmQiLCJhbGVydFB1YlN1YiIsInJldGlyZUN1cnJlbnRPcGVyYXRpb24iLCJjdXJyZW50T3BlcmF0aW9uVmFsdWVzIiwibGFzdE9wZXJhdGlvbkluZGV4IiwibmV3T3BlcmF0aW9uIiwiY29uc3RydWN0b3IiLCJ2YWx1ZUFyciIsImxhc3RWYWx1ZUlzVHlwZSIsInR5cGUiLCJhcnIiLCJsYXN0VmFsdWUiLCJOdW1iZXIiLCJpc05hTiIsInZhbGlkT3BlcmF0b3JzIiwiaW5jbHVkZXMiLCJhZGRNaXNzaW5nUGFyZW50aGVzaXNFbmQiLCJwYXJlbnRoZXNpc1N0YXJ0Iiwic2VjdGlvbiIsInBhcmVudGhlc2lzRW5kIiwicHVzaCIsInByZXBJbmNvbXBsZXRlVmFsdWVBcnIiLCJwb3AiLCJwdWJsaXNoQ2hhbmdlIiwiam9pbiIsInNsaWNlIiwiYWRkT3BlcmFuZCIsIm9wZXJhbmQiLCJhZGRPcGVyYXRvciIsIm9wZXJhdG9yIiwiYWRkRGVjaW1hbCIsImFkZFBhcmVudGhlc2lzU3RhcnQiLCJhZGRQYXJlbnRoZXNpc0VuZCIsImRsdFZhbHVlIiwibW9kaWZpZWRMYXN0VmFsdWUiLCJoYW5kbGVPcGVyYXRvciIsInN0YWNrIiwib3BlcmFuZDEiLCJvcGVyYW5kMiIsIkVycm9yIiwic29sdmVQb3N0Zml4Iiwic3RyIiwic3RyQXJyIiwic3BsaXQiLCJpc09wZXJhbmQiLCJjaGFyIiwiaSIsImN1cnJlbnRDaGFyIiwidG9Qb3N0Zml4Iiwic3RyaW5nIiwicG9zdEZpeCIsImdldE9wZXJhdG9yUHJlY2VkZW5jZSIsIm9wIiwiZ2V0UHJlYyIsInJlc3VsdCIsImhhbmRsZU9wZW5pbmdQYXJlbnRoZXNpcyIsImhhbmRsZUNsb3NpbmdQYXJlbnRoZXNpcyIsInNwbGl0U3RyIiwidHJpbSIsImZvckVhY2giLCJpbnB1dE9wZXJhdGlvbiIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsImlucHV0SGlzdG9yeSIsImlucHV0UmVzdWx0Iiwic2Nyb2xsVG9OZXdlc3QiLCJpbnB1dCIsInNjcm9sbFRvcCIsInNjcm9sbEhlaWdodCIsImRpc3BsYXlJbnB1dFZhbHVlcyIsIm9iaiIsInRleHRDb250ZW50Iiwib3BlcmFuZFB1YlN1YiIsIm9wZXJhdG9yUHViU3ViIiwiZGVjaW1hbFB1YlN1YiIsImRsdFB1YlN1YiIsInBhcmVudGhlc2lzU3RhcnRQdWJTdWIiLCJwYXJlbnRoZXNpc0VuZFB1YlN1YiIsInN1YnNjcmliZU5ld09wZXJhdGlvbiIsInNvbHZlUHViU3ViIiwic29sdmVLZXkiLCJhZGRFdmVudExpc3RlbmVyIiwib3BlcmFuZHMiLCJxdWVyeVNlbGVjdG9yQWxsIiwidmFsdWUiLCJvcGVyYXRvcnMiLCJkYXRhc2V0IiwiZGVjaW1hbCIsImRsdCIsImNsZWFyIiwid2luZG93IiwibG9jYXRpb24iLCJyZWxvYWQiLCJtb2RhbEljb24iLCJtb2RhbCIsIm1vZGFsQ29udGVudCIsIm1vZGFsVGV4dCIsImRlbGF5IiwiZHVyYXRpb24iLCJQcm9taXNlIiwicmVzb2x2ZSIsInNldFRpbWVvdXQiLCJzaG93VHJhbnNpdGlvbk1vZGFsIiwic3R5bGUiLCJkaXNwbGF5IiwiY2xhc3NMaXN0IiwiYWRkIiwic2hvd01vZGFsIiwic2hvd1RyYW5zaXRpb25JY29uIiwiaGlkZU1vZGFsIiwicmVtb3ZlIiwidXBkYXRlTW9kYWwiLCJ0ZXh0IiwiaGlkZU1vZGFsSWNvbiIsInNldEF0dHJpYnV0ZSIsInN1YnNjcmliZXJzIiwic3Vic2NyaWJlciIsInVuc3Vic2NyaWJlIiwic3ViIiwicGF5bG9hZCJdLCJzb3VyY2VSb290IjoiIn0=