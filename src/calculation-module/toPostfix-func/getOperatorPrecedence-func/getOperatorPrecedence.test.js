import getOperatorPrecedence from './getOperatorPrecedence';

test('Operator precedence: ^', () => {
  expect(getOperatorPrecedence('^')).toBe(3);
});

test('Operator precedence: / && *', () => {
  expect(getOperatorPrecedence('*')).toBe(2);
});

test('Operator precedence: + && -', () => {
  expect(getOperatorPrecedence('-')).toBe(1);
  expect(getOperatorPrecedence('+')).toBe(1);
});

test('Operator precedence: default', () => {
  expect(getOperatorPrecedence('A')).toBe(-1);
});
