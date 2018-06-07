/* eslint-disable */
import * as Types from './types';

describe('test kodeverk/types.js', () => {
  describe('types.js', () => {
    test('OK', () => {
      expect(Types.OK).toEqual('kodeverk/OK');
    })

    test('PENDING', () => {
      expect(Types.PENDING).toEqual('kodeverk/PENDING');
    })

    test('FEILET', () => {
      expect(Types.FEILET).toEqual('kodeverk/FEILET');
    })
  })
})
