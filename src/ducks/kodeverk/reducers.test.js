import { STATUS } from '../../services/utils';
import Reducer from './reducers';
import * as Types from './types';

describe('Testing selectors.js', () => {
  test('reducer returnerer default state', () => {
    const expectedResult = {
      status: STATUS.NOT_STARTED,
      data: {},
    };

    expect(Reducer(undefined, {})).toEqual(expectedResult);
  });

  test('behandler PENDING', () => {
    const mockData = {
      type: Types.PENDING,
      data: {},
    };

    const innledendeState = {
      anyOtherKey: {
        bar: 'bar',
      },
    };

    const forventetData = {
      ...innledendeState,
      status: STATUS.PENDING,
    };

    expect(Reducer(innledendeState, mockData)).toEqual(forventetData);
  });

  test('behandler FEILET', () => {
    const mockData = {
      type: Types.FEILET,
      data: {},
    };

    const innledendeState = {
      anyOtherKey: {
        bar: 'bar',
      },
    };

    const forventetData = {
      ...innledendeState,
      status: STATUS.ERROR,
      data: {},
    };

    expect(Reducer(innledendeState, mockData)).toEqual(forventetData);
  });

  test('behandler OK', () => {
    const mockData = {
      type: Types.OK,
      data: {
        foo: 'foo',
      },
    };

    const innledendeState = {
      anyOtherKey: {
        bar: 'bar',
      },
    };

    const forventetData = {
      ...innledendeState,
      status: STATUS.OK,
      data: {
        foo: 'foo',
      },
    };

    expect(Reducer(innledendeState, mockData)).toEqual(forventetData);
  });
});
