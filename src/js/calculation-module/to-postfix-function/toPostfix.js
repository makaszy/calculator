import getPrec from './operator-precedence-function/getOperatorPrecedence'; // getOperatorPrecedence

function toPostfix(str) {
  const stack = []; // stack for operators
  const result = []; // final result string
  const isOperand = (char) => !Number.isNaN(Number(char)); // checks if char is a number
  const handleOpeningParenthesis = (char) => stack.push(char);
  const handleClosingParenthesis = () => {
    while (stack.length !== 0 && stack[stack.length - 1] !== '(') {
      result.push(stack.pop());
    }
    stack.pop(); // remove the opening parenthesis
  };

  const handleOperator = (char) => {
    while (stack.length !== 0 && getPrec(char) <= getPrec(stack[stack.length - 1])) {
      result.push(stack.pop());
      // pop stack to result until the top operator has less precedence or the stack is empty
    }
    stack.push(char);
    // push operator to stack
  };
  const splitStr = str.trim().split(' ').filter((char) => char !== ' ');
  splitStr.forEach((currentChar) => {
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
  while (stack.length !== 0) { // pop the remaining to the result
    result.push(stack.pop());
  }
  return result.join(' ');
}

export default toPostfix;
