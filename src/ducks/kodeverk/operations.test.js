import * as Operations from './operations';

describe('Testing kodeverk/operations.js', () => {
  test('foo', () => {
    // Todo: Hvordan kan vi tesre at funksjonen heter "doThenDispatch"?
    expect(typeof Operations.hent()).toBe('function');
  });
});
