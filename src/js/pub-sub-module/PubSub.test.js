import PubSub from './PubSub';

let pubSub;

beforeEach(() => {
  pubSub = new PubSub();
});

test('pub sub subscribes only functions', () => {
  expect(() => pubSub.subscribe(23)).toThrow('number is not a valid argument, provide a function instead');
  expect(() => pubSub.subscribe('test')).toThrow('string is not a valid argument, provide a function instead');
});
