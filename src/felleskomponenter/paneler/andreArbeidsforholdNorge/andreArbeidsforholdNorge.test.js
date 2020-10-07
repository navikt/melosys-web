import React from 'react';

import * as Nav from '../../../utils/navFrontend';

import { AndreArbeidsforholdNorge } from './andreArbeidsforholdNorge';
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

  it('viser to ArbeidsforholdNorgeListe', () => {
    const andreArbeidsforholdNorge = shallow(<AndreArbeidsforholdNorge {...props} />);
    const arbeidsforholdNorgeListe = andreArbeidsforholdNorge.find(ArbeidsforholdNorgeListe);

    expect(arbeidsforholdNorgeListe).toHaveLength(2);
    arbeidsforholdNorgeListe.forEach(n => {
      const nProps = n.props();
      expect(nProps.redigerbart).toBe(props.redigerbart);
      expect(nProps.hentOrganisasjon).toBe(props.hentOrganisasjon);
    });
  });
});

