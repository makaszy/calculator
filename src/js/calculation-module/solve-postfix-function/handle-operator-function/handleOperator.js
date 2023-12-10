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

export default handleOperator;
