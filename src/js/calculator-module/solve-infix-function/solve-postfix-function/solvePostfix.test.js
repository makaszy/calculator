import solvePostfix from './solvePostfix';

test('solvePostfix function', () => {
  expect(solvePostfix('2 3 + 5 -')).toBe(0);
  expect(solvePostfix('2 3 ^ 501 - 30 5 - 60 * 3 / +')).toBe(7);
  expect(solvePostfix('2000 501 - 30 5 - 60 * 3 / +')).toBe(1999);
});
