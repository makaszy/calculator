import toPostfix from './toPostfix';

test('toPostFix: +', () => {
  expect(toPostfix('2+3')).toBe('23+');
  expect(toPostfix('232+34')).toBe('23234+');
});
test('toPostFix: -', () => {
  expect(toPostfix('2+3-5')).toBe('23+5-');
  expect(toPostfix('6-2+3-5')).toBe('62-3+5-');
});
test('toPostFix: ()', () => {
  expect(toPostfix('2+(3-5)')).toBe('235-+');
  expect(toPostfix('2000-501+(30-5)')).toBe('2000501-305-+');
});
test('toPostFix: () && ^ && * && /', () => {
  expect(toPostfix('2000-501+(30-5)*60/3')).toBe('2000501-305-60*3/+');
  expect(toPostfix('2^3-501+(30-5)*60/3')).toBe('23^501-305-60*3/+');
});
