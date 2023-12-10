import handleOperator from './handleOperator';

let stack;

beforeEach(() => {
  stack = [2, 3];
});

test('handleOperator function: +', () => {
  handleOperator('+', stack);
  expect(stack).toStrictEqual([5]);
});

test('handleOperator function: -', () => {
  expect(stack).toStrictEqual([2, 3]);
  handleOperator('-', stack);
  expect(stack).toStrictEqual([-1]);
});

test('handleOperator function: ^', () => {
  handleOperator('^', stack);
  expect(stack).toStrictEqual([8]);
});

test('handleOperator function: Error', () => {
  expect(() => handleOperator('&', stack)).toThrow('unknown operator');
});
