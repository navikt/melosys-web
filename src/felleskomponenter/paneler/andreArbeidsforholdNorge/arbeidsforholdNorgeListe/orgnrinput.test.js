import React from 'react';

import Orgnrinput from './orgnrinput';

describe('Orgnrinput', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      hentOrganisasjon: jest.fn(),
      erstatt: jest.fn(),
      defaultOrgnr: null,
      preErstattValideringer: [],
    };
  });

  it('vises uten å krasje', () => {
    shallow(<Orgnrinput {...props} />);
  });
});
