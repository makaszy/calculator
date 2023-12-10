import handleOperator from './handle-operator-function/handleOperator';

function solvePostfix(str) {
  const stack = [];
  const strArr = str.split(' ');
  const isOperand = (char) => !Number.isNaN(Number(char));
  for (let i = 0; i < strArr.length; i += 1) {
    const currentChar = strArr[i];
    if (isOperand(currentChar)) {
      stack.push(+currentChar);
    } else {
      handleOperator(currentChar, stack);
    }
  } return stack.pop();
}

export default solvePostfix;
