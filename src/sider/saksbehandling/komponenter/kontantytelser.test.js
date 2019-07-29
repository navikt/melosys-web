import React from 'react';

import { Kontantytelser } from './kontantytelser';

describe('Kontantytelser', () => {
  const props = {
    sakOgBehandling: {},
  };

  it('Vises uten å krasje', () => {
    expect(shallow(<Kontantytelser {...props} />));
  });
});
