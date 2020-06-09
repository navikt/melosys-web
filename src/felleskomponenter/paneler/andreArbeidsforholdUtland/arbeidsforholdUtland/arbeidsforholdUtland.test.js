import React from 'react';
import { FieldArray } from 'redux-form';

import * as Nav from '../../../../utils/navFrontend';

import ArbeidsforholdUtland, { InnerArbeidsforholdUtland } from './arbeidsforholdUtland';
import EnkeltArbeidsforhold from './enkeltArbeidsforhold';

describe('ArbeidsforholdUtland', () => {
  let props = null;

  beforeEach(() => {
    props = {
      feltNavn: 'foretakUtland',
    };
  });

  it('viser en FieldArray', () => {
    const arbeidsforholdUtland = shallow(<ArbeidsforholdUtland {...props} />);
    const fieldArray = arbeidsforholdUtland.find(FieldArray);

    expect(fieldArray).toHaveLength(1);
    expect(fieldArray.props().component).toBe(InnerArbeidsforholdUtland);
  });
});

describe('InnerArbeidsforholdUtland', () => {
  let props = null;

  beforeEach(() => {
    props = {
      leggTilTekst: 'Legg til',
      slettTekst: 'Slett',
      redigerbart: true,
      fields: {
        name: 'foretakUtland',
        getAll: jest.fn(() => [{}, {}]),
      },
    };
  });

  it('viser arbeidsforhold', () => {
    const innerArbeidsforholdUtland = shallow(<InnerArbeidsforholdUtland {...props} />);
    const enkelteArbeidsforhold = innerArbeidsforholdUtland.find(EnkeltArbeidsforhold);

    expect(enkelteArbeidsforhold).toHaveLength(2);
    enkelteArbeidsforhold.forEach(n => {
      const nProps = n.props();
      expect(nProps.redigerbart).toBe(props.redigerbart);
      expect(nProps.overordnetFeltnavn).toBe('foretakUtland');
    });
  });

  it('viser knapp for å legge til arbeidsforhold', () => {
    const andreArbeidsforholdUtland = shallow(<InnerArbeidsforholdUtland {...props} />);
    const knapp = andreArbeidsforholdUtland.find(Nav.Knapp);
    const knappProps = knapp.props();

    expect(knapp).toHaveLength(1);
    expect(knappProps.disabled).toBe(!props.redigerbart);
    expect(knapp.children().text()).toBe(props.leggTilTekst);
  });
});
