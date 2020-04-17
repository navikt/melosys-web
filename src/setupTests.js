/* eslint-disable */

import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16'
import each from 'jest-each';

// Feiler tester som kaster en proptype-error
import 'jest-prop-type-error';

// Oppsettfilen for Yup kjøres ikke uten videre i testmiljø. Derfor er det nødvendig å importere den manuelt her.
import './setupYup';

global.fetch = require('jest-fetch-mock');

Enzyme.configure({ adapter: new Adapter() });

global.shallow = shallow;
global.mount = mount;
global.each = each;

// Mocker frontendlogger
global.frontendlogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mocker localStorage
global.localStorage = {
  removeItem: jest.fn(),
  setItem: jest.fn(),
  getItem: jest.fn(),
};
