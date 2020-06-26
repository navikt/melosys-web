import React from 'react';

import LeggTilEkstraArbeidsforholdNorge from './orgnrinput';

describe('LeggTilEkstraArbeidsforholdNorge', () => {
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
    shallow(<LeggTilEkstraArbeidsforholdNorge {...props} />);
  });
});
