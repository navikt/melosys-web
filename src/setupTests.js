/* eslint-disable */

import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16'
import each from 'jest-each';


global.fetch = require('jest-fetch-mock');

Enzyme.configure({ adapter: new Adapter() });

global.shallow = shallow;
global.mount = mount;

global.each = each;
