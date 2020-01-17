import React from 'react';

import * as Skjema from './skjema';

import { Brukernavnskjema } from './brukernavnskjema';

describe('brukernavnskjema', () => {
  let props = null;

  beforeEach(() => {
    fetch.resetMocks();
    fetch.mockResponse(JSON.stringify({}));

    props = {
      form: 'Journalforing_SED',
      settFormBruker: jest.fn(),
    };
  });

  it('viser en skjema.input', () => {
    const brukernavnskjema = shallow(<Brukernavnskjema {...props} />);

    expect(brukernavnskjema.find(Skjema.Input)).toHaveLength(1);
  });
});
