import getPrec from './operator-precedence-function/getOperatorPrecedence'; // getOperatorPrecedence

function toPostfix(str) {
  const stack = []; // stack for operators
  let result = ''; // final result string
  const isOperand = (char) => !Number.isNaN(Number(char)); // checks if char is a number
  const handleOpeningParenthesis = (char) => stack.push(char);
  const handleClosingParenthesis = () => {
    while (stack.length !== 0 && stack[stack.length - 1] !== '(') {
      result += stack.pop();
    }
    stack.pop(); // remove the opening parenthesis
  };

  const handleOperator = (char) => {
    while (stack.length !== 0 && getPrec(char) <= getPrec(stack[stack.length - 1])) {
      result += stack.pop();
      // pop stack to result until the top operator has less precedence or the stack is empty
    }
    stack.push(char);
    // push operator to stack
  };
  for (let i = 0; i < str.length; i += 1) { // iterate through the string
    const currentChar = str[i];
    if (isOperand(currentChar)) {
      result += currentChar;
    } else if (currentChar === '(') {
      handleOpeningParenthesis(currentChar);
    } else if (currentChar === ')') {
      handleClosingParenthesis();
    } else {
      handleOperator(currentChar);
    }
  }
  while (stack.length !== 0) { // pop the remaining to the result
    result += stack.pop();
  }
  return result;
}

export default toPostfix;
