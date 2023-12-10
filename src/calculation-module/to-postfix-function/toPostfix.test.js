import toPostfix from './toPostfix';

test('toPostFix: +', () => {
  expect(toPostfix('2 + 3')).toBe('2 3 +');
  expect(toPostfix('232 + 34')).toBe('232 34 +');
});

test('toPostFix: -', () => {
  expect(toPostfix('2 + 3 - 5')).toBe('2 3 + 5 -');
  expect(toPostfix('6 - 2 + 3 - 5')).toBe('6 2 - 3 + 5 -');
});

test('toPostFix: ()', () => {
  expect(toPostfix('2 + ( 3 - 5 )')).toBe('2 3 5 - +');
  expect(toPostfix('2000 - 501 + ( 30 - 5 )')).toBe('2000 501 - 30 5 - +');
});

test('toPostFix: () && ^ && * && /', () => {
  expect(toPostfix('2000 - 501 + ( 30 - 5 ) * 60 / 3')).toBe('2000 501 - 30 5 - 60 * 3 / +');
  expect(toPostfix('2 ^ 3 - 501 + ( 30 - 5 ) * 60 / 3')).toBe('2 3 ^ 501 - 30 5 - 60 * 3 / +');
});

test('toPostFix: number input', () => {
  expect(toPostfix('23')).toBe('23');
  expect(toPostfix('2')).toBe('2');
});
