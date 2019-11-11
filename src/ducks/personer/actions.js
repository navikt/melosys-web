import * as types from './types';

export const OK = data => ({ type: types.OK, data });

export const PENDING = () => ({ type: types.PENDING });

export const FEILET = data => ({ type: types.FEILET, data });
