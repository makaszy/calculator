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

export default getOperatorPrecedence;
