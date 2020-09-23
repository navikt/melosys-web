import React from 'react';

import * as Nav from '../../../utils/navFrontend';

import { AlleNorskeArbeidsgivere, AndreArbeidsforholdNorge, NorskeArbeidsgivereSed } from './andreArbeidsforholdNorge';
import ArbeidsforholdNorgeListe from './arbeidsforholdNorgeListe';
import { EnkeltArbeidsforholdNorge } from './arbeidsforholdNorgeListe/arbeidsforholdNorgeListe';

describe('AndreArbeidsforholdNorge', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      organisasjoner: [],
      hentOrganisasjon: jest.fn(),
    };
  });

  it('viser et panel', () => {
    const andreArbeidsforholdNorge = shallow(<AndreArbeidsforholdNorge {...props} />);

    expect(andreArbeidsforholdNorge.find(Nav.EkspanderbartpanelBase)).toHaveLength(1);
  });
});

describe('AlleNorskeArbeidsgivere', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      organisasjoner: [],
      hentOrganisasjon: jest.fn(),
    };
  });

  it('viser en ArbeidsforholdNorgeListe', () => {
    const alleNorskeArbeidsgivere = shallow(<AlleNorskeArbeidsgivere {...props} />);
    const arbeidsforholdNorgeListe = alleNorskeArbeidsgivere.find(ArbeidsforholdNorgeListe);

    expect(arbeidsforholdNorgeListe).toHaveLength(1);
    arbeidsforholdNorgeListe.forEach(n => {
      const nProps = n.props();
      expect(nProps.redigerbart).toBe(props.redigerbart);
      expect(nProps.hentOrganisasjon).toBe(props.hentOrganisasjon);
    });
  });
});

describe('NorskeArbeidsgivereSed', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      hentOrganisasjon: jest.fn(),
      fields: {
        getAll: jest.fn(() => [
          { orgnr: '123123123' },
          { orgnr: '321321321' },
        ]),
      },
    };
  });

  it('viser to EnkeltArbeidsforholdNorge', () => {
    const norskeArbeidsgivereSed = shallow(<NorskeArbeidsgivereSed {...props} />);
    const enkeltArbeidsforholdNorge = norskeArbeidsgivereSed.find(EnkeltArbeidsforholdNorge);

    expect(enkeltArbeidsforholdNorge).toHaveLength(2);
  });
});
