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
      preppedValue: preppedValue,
      resultValue: preppedValue ? (0,_solve_infix_function_solveInfix__WEBPACK_IMPORTED_MODULE_2__["default"])(preppedValue) : " "
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
    input.scrollTop = input.scrollHeight;
  });
}
function displayInputValues(obj) {
  inputOperation.textContent = obj.operationValue;
  inputHistory.textContent = obj.historyValue.join('\n');
  inputResult.textContent = obj.resultValue === " " ? ' ' : ` = ${obj.resultValue}`;
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
    console.log(operator.value);
    if (!operator.value) {
      console.log(operator.dataset.value);
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
const modalText = document.querySelector(".modal-content__text");
function delay(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
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
  modalText.style.display = "none";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQztFQUNuQztFQUVBQyxXQUFXQSxDQUFDRCxVQUFVLEVBQUU7SUFDdEIsSUFBSSxPQUFPQSxVQUFVLEtBQUssVUFBVSxFQUFFO01BQ3BDLE1BQU0sSUFBSS9FLEtBQUssQ0FBRSxHQUFFLE9BQU8rRSxVQUFXLHNEQUFxRCxDQUFDO0lBQzdGO0lBQ0EsSUFBSSxDQUFDRCxXQUFXLEdBQUcsSUFBSSxDQUFDQSxXQUFXLENBQUNqSSxNQUFNLENBQUVvSSxHQUFHLElBQUtBLEdBQUcsS0FBS0YsVUFBVSxDQUFDO0VBQ3pFO0VBRUE5SCxPQUFPQSxDQUFDaUksT0FBTyxFQUFFO0lBQ2YsSUFBSSxDQUFDSixXQUFXLENBQUMxRCxPQUFPLENBQUUyRCxVQUFVLElBQUtBLFVBQVUsQ0FBQ0csT0FBTyxDQUFDLENBQUM7RUFDL0Q7QUFDRjtBQUVBLGlFQUFldkosTUFBTTs7Ozs7O1VDeEJyQjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7OztBQ05zQztBQUNrQjtBQUV4REUscUVBQVUsQ0FBQ2lDLFlBQVksQ0FBQyxDQUFDLEMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYWxjdWxhdG9yLy4vc3JjL2pzL2NhbGN1bGF0b3ItbW9kdWxlL2NhbGN1bGF0b3IuanMiLCJ3ZWJwYWNrOi8vY2FsY3VsYXRvci8uL3NyYy9qcy9jYWxjdWxhdG9yLW1vZHVsZS9vcGVyYXRpb24tY2xhc3Mvb3BlcmF0aW9uLmpzIiwid2VicGFjazovL2NhbGN1bGF0b3IvLi9zcmMvanMvY2FsY3VsYXRvci1tb2R1bGUvc29sdmUtaW5maXgtZnVuY3Rpb24vc29sdmUtcG9zdGZpeC1mdW5jdGlvbi9oYW5kbGUtb3BlcmF0b3ItZnVuY3Rpb24vaGFuZGxlT3BlcmF0b3IuanMiLCJ3ZWJwYWNrOi8vY2FsY3VsYXRvci8uL3NyYy9qcy9jYWxjdWxhdG9yLW1vZHVsZS9zb2x2ZS1pbmZpeC1mdW5jdGlvbi9zb2x2ZS1wb3N0Zml4LWZ1bmN0aW9uL3NvbHZlUG9zdGZpeC5qcyIsIndlYnBhY2s6Ly9jYWxjdWxhdG9yLy4vc3JjL2pzL2NhbGN1bGF0b3ItbW9kdWxlL3NvbHZlLWluZml4LWZ1bmN0aW9uL3NvbHZlSW5maXguanMiLCJ3ZWJwYWNrOi8vY2FsY3VsYXRvci8uL3NyYy9qcy9jYWxjdWxhdG9yLW1vZHVsZS9zb2x2ZS1pbmZpeC1mdW5jdGlvbi90by1wb3N0Zml4LWZ1bmN0aW9uL29wZXJhdG9yLXByZWNlZGVuY2UtZnVuY3Rpb24vZ2V0T3BlcmF0b3JQcmVjZWRlbmNlLmpzIiwid2VicGFjazovL2NhbGN1bGF0b3IvLi9zcmMvanMvY2FsY3VsYXRvci1tb2R1bGUvc29sdmUtaW5maXgtZnVuY3Rpb24vdG8tcG9zdGZpeC1mdW5jdGlvbi90b1Bvc3RmaXguanMiLCJ3ZWJwYWNrOi8vY2FsY3VsYXRvci8uL3NyYy9qcy9pbnRlcmZhY2UtbW9kdWxlL2ludGVyZmFjZS5qcyIsIndlYnBhY2s6Ly9jYWxjdWxhdG9yLy4vc3JjL2pzL3B1Yi1zdWItbW9kdWxlL1B1YlN1Yi5qcyIsIndlYnBhY2s6Ly9jYWxjdWxhdG9yL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2NhbGN1bGF0b3Ivd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2NhbGN1bGF0b3Ivd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9jYWxjdWxhdG9yL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vY2FsY3VsYXRvci8uL3NyYy9qcy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT3BlcmF0aW9uIGZyb20gJy4vb3BlcmF0aW9uLWNsYXNzL29wZXJhdGlvbic7XG5pbXBvcnQgUHViU3ViIGZyb20gJy4uL3B1Yi1zdWItbW9kdWxlL1B1YlN1Yic7XG5pbXBvcnQgc29sdmVJbmZpeCBmcm9tICcuL3NvbHZlLWluZml4LWZ1bmN0aW9uL3NvbHZlSW5maXgnO1xuXG5jb25zdCBjYWxjdWxhdG9yID0ge1xuICBvcGVyYXRpb25zOiBbXSxcbiAga2V5c1B1YlN1YjogbmV3IFB1YlN1YigpLFxuICBpbnB1dHNQdWJTdWI6IG5ldyBQdWJTdWIoKSxcbiAgYWxlcnRNb2RhbFB1YlN1YjogbmV3IFB1YlN1YigpLFxuICBcbiAgLy8gZ2V0cyBjdXJyZW50IG9wZXJhdGlvblxuICBnZXRDdXJyZW50T3BlcmF0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm9wZXJhdGlvbnNbdGhpcy5vcGVyYXRpb25zLmxlbmd0aCAtIDFdO1xuICB9LFxuXG4gIC8vIHJldHVybnMgdGhlIG9wZXJhdGlvbiwgcHJlcHBlZCBhbmQgcmVzdWx0IHZhbHVlc1xuICBnZXRDdXJyZW50T3BlcmF0aW9uVmFsdWVzKCkge1xuICAgIGNvbnN0IHZhbHVlU3RyaW5ncyA9IHRoaXMuZ2V0Q3VycmVudE9wZXJhdGlvbigpLmdldFZhbHVlU3RyaW5ncygpO1xuICAgIGNvbnN0IHsgY3VycmVudFZhbHVlLCBwcmVwcGVkVmFsdWUgfSA9IHZhbHVlU3RyaW5ncztcbiAgICByZXR1cm4ge1xuICAgICAgb3BlcmF0aW9uVmFsdWU6IGN1cnJlbnRWYWx1ZSxcbiAgICAgIHByZXBwZWRWYWx1ZTogcHJlcHBlZFZhbHVlICxcbiAgICAgIHJlc3VsdFZhbHVlOiBwcmVwcGVkVmFsdWUgPyBzb2x2ZUluZml4KHByZXBwZWRWYWx1ZSkgOiBcIiBcIixcbiAgICB9O1xuICB9LFxuXG4gIC8vIHVwZGF0ZXMgdGhlIHZhbHVlcyBvZiB0aGUgb3BlcmF0aW9uLCByZXN1bHQsIGFuZCBoaXN0b3J5IGlucHV0c1xuICB1cGRhdGVJbnB1dHNWYWx1ZXMoKSB7XG4gICAgbGV0IGhpc3RvcnlWYWx1ZXMgPSBbXTtcbiAgICBpZiAodGhpcy5vcGVyYXRpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAgIGhpc3RvcnlWYWx1ZXMgPSB0aGlzLm9wZXJhdGlvbnNcbiAgICAgICAgLmZpbHRlcigob3BlcmF0aW9uKSA9PiBvcGVyYXRpb24uY29tcGxldGVFcXVhdGlvbilcbiAgICAgICAgLm1hcCgob3BlcmF0aW9uKSA9PiBvcGVyYXRpb24uY29tcGxldGVFcXVhdGlvbik7XG4gICAgfVxuICAgIHRoaXMuaW5wdXRzUHViU3ViLnB1Ymxpc2goe1xuICAgICAgLi4udGhpcy5nZXRDdXJyZW50T3BlcmF0aW9uVmFsdWVzKCksXG4gICAgICBoaXN0b3J5VmFsdWU6IGhpc3RvcnlWYWx1ZXMsXG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gcHVibGlzaGVzIHRoZSBuZXcgb3BlcmF0aW9uIHRoYXQga2V5cyBoYXZlIHRvIHN1YnNjcmliZSB0b1xuICB1cGRhdGVLZXlTdWJzY3JpcHRpb25zKCkge1xuICAgIHRoaXMua2V5c1B1YlN1Yi5wdWJsaXNoKHRoaXMuZ2V0Q3VycmVudE9wZXJhdGlvbigpKTtcbiAgfSxcblxuICBwdWJsaXNoQWxlcnQoYWxlcnRUeHQpIHtcbiAgICB0aGlzLmFsZXJ0TW9kYWxQdWJTdWIucHVibGlzaChhbGVydFR4dCk7XG4gIH0sXG5cbiAgLy8gc3Vic2NyaWJlcyB0byB0aGUgcHViU3ViIHByb3BlcnR5IG9mIHRoZSBjdXJyZW50IG9wZXJhdGlvblxuICBzdWJzY3JpYmVUb0N1cnJlbnQoKSB7XG4gICAgdGhpcy5nZXRDdXJyZW50T3BlcmF0aW9uKCkucHViU3ViLnN1YnNjcmliZShcbiAgICAgIHRoaXMudXBkYXRlSW5wdXRzVmFsdWVzLmJpbmQoY2FsY3VsYXRvcilcbiAgICApO1xuICAgIHRoaXMuZ2V0Q3VycmVudE9wZXJhdGlvbigpLmFsZXJ0UHViU3ViLnN1YnNjcmliZShcbiAgICAgIHRoaXMucHVibGlzaEFsZXJ0LmJpbmQoY2FsY3VsYXRvcilcbiAgICApXG4gIH0sXG5cbiAgLy8gdHVybnMgcHJldmlvdXMgb3BlcmF0aW9uIGludG8gYW4gb2JqZWN0IHdpdGggY29tcGxldGVFcXVhdGlvbiBtZXRob2QuXG4gIHJldGlyZUN1cnJlbnRPcGVyYXRpb24oKSB7XG4gICAgY29uc3QgY3VycmVudE9wZXJhdGlvblZhbHVlcyA9IHRoaXMuZ2V0Q3VycmVudE9wZXJhdGlvblZhbHVlcygpO1xuICAgIGlmIChcbiAgICAgIHRoaXMub3BlcmF0aW9ucy5sZW5ndGggPiAwXG4gICAgICAmJiBjdXJyZW50T3BlcmF0aW9uVmFsdWVzLnJlc3VsdFZhbHVlICE9PSAnICdcbiAgICApIHtcbiAgICAgIGNvbnN0IGxhc3RPcGVyYXRpb25JbmRleCA9IHRoaXMub3BlcmF0aW9ucy5sZW5ndGggLSAxO1xuICAgICAgdGhpcy5vcGVyYXRpb25zW2xhc3RPcGVyYXRpb25JbmRleF0gPSB7XG4gICAgICAgIGNvbXBsZXRlRXF1YXRpb246IGAke2N1cnJlbnRPcGVyYXRpb25WYWx1ZXMucHJlcHBlZFZhbHVlfSA9ICR7Y3VycmVudE9wZXJhdGlvblZhbHVlcy5yZXN1bHRWYWx1ZX1gLFxuICAgICAgfTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gY3JlYXRlcyBhIG5ldyBvcGVyYXRpb25cbiAgbmV3T3BlcmF0aW9uKCkge1xuICAgIGlmICh0aGlzLm9wZXJhdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLm9wZXJhdGlvbnMgPSBbbmV3IE9wZXJhdGlvbigpXTtcbiAgICB9XG4gICAgdGhpcy5yZXRpcmVDdXJyZW50T3BlcmF0aW9uKCk7XG4gICAgdGhpcy5vcGVyYXRpb25zID0gWy4uLnRoaXMub3BlcmF0aW9ucywgbmV3IE9wZXJhdGlvbigpXTtcbiAgICB0aGlzLnVwZGF0ZUtleVN1YnNjcmlwdGlvbnMoKTtcbiAgICB0aGlzLnN1YnNjcmliZVRvQ3VycmVudCgpO1xuICAgIHRoaXMudXBkYXRlSW5wdXRzVmFsdWVzKCk7XG4gIH0sXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjYWxjdWxhdG9yO1xuIiwiaW1wb3J0IFB1YlN1YiBmcm9tICcuLi8uLi9wdWItc3ViLW1vZHVsZS9QdWJTdWInO1xuXG4vLyBjb250YWlucyB0aGUgbWF0aGVtYXRpY2FsIG9wZXJhdGlvbiwgcHJldmlvdXMgb3BlcmF0aW9ucywgbWV0aG9kcywgYW5kIHB1YlN1YnNcblxuY2xhc3MgT3BlcmF0aW9uIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy52YWx1ZUFyciA9IFtdO1xuICAgIHRoaXMucHViU3ViID0gbmV3IFB1YlN1YigpO1xuICAgIHRoaXMuYWxlcnRQdWJTdWIgPSBuZXcgUHViU3ViKCk7XG4gIH1cblxuICBzdGF0aWMgbGFzdFZhbHVlSXNUeXBlKHR5cGUsIGFycikge1xuICAgIGlmIChhcnIubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGxhc3RWYWx1ZSA9IGFyclthcnIubGVuZ3RoIC0gMV07XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdvcGVyYW5kJzoge1xuICAgICAgICByZXR1cm4gIU51bWJlci5pc05hTihOdW1iZXIobGFzdFZhbHVlKSk7XG4gICAgICB9XG4gICAgICBjYXNlICdvcGVyYXRvcic6IHtcbiAgICAgICAgY29uc3QgdmFsaWRPcGVyYXRvcnMgPSBbJysnLCAnLScsICcqJywgJy8nLCAnXiddO1xuICAgICAgICByZXR1cm4gdmFsaWRPcGVyYXRvcnMuaW5jbHVkZXMobGFzdFZhbHVlKTtcbiAgICAgIH1cbiAgICAgIGNhc2UgJ3N0YXJ0LXBhcmVudGhlc2lzJzoge1xuICAgICAgICByZXR1cm4gbGFzdFZhbHVlID09PSAnKCc7XG4gICAgICB9XG4gICAgICBjYXNlICdlbmQtcGFyZW50aGVzaXMnOiB7XG4gICAgICAgIHJldHVybiBsYXN0VmFsdWUgPT09ICcpJztcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnaW52YWxpZCB0eXBlJztcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgYWRkTWlzc2luZ1BhcmVudGhlc2lzRW5kKGFycikge1xuICAgIGNvbnN0IHBhcmVudGhlc2lzU3RhcnQgPSBhcnIuZmlsdGVyKChzZWN0aW9uKSA9PiBzZWN0aW9uID09PSAnKCcpO1xuICAgIGNvbnN0IHBhcmVudGhlc2lzRW5kID0gYXJyLmZpbHRlcigoc2VjdGlvbikgPT4gc2VjdGlvbiA9PT0gJyknKTtcbiAgICBpZiAocGFyZW50aGVzaXNTdGFydC5sZW5ndGggIT09IHBhcmVudGhlc2lzRW5kLmxlbmd0aCkge1xuICAgICAgd2hpbGUgKHBhcmVudGhlc2lzU3RhcnQubGVuZ3RoID4gcGFyZW50aGVzaXNFbmQubGVuZ3RoKSB7XG4gICAgICAgIGFyci5wdXNoKCcpJyk7XG4gICAgICAgIHBhcmVudGhlc2lzRW5kLnB1c2goJyknKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycjtcbiAgfVxuXG4gIHN0YXRpYyBwcmVwSW5jb21wbGV0ZVZhbHVlQXJyKGFycikge1xuICAgIHdoaWxlIChPcGVyYXRpb24ubGFzdFZhbHVlSXNUeXBlKCdvcGVyYXRvcicsIGFycikgfHwgT3BlcmF0aW9uLmxhc3RWYWx1ZUlzVHlwZSgnc3RhcnQtcGFyZW50aGVzaXMnLCBhcnIpKSB7XG4gICAgICBhcnIucG9wKCk7XG4gICAgfVxuICAgIHJldHVybiBPcGVyYXRpb24uYWRkTWlzc2luZ1BhcmVudGhlc2lzRW5kKGFycik7XG4gIH1cblxuICBwdWJsaXNoQ2hhbmdlKCkge1xuICAgIHRoaXMucHViU3ViLnB1Ymxpc2goKTtcbiAgfVxuXG4gIHB1Ymxpc2hBbGVydChhbGVydFR4dCkge1xuICAgIHRoaXMuYWxlcnRQdWJTdWIucHVibGlzaChhbGVydFR4dCk7XG4gIH1cblxuICBnZXRWYWx1ZVN0cmluZ3MoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGN1cnJlbnRWYWx1ZTogdGhpcy52YWx1ZUFyci5qb2luKCcgJyksXG4gICAgICBwcmVwcGVkVmFsdWU6IE9wZXJhdGlvbi5wcmVwSW5jb21wbGV0ZVZhbHVlQXJyKHRoaXMudmFsdWVBcnIuc2xpY2UoKSkuam9pbignICcpLFxuICAgIH07XG4gIH1cblxuICBhZGRPcGVyYW5kKG9wZXJhbmQpIHtcbiAgICBpZiAoT3BlcmF0aW9uLmxhc3RWYWx1ZUlzVHlwZSgnZW5kLXBhcmVudGhlc2lzJywgdGhpcy52YWx1ZUFycikpIHtcbiAgICAgIHRoaXMucHVibGlzaEFsZXJ0KCdQbGVhc2UgYWRkIGFuIG9wZXJhdG9yIScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoT3BlcmF0aW9uLmxhc3RWYWx1ZUlzVHlwZSgnb3BlcmFuZCcsIHRoaXMudmFsdWVBcnIpKSB7XG4gICAgICB0aGlzLnZhbHVlQXJyW3RoaXMudmFsdWVBcnIubGVuZ3RoIC0gMV0gKz0gb3BlcmFuZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy52YWx1ZUFyci5wdXNoKG9wZXJhbmQpO1xuICAgIH1cbiAgICB0aGlzLnB1Ymxpc2hDaGFuZ2UoKTtcbiAgfVxuXG4gIGFkZE9wZXJhdG9yKG9wZXJhdG9yKSB7XG4gICAgaWYgKE9wZXJhdGlvbi5sYXN0VmFsdWVJc1R5cGUoJ29wZXJhdG9yJywgdGhpcy52YWx1ZUFycikpIHtcbiAgICAgIHRoaXMudmFsdWVBcnIucG9wKCk7XG4gICAgfSBlbHNlIGlmIChPcGVyYXRpb24ubGFzdFZhbHVlSXNUeXBlKCdzdGFydC1wYXJlbnRoZXNpcycsIHRoaXMudmFsdWVBcnIpIHx8IHRoaXMudmFsdWVBcnIubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLnB1Ymxpc2hBbGVydCgnUGxlYXNlIGFkZCBhbiBvcGVyYW5kIGZpcnN0IScpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnZhbHVlQXJyLnB1c2gob3BlcmF0b3IpO1xuICAgICAgdGhpcy5wdWJsaXNoQ2hhbmdlKCk7XG4gICAgfVxuICB9XG5cbiAgYWRkRGVjaW1hbCgpIHtcbiAgICBpZiAoT3BlcmF0aW9uLmxhc3RWYWx1ZUlzVHlwZSgnb3BlcmF0b3InLCB0aGlzLnZhbHVlQXJyKSB8fCB0aGlzLnZhbHVlQXJyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy52YWx1ZUFyci5wdXNoKCcwLicpO1xuICAgIH0gZWxzZSBpZiAodGhpcy52YWx1ZUFyclt0aGlzLnZhbHVlQXJyLmxlbmd0aCAtIDFdLmluY2x1ZGVzKCcuJykpIHtcbiAgICAgIHRoaXMucHVibGlzaEFsZXJ0KCdPbmx5IDEgZGVjaW1hbCBpcyBhbGxvd2VkIScpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoT3BlcmF0aW9uLmxhc3RWYWx1ZUlzVHlwZSgnZW5kLXBhcmVudGhlc2lzJywgdGhpcy52YWx1ZUFycikpIHtcbiAgICAgIHRoaXMucHVibGlzaEFsZXJ0KCdQbGVhc2UgYWRkIGFuIG9wZXJhdG9yIGZpcnN0IScpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnZhbHVlQXJyW3RoaXMudmFsdWVBcnIubGVuZ3RoIC0gMV0gKz0gJy4nO1xuICAgIH1cbiAgICB0aGlzLnB1Ymxpc2hDaGFuZ2UoKTtcbiAgfVxuXG4gIGFkZFBhcmVudGhlc2lzU3RhcnQoKSB7XG4gICAgaWYgKHRoaXMudmFsdWVBcnIubGVuZ3RoID09PSAwIHx8IE9wZXJhdGlvbi5sYXN0VmFsdWVJc1R5cGUoJ29wZXJhdG9yJywgdGhpcy52YWx1ZUFycikgfHwgT3BlcmF0aW9uLmxhc3RWYWx1ZUlzVHlwZSgnc3RhcnQtcGFyZW50aGVzaXMnLCB0aGlzLnZhbHVlQXJyKSkge1xuICAgICAgdGhpcy52YWx1ZUFyci5wdXNoKCcoJyk7XG4gICAgICB0aGlzLnB1Ymxpc2hDaGFuZ2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wdWJsaXNoQWxlcnQoJ1BhcmVudGhlc2lzIHJlcXVpcmUgYW4gb3BlcmF0b3IhJyk7XG4gICAgfVxuICB9XG5cbiAgYWRkUGFyZW50aGVzaXNFbmQoKSB7XG4gICAgY29uc3QgcGFyZW50aGVzaXNTdGFydCA9IHRoaXMudmFsdWVBcnIuZmlsdGVyKChzZWN0aW9uKSA9PiBzZWN0aW9uID09PSAnKCcpO1xuICAgIGNvbnN0IHBhcmVudGhlc2lzRW5kID0gdGhpcy52YWx1ZUFyci5maWx0ZXIoKHNlY3Rpb24pID0+IHNlY3Rpb24gPT09ICcpJyk7XG4gICAgaWYgKHBhcmVudGhlc2lzU3RhcnQubGVuZ3RoID4gcGFyZW50aGVzaXNFbmQubGVuZ3RoKSB7XG4gICAgICB0aGlzLnZhbHVlQXJyLnB1c2goJyknKTtcbiAgICAgIHRoaXMucHVibGlzaENoYW5nZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnB1Ymxpc2hBbGVydCgnU3RhcnQgcGFyZW50aGVzaXMgaXMgbWlzc2luZyEnKTtcbiAgICB9XG4gIH1cblxuICBkbHRWYWx1ZSgpIHtcbiAgICBpZiAodGhpcy52YWx1ZUFyci5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbGFzdFZhbHVlID0gdGhpcy52YWx1ZUFyclt0aGlzLnZhbHVlQXJyLmxlbmd0aCAtIDFdO1xuICAgIGlmICghT3BlcmF0aW9uLmxhc3RWYWx1ZUlzVHlwZSgnb3BlcmFuZCcsIHRoaXMudmFsdWVBcnIpKSB7XG4gICAgICB0aGlzLnZhbHVlQXJyLnBvcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBtb2RpZmllZExhc3RWYWx1ZSA9IGxhc3RWYWx1ZS5zbGljZSgwLCAtMSk7XG4gICAgICBpZiAobW9kaWZpZWRMYXN0VmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLnZhbHVlQXJyW3RoaXMudmFsdWVBcnIubGVuZ3RoIC0gMV0gPSBtb2RpZmllZExhc3RWYWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudmFsdWVBcnIucG9wKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucHVibGlzaENoYW5nZSgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE9wZXJhdGlvbjtcbiIsImZ1bmN0aW9uIGhhbmRsZU9wZXJhdG9yKG9wZXJhdG9yLCBzdGFjaykge1xuICBjb25zdCBvcGVyYW5kMSA9IHN0YWNrLnBvcCgpO1xuICBjb25zdCBvcGVyYW5kMiA9IHN0YWNrLnBvcCgpO1xuICBzd2l0Y2ggKG9wZXJhdG9yKSB7XG4gICAgY2FzZSAnKyc6XG4gICAgICByZXR1cm4gc3RhY2sucHVzaChvcGVyYW5kMiArIG9wZXJhbmQxKTtcbiAgICBjYXNlICctJzpcbiAgICAgIHJldHVybiBzdGFjay5wdXNoKG9wZXJhbmQyIC0gb3BlcmFuZDEpO1xuICAgIGNhc2UgJy8nOlxuICAgICAgcmV0dXJuIHN0YWNrLnB1c2gob3BlcmFuZDIgLyBvcGVyYW5kMSk7XG4gICAgY2FzZSAnKic6XG4gICAgICByZXR1cm4gc3RhY2sucHVzaChvcGVyYW5kMiAqIG9wZXJhbmQxKTtcbiAgICBjYXNlICdeJzpcbiAgICAgIHJldHVybiBzdGFjay5wdXNoKG9wZXJhbmQyICoqIG9wZXJhbmQxKTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgRXJyb3IoJ3Vua25vd24gb3BlcmF0b3InKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBoYW5kbGVPcGVyYXRvcjtcbiIsImltcG9ydCBoYW5kbGVPcGVyYXRvciBmcm9tICcuL2hhbmRsZS1vcGVyYXRvci1mdW5jdGlvbi9oYW5kbGVPcGVyYXRvcic7XG5cbmZ1bmN0aW9uIHNvbHZlUG9zdGZpeChzdHIpIHtcbiAgY29uc3Qgc3RhY2sgPSBbXTtcbiAgY29uc3Qgc3RyQXJyID0gc3RyLnNwbGl0KCcgJyk7XG4gIGNvbnN0IGlzT3BlcmFuZCA9IChjaGFyKSA9PiAhTnVtYmVyLmlzTmFOKE51bWJlcihjaGFyKSk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyQXJyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgY29uc3QgY3VycmVudENoYXIgPSBzdHJBcnJbaV07XG4gICAgaWYgKGlzT3BlcmFuZChjdXJyZW50Q2hhcikpIHtcbiAgICAgIHN0YWNrLnB1c2goK2N1cnJlbnRDaGFyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGFuZGxlT3BlcmF0b3IoY3VycmVudENoYXIsIHN0YWNrKTtcbiAgICB9XG4gIH0gcmV0dXJuIHN0YWNrLnBvcCgpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBzb2x2ZVBvc3RmaXg7XG4iLCJpbXBvcnQgdG9Qb3N0Zml4IGZyb20gJy4vdG8tcG9zdGZpeC1mdW5jdGlvbi90b1Bvc3RmaXgnO1xuaW1wb3J0IHNvbHZlUG9zdGZpeCBmcm9tICcuL3NvbHZlLXBvc3RmaXgtZnVuY3Rpb24vc29sdmVQb3N0Zml4JztcblxuZnVuY3Rpb24gc29sdmVJbmZpeChzdHJpbmcpIHsgLy8gYWNjZXB0cyBzcGFjZSBzZXBhcmF0ZWQgaW5maXggc3RyaW5nc1xuICBjb25zdCBwb3N0Rml4ID0gdG9Qb3N0Zml4KHN0cmluZyk7XG4gIHJldHVybiBzb2x2ZVBvc3RmaXgocG9zdEZpeCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHNvbHZlSW5maXg7XG4iLCIvLyBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHByZWNlZGVuY2Ugb2Ygb3BlcmF0b3JzXG5cbmZ1bmN0aW9uIGdldE9wZXJhdG9yUHJlY2VkZW5jZShvcCkge1xuICBzd2l0Y2ggKG9wKSB7XG4gICAgY2FzZSAnXic6XG4gICAgICByZXR1cm4gMztcbiAgICBjYXNlICcvJzpcbiAgICBjYXNlICcqJzpcbiAgICAgIHJldHVybiAyO1xuICAgIGNhc2UgJysnOlxuICAgIGNhc2UgJy0nOlxuICAgICAgcmV0dXJuIDE7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAtMTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBnZXRPcGVyYXRvclByZWNlZGVuY2U7XG4iLCJpbXBvcnQgZ2V0UHJlYyBmcm9tICcuL29wZXJhdG9yLXByZWNlZGVuY2UtZnVuY3Rpb24vZ2V0T3BlcmF0b3JQcmVjZWRlbmNlJzsgLy8gZ2V0T3BlcmF0b3JQcmVjZWRlbmNlXG5cbmZ1bmN0aW9uIHRvUG9zdGZpeChzdHIpIHtcbiAgY29uc3Qgc3RhY2sgPSBbXTsgLy8gc3RhY2sgZm9yIG9wZXJhdG9yc1xuICBjb25zdCByZXN1bHQgPSBbXTsgLy8gZmluYWwgcmVzdWx0IHN0cmluZ1xuICBjb25zdCBpc09wZXJhbmQgPSAoY2hhcikgPT4gIU51bWJlci5pc05hTihOdW1iZXIoY2hhcikpOyAvLyBjaGVja3MgaWYgY2hhciBpcyBhIG51bWJlclxuICBjb25zdCBoYW5kbGVPcGVuaW5nUGFyZW50aGVzaXMgPSAoY2hhcikgPT4gc3RhY2sucHVzaChjaGFyKTtcbiAgY29uc3QgaGFuZGxlQ2xvc2luZ1BhcmVudGhlc2lzID0gKCkgPT4ge1xuICAgIHdoaWxlIChzdGFjay5sZW5ndGggIT09IDAgJiYgc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0gIT09ICcoJykge1xuICAgICAgcmVzdWx0LnB1c2goc3RhY2sucG9wKCkpO1xuICAgIH1cbiAgICBzdGFjay5wb3AoKTsgLy8gcmVtb3ZlIHRoZSBvcGVuaW5nIHBhcmVudGhlc2lzXG4gIH07XG5cbiAgY29uc3QgaGFuZGxlT3BlcmF0b3IgPSAoY2hhcikgPT4ge1xuICAgIHdoaWxlIChzdGFjay5sZW5ndGggIT09IDAgJiYgZ2V0UHJlYyhjaGFyKSA8PSBnZXRQcmVjKHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdKSkge1xuICAgICAgcmVzdWx0LnB1c2goc3RhY2sucG9wKCkpO1xuICAgICAgLy8gcG9wIHN0YWNrIHRvIHJlc3VsdCB1bnRpbCB0aGUgdG9wIG9wZXJhdG9yIGhhcyBsZXNzIHByZWNlZGVuY2Ugb3IgdGhlIHN0YWNrIGlzIGVtcHR5XG4gICAgfVxuICAgIHN0YWNrLnB1c2goY2hhcik7XG4gICAgLy8gcHVzaCBvcGVyYXRvciB0byBzdGFja1xuICB9O1xuICBjb25zdCBzcGxpdFN0ciA9IHN0ci50cmltKCkuc3BsaXQoJyAnKS5maWx0ZXIoKGNoYXIpID0+IGNoYXIgIT09ICcgJyk7XG4gIHNwbGl0U3RyLmZvckVhY2goKGN1cnJlbnRDaGFyKSA9PiB7XG4gICAgaWYgKGlzT3BlcmFuZChjdXJyZW50Q2hhcikpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGN1cnJlbnRDaGFyKTtcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnRDaGFyID09PSAnKCcpIHtcbiAgICAgIGhhbmRsZU9wZW5pbmdQYXJlbnRoZXNpcyhjdXJyZW50Q2hhcik7XG4gICAgfSBlbHNlIGlmIChjdXJyZW50Q2hhciA9PT0gJyknKSB7XG4gICAgICBoYW5kbGVDbG9zaW5nUGFyZW50aGVzaXMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGFuZGxlT3BlcmF0b3IoY3VycmVudENoYXIpO1xuICAgIH1cbiAgfSk7XG4gIHdoaWxlIChzdGFjay5sZW5ndGggIT09IDApIHsgLy8gcG9wIHRoZSByZW1haW5pbmcgdG8gdGhlIHJlc3VsdFxuICAgIHJlc3VsdC5wdXNoKHN0YWNrLnBvcCgpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0LmpvaW4oJyAnKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdG9Qb3N0Zml4O1xuIiwiaW1wb3J0IFB1YlN1YiBmcm9tICcuLi9wdWItc3ViLW1vZHVsZS9QdWJTdWInO1xuaW1wb3J0IGNhbGN1bGF0b3IgZnJvbSAnLi4vY2FsY3VsYXRvci1tb2R1bGUvY2FsY3VsYXRvcic7XG5cbi8vIGRpc3BsYXlzIHRoZSB2YWx1ZXMgb2YgaW5wdXRzXG5jb25zdCBpbnB1dE9wZXJhdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kaXNwbGF5X19pbnB1dC0tb3BlcmF0aW9uJyk7XG5jb25zdCBpbnB1dEhpc3RvcnkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZGlzcGxheV9faW5wdXQtLWhpc3RvcnknKTtcbmNvbnN0IGlucHV0UmVzdWx0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRpc3BsYXlfX2lucHV0LS1yZXN1bHQnKTtcblxuZnVuY3Rpb24gc2Nyb2xsVG9OZXdlc3QoKSB7XG4gIFtpbnB1dE9wZXJhdGlvbiwgaW5wdXRIaXN0b3J5LCBpbnB1dFJlc3VsdF0uZm9yRWFjaCgoaW5wdXQpID0+IHtcbiAgICBpbnB1dC5zY3JvbGxUb3AgPSBpbnB1dC5zY3JvbGxIZWlnaHQ7XG4gIH0pXG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlJbnB1dFZhbHVlcyhvYmopIHtcbiAgaW5wdXRPcGVyYXRpb24udGV4dENvbnRlbnQgPSBvYmoub3BlcmF0aW9uVmFsdWU7XG4gIGlucHV0SGlzdG9yeS50ZXh0Q29udGVudCA9IG9iai5oaXN0b3J5VmFsdWUuam9pbignXFxuJyk7XG4gIGlucHV0UmVzdWx0LnRleHRDb250ZW50ID0gKG9iai5yZXN1bHRWYWx1ZSA9PT0gXCIgXCIpID8gJyAnIDogYCA9ICR7b2JqLnJlc3VsdFZhbHVlfWA7XG59XG5cbmNhbGN1bGF0b3IuaW5wdXRzUHViU3ViLnN1YnNjcmliZShkaXNwbGF5SW5wdXRWYWx1ZXMpO1xuXG5jYWxjdWxhdG9yLmlucHV0c1B1YlN1Yi5zdWJzY3JpYmUoc2Nyb2xsVG9OZXdlc3QpO1xuXG4vLyBncm91cCBzdWJzY3JpYmUgZnVuY3Rpb25cbmNvbnN0IG9wZXJhbmRQdWJTdWIgPSBuZXcgUHViU3ViKCk7XG5jb25zdCBvcGVyYXRvclB1YlN1YiA9IG5ldyBQdWJTdWIoKTtcbmNvbnN0IGRlY2ltYWxQdWJTdWIgPSBuZXcgUHViU3ViKCk7XG5jb25zdCBkbHRQdWJTdWIgPSBuZXcgUHViU3ViKCk7XG5jb25zdCBwYXJlbnRoZXNpc1N0YXJ0UHViU3ViID0gbmV3IFB1YlN1YigpO1xuY29uc3QgcGFyZW50aGVzaXNFbmRQdWJTdWIgPSBuZXcgUHViU3ViKCk7XG5cbmZ1bmN0aW9uIHN1YnNjcmliZU5ld09wZXJhdGlvbihuZXdPcGVyYXRpb24pIHtcbiAgb3BlcmFuZFB1YlN1Yi5zdWJzY3JpYmUobmV3T3BlcmF0aW9uLmFkZE9wZXJhbmQuYmluZChuZXdPcGVyYXRpb24pKTtcbiAgb3BlcmF0b3JQdWJTdWIuc3Vic2NyaWJlKG5ld09wZXJhdGlvbi5hZGRPcGVyYXRvci5iaW5kKG5ld09wZXJhdGlvbikpO1xuICBkZWNpbWFsUHViU3ViLnN1YnNjcmliZShuZXdPcGVyYXRpb24uYWRkRGVjaW1hbC5iaW5kKG5ld09wZXJhdGlvbikpO1xuICBkbHRQdWJTdWIuc3Vic2NyaWJlKG5ld09wZXJhdGlvbi5kbHRWYWx1ZS5iaW5kKG5ld09wZXJhdGlvbikpO1xuICBwYXJlbnRoZXNpc1N0YXJ0UHViU3ViLnN1YnNjcmliZShcbiAgICBuZXdPcGVyYXRpb24uYWRkUGFyZW50aGVzaXNTdGFydC5iaW5kKG5ld09wZXJhdGlvbiksXG4gICk7XG4gIHBhcmVudGhlc2lzRW5kUHViU3ViLnN1YnNjcmliZShcbiAgICBuZXdPcGVyYXRpb24uYWRkUGFyZW50aGVzaXNFbmQuYmluZChuZXdPcGVyYXRpb24pLFxuICApO1xufVxuXG5jYWxjdWxhdG9yLmtleXNQdWJTdWIuc3Vic2NyaWJlKHN1YnNjcmliZU5ld09wZXJhdGlvbik7XG5cbi8vIHNvbHZlIGtleVxuY29uc3Qgc29sdmVQdWJTdWIgPSBuZXcgUHViU3ViKCk7XG5zb2x2ZVB1YlN1Yi5zdWJzY3JpYmUoY2FsY3VsYXRvci5uZXdPcGVyYXRpb24uYmluZChjYWxjdWxhdG9yKSk7XG5jb25zdCBzb2x2ZUtleSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYWxjdWxhdG9yX19rZXktLXNvbHZlJyk7XG5zb2x2ZUtleS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgc29sdmVQdWJTdWIucHVibGlzaCgpO1xufSk7XG4vLyBvcGVyYW5kIGtleXNcbmNvbnN0IG9wZXJhbmRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNhbGN1bGF0b3JfX2tleS0tb3BlcmFuZCcpO1xub3BlcmFuZHMuZm9yRWFjaCgob3BlcmFuZCkgPT4ge1xuICBvcGVyYW5kLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIG9wZXJhbmRQdWJTdWIucHVibGlzaChvcGVyYW5kLnZhbHVlKTtcbiAgfSk7XG59KTtcbi8vIG9wZXJhdG9yIGtleXNcbmNvbnN0IG9wZXJhdG9ycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jYWxjdWxhdG9yX19rZXktLW9wZXJhdG9yJyk7XG5vcGVyYXRvcnMuZm9yRWFjaCgob3BlcmF0b3IpID0+IHtcbiAgb3BlcmF0b3IuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgY29uc29sZS5sb2cob3BlcmF0b3IudmFsdWUpXG4gICAgaWYgKCFvcGVyYXRvci52YWx1ZSkge1xuICAgICAgY29uc29sZS5sb2cob3BlcmF0b3IuZGF0YXNldC52YWx1ZSlcbiAgICAgIG9wZXJhdG9yUHViU3ViLnB1Ymxpc2gob3BlcmF0b3IuZGF0YXNldC52YWx1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgb3BlcmF0b3JQdWJTdWIucHVibGlzaChvcGVyYXRvci52YWx1ZSk7XG4gICAgfVxuICAgXG4gIH0pO1xufSk7XG4vLyBkZWNpbWFsIGtleVxuY29uc3QgZGVjaW1hbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYWxjdWxhdG9yX19rZXktLWRlY2ltYWwnKTtcbmRlY2ltYWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gIGRlY2ltYWxQdWJTdWIucHVibGlzaCgpO1xufSk7XG4vLyBkZWxldGUga2V5XG5jb25zdCBkbHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2FsY3VsYXRvcl9fa2V5LS1kZWwnKTtcbmRsdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgZGx0UHViU3ViLnB1Ymxpc2goKTtcbn0pO1xuLy8gY2xlYXIga2V5XG5jb25zdCBjbGVhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYWxjdWxhdG9yX19rZXktLWNsZWFyJyk7XG5jbGVhci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xufSk7XG4vLyBwYXJlbnRoZXNpcyBzdGFydCBrZXlcbmNvbnN0IHBhcmVudGhlc2lzU3RhcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAnLmNhbGN1bGF0b3JfX2tleS0tcGFyZW50aGVzaXMtc3RhcnQnLFxuKTtcbnBhcmVudGhlc2lzU3RhcnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gIHBhcmVudGhlc2lzU3RhcnRQdWJTdWIucHVibGlzaCgpO1xufSk7XG4vLyBwYXJlbnRoZXNpcyBlbmQga2V5XG5jb25zdCBwYXJlbnRoZXNpc0VuZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICcuY2FsY3VsYXRvcl9fa2V5LS1wYXJlbnRoZXNpcy1lbmQnLFxuKTtcbnBhcmVudGhlc2lzRW5kLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICBwYXJlbnRoZXNpc0VuZFB1YlN1Yi5wdWJsaXNoKCk7XG59KTtcblxuLy8gYWxlcnQgbW9kYWxcbmNvbnN0IG1vZGFsSWNvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kaXNwbGF5X19hbGVydC1pY29uJyk7XG5jb25zdCBtb2RhbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kaXNwbGF5X19tb2RhbCcpO1xuY29uc3QgbW9kYWxDb250ZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1vZGFsLWNvbnRlbnQnKVxuY29uc3QgbW9kYWxUZXh0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5tb2RhbC1jb250ZW50X190ZXh0XCIpO1xuXG5cbmZ1bmN0aW9uIGRlbGF5KGR1cmF0aW9uKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgZHVyYXRpb24pKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2hvd1RyYW5zaXRpb25Nb2RhbCgpIHtcbiAgbW9kYWwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gIGF3YWl0IGRlbGF5KDApO1xuICBtb2RhbENvbnRlbnQuY2xhc3NMaXN0LmFkZCgndHJhbnNpdGlvbi1pbi0tbW9kYWwnKTtcbiAgYXdhaXQgZGVsYXkoMzAwKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2hvd01vZGFsKCkge1xuICAgYXdhaXQgc2hvd1RyYW5zaXRpb25Nb2RhbCgpXG4gICBtb2RhbFRleHQuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2hvd1RyYW5zaXRpb25JY29uKCkge1xuICBtb2RhbEljb24uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gIGF3YWl0IGRlbGF5KDApO1xuICBtb2RhbEljb24uY2xhc3NMaXN0LmFkZCgndHJhbnNpdGlvbi1pbi0tYWxlcnQtaWNvbicpO1xuICBhd2FpdCBkZWxheSg1MDApO1xufVxuXG5mdW5jdGlvbiBoaWRlTW9kYWwoKSB7XG4gIG1vZGFsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIG1vZGFsQ29udGVudC5jbGFzc0xpc3QucmVtb3ZlKCd0cmFuc2l0aW9uLWluLS1tb2RhbCcpO1xuICBtb2RhbFRleHQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xufSBcblxuLy8gZm9yIHBjXG5tb2RhbEljb24uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgc2hvd01vZGFsKTtcbm1vZGFsSWNvbi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIGhpZGVNb2RhbCk7XG5cbi8vIGZvciB0b3VjaHNjcmVlbnNcbm1vZGFsSWNvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNob3dNb2RhbCk7XG5tb2RhbEljb24uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBoaWRlTW9kYWwpO1xuXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVNb2RhbCh0ZXh0KSB7XG4gIGF3YWl0IHNob3dUcmFuc2l0aW9uSWNvbigpO1xuICBtb2RhbFRleHQudGV4dENvbnRlbnQgPSB0ZXh0O1xufVxuXG5mdW5jdGlvbiBoaWRlTW9kYWxJY29uKCkge1xuICBtb2RhbEljb24uY2xhc3NMaXN0LnJlbW92ZSgndHJhbnNpdGlvbi1pbi0tYWxlcnQtaWNvbicpO1xuICBtb2RhbEljb24uc2V0QXR0cmlidXRlKCdzdHlsZScsICdkaXNwbGF5OiBub25lJyk7XG4gIGhpZGVNb2RhbCgpO1xufVxuXG5jYWxjdWxhdG9yLmFsZXJ0TW9kYWxQdWJTdWIuc3Vic2NyaWJlKHVwZGF0ZU1vZGFsKTtcbmNhbGN1bGF0b3IuaW5wdXRzUHViU3ViLnN1YnNjcmliZShoaWRlTW9kYWxJY29uKTtcbiIsImNsYXNzIFB1YlN1YiB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3Vic2NyaWJlcnMgPSBbXTtcbiAgfVxuXG4gIHN1YnNjcmliZShzdWJzY3JpYmVyKSB7XG4gICAgaWYgKHR5cGVvZiBzdWJzY3JpYmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7dHlwZW9mIHN1YnNjcmliZXJ9IGlzIG5vdCBhIHZhbGlkIGFyZ3VtZW50LCBwcm92aWRlIGEgZnVuY3Rpb24gaW5zdGVhZGApO1xuICAgIH1cbiAgICB0aGlzLnN1YnNjcmliZXJzLnB1c2goc3Vic2NyaWJlcik7XG4gIH1cblxuICB1bnN1YnNjcmliZShzdWJzY3JpYmVyKSB7XG4gICAgaWYgKHR5cGVvZiBzdWJzY3JpYmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7dHlwZW9mIHN1YnNjcmliZXJ9IGlzIG5vdCBhIHZhbGlkIGFyZ3VtZW50LCBwcm92aWRlIGEgZnVuY3Rpb24gaW5zdGVhZGApO1xuICAgIH1cbiAgICB0aGlzLnN1YnNjcmliZXJzID0gdGhpcy5zdWJzY3JpYmVycy5maWx0ZXIoKHN1YikgPT4gc3ViICE9PSBzdWJzY3JpYmVyKTtcbiAgfVxuXG4gIHB1Ymxpc2gocGF5bG9hZCkge1xuICAgIHRoaXMuc3Vic2NyaWJlcnMuZm9yRWFjaCgoc3Vic2NyaWJlcikgPT4gc3Vic2NyaWJlcihwYXlsb2FkKSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUHViU3ViO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgJy4vaW50ZXJmYWNlLW1vZHVsZS9pbnRlcmZhY2UnO1xuaW1wb3J0IGNhbGN1bGF0b3IgZnJvbSAnLi9jYWxjdWxhdG9yLW1vZHVsZS9jYWxjdWxhdG9yJztcblxuY2FsY3VsYXRvci5uZXdPcGVyYXRpb24oKTsiXSwibmFtZXMiOlsiT3BlcmF0aW9uIiwiUHViU3ViIiwic29sdmVJbmZpeCIsImNhbGN1bGF0b3IiLCJvcGVyYXRpb25zIiwia2V5c1B1YlN1YiIsImlucHV0c1B1YlN1YiIsImFsZXJ0TW9kYWxQdWJTdWIiLCJnZXRDdXJyZW50T3BlcmF0aW9uIiwibGVuZ3RoIiwiZ2V0Q3VycmVudE9wZXJhdGlvblZhbHVlcyIsInZhbHVlU3RyaW5ncyIsImdldFZhbHVlU3RyaW5ncyIsImN1cnJlbnRWYWx1ZSIsInByZXBwZWRWYWx1ZSIsIm9wZXJhdGlvblZhbHVlIiwicmVzdWx0VmFsdWUiLCJ1cGRhdGVJbnB1dHNWYWx1ZXMiLCJoaXN0b3J5VmFsdWVzIiwiZmlsdGVyIiwib3BlcmF0aW9uIiwiY29tcGxldGVFcXVhdGlvbiIsIm1hcCIsInB1Ymxpc2giLCJoaXN0b3J5VmFsdWUiLCJ1cGRhdGVLZXlTdWJzY3JpcHRpb25zIiwicHVibGlzaEFsZXJ0IiwiYWxlcnRUeHQiLCJzdWJzY3JpYmVUb0N1cnJlbnQiLCJwdWJTdWIiLCJzdWJzY3JpYmUiLCJiaW5kIiwiYWxlcnRQdWJTdWIiLCJyZXRpcmVDdXJyZW50T3BlcmF0aW9uIiwiY3VycmVudE9wZXJhdGlvblZhbHVlcyIsImxhc3RPcGVyYXRpb25JbmRleCIsIm5ld09wZXJhdGlvbiIsImNvbnN0cnVjdG9yIiwidmFsdWVBcnIiLCJsYXN0VmFsdWVJc1R5cGUiLCJ0eXBlIiwiYXJyIiwibGFzdFZhbHVlIiwiTnVtYmVyIiwiaXNOYU4iLCJ2YWxpZE9wZXJhdG9ycyIsImluY2x1ZGVzIiwiYWRkTWlzc2luZ1BhcmVudGhlc2lzRW5kIiwicGFyZW50aGVzaXNTdGFydCIsInNlY3Rpb24iLCJwYXJlbnRoZXNpc0VuZCIsInB1c2giLCJwcmVwSW5jb21wbGV0ZVZhbHVlQXJyIiwicG9wIiwicHVibGlzaENoYW5nZSIsImpvaW4iLCJzbGljZSIsImFkZE9wZXJhbmQiLCJvcGVyYW5kIiwiYWRkT3BlcmF0b3IiLCJvcGVyYXRvciIsImFkZERlY2ltYWwiLCJhZGRQYXJlbnRoZXNpc1N0YXJ0IiwiYWRkUGFyZW50aGVzaXNFbmQiLCJkbHRWYWx1ZSIsIm1vZGlmaWVkTGFzdFZhbHVlIiwiaGFuZGxlT3BlcmF0b3IiLCJzdGFjayIsIm9wZXJhbmQxIiwib3BlcmFuZDIiLCJFcnJvciIsInNvbHZlUG9zdGZpeCIsInN0ciIsInN0ckFyciIsInNwbGl0IiwiaXNPcGVyYW5kIiwiY2hhciIsImkiLCJjdXJyZW50Q2hhciIsInRvUG9zdGZpeCIsInN0cmluZyIsInBvc3RGaXgiLCJnZXRPcGVyYXRvclByZWNlZGVuY2UiLCJvcCIsImdldFByZWMiLCJyZXN1bHQiLCJoYW5kbGVPcGVuaW5nUGFyZW50aGVzaXMiLCJoYW5kbGVDbG9zaW5nUGFyZW50aGVzaXMiLCJzcGxpdFN0ciIsInRyaW0iLCJmb3JFYWNoIiwiaW5wdXRPcGVyYXRpb24iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJpbnB1dEhpc3RvcnkiLCJpbnB1dFJlc3VsdCIsInNjcm9sbFRvTmV3ZXN0IiwiaW5wdXQiLCJzY3JvbGxUb3AiLCJzY3JvbGxIZWlnaHQiLCJkaXNwbGF5SW5wdXRWYWx1ZXMiLCJvYmoiLCJ0ZXh0Q29udGVudCIsIm9wZXJhbmRQdWJTdWIiLCJvcGVyYXRvclB1YlN1YiIsImRlY2ltYWxQdWJTdWIiLCJkbHRQdWJTdWIiLCJwYXJlbnRoZXNpc1N0YXJ0UHViU3ViIiwicGFyZW50aGVzaXNFbmRQdWJTdWIiLCJzdWJzY3JpYmVOZXdPcGVyYXRpb24iLCJzb2x2ZVB1YlN1YiIsInNvbHZlS2V5IiwiYWRkRXZlbnRMaXN0ZW5lciIsIm9wZXJhbmRzIiwicXVlcnlTZWxlY3RvckFsbCIsInZhbHVlIiwib3BlcmF0b3JzIiwiY29uc29sZSIsImxvZyIsImRhdGFzZXQiLCJkZWNpbWFsIiwiZGx0IiwiY2xlYXIiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInJlbG9hZCIsIm1vZGFsSWNvbiIsIm1vZGFsIiwibW9kYWxDb250ZW50IiwibW9kYWxUZXh0IiwiZGVsYXkiLCJkdXJhdGlvbiIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsInNob3dUcmFuc2l0aW9uTW9kYWwiLCJzdHlsZSIsImRpc3BsYXkiLCJjbGFzc0xpc3QiLCJhZGQiLCJzaG93TW9kYWwiLCJzaG93VHJhbnNpdGlvbkljb24iLCJoaWRlTW9kYWwiLCJyZW1vdmUiLCJ1cGRhdGVNb2RhbCIsInRleHQiLCJoaWRlTW9kYWxJY29uIiwic2V0QXR0cmlidXRlIiwic3Vic2NyaWJlcnMiLCJzdWJzY3JpYmVyIiwidW5zdWJzY3JpYmUiLCJzdWIiLCJwYXlsb2FkIl0sInNvdXJjZVJvb3QiOiIifQ==