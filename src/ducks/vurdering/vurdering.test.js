/* eslint-disable */
import * as Types from './types';

describe('test vurdering ducks', () => {
  describe('types.js', () => {
    test('OK', () => {
      expect(Types.OK).toEqual('vurdering/OK');
    })

    test('PENDING', () => {
      expect(Types.PENDING).toEqual('vurdering/PENDING');
    })

    test('FEILET', () => {
      expect(Types.FEILET).toEqual('vurdering/FEILET');
    })
  })
})
