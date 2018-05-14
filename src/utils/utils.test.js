/* eslint-disable */
import { fn, isJSON } from './utils';

function foo () {
}

describe('Utils metoder', () => {
  test('Sjekker at fn tester at arg er en funksjon', () => {
    expect(fn(foo)).toBe(foo);
  });
  test('isJSON', () => {
    const str = '{}';
    expect(isJSON(str)).toEqual(true);
    expect(isJSON({})).toEqual(false);
  });
});
