import React from 'react';

import * as Nav from '../../../utils/navFrontend';

import { AlleNorskeArbeidsgivere, AndreArbeidsforholdNorge } from './andreArbeidsforholdNorge';
import ArbeidsforholdNorgeListe from './arbeidsforholdNorgeListe';

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

  it('viser to ArbeidsforholdNorgeListe', () => {
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
