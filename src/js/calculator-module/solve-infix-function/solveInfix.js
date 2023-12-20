import toPostfix from './to-postfix-function/toPostfix';
import solvePostfix from './solve-postfix-function/solvePostfix';

function solveInfix(string) { // accepts space separated infix strings
  const postFix = toPostfix(string);
  return solvePostfix(postFix);
}

export default solveInfix;
