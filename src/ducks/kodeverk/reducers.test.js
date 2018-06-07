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

    const forventetData = {
      status: STATUS.PENDING,
    };

    expect(Reducer({}, mockData)).toEqual(forventetData);
  });

  test('behandler FEILET', () => {
    const mockData = {
      type: Types.FEILET,
      data: {},
    };

    const forventetData = {
      status: STATUS.ERROR,
      data: {},
    };

    expect(Reducer({}, mockData)).toEqual(forventetData);
  });

  test('behandler OK', () => {
    const mockData = {
      type: Types.OK,
      data: {
        foo: 'foo',
      },
    };

    const forventetData = {
      status: STATUS.OK,
      data: {
        foo: 'foo',
      },
    };

    expect(Reducer({}, mockData)).toEqual(forventetData);
  });
});
