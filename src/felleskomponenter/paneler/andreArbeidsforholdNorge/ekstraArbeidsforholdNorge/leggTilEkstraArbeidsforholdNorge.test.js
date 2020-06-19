import React from 'react';

import LeggTilEkstraArbeidsforholdNorge from './leggTilEkstraArbeidsforholdNorge';

describe('LeggTilEkstraArbeidsforholdNorge', () => {
  let props = null;

  beforeEach(() => {
    props = {
      leggTil: jest.fn(),
      leggTilTekst: 'Legg til',
      redigerbart: true,
      hentOrganisasjon: jest.fn(),
    };
  });

  it('vises uten å krasje', () => {
    shallow(<LeggTilEkstraArbeidsforholdNorge {...props} />);
  });
});
