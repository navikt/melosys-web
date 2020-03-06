import React from 'react';
import { shallow } from 'enzyme';
import { App } from './App';

it('renders without crashing', () => {
  const props = {
    lastAppdata: jest.fn(),
  };

  shallow(<App {...props} />);
});
