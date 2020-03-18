import React from 'react';

import SideDialogNotater from './sideDialogNotater';

describe('SideDialogNotater', () => {
  let props = null;

  beforeEach(() => {
    props = {
      saksnummer: '1',
    };
  });

  it('vises uten å krasje', () => {
    shallow(<SideDialogNotater {...props} />);
  });
});
