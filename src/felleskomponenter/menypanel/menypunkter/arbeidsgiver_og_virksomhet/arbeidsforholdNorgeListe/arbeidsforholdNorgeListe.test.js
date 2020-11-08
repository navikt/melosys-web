import React from 'react';
import { FieldArray } from 'redux-form';

import ArbeidsforholdNorgeListe, { InnerArbeidsforholdNorgeListe, EnkeltArbeidsforholdNorgeRedigerer } from './arbeidsforholdNorgeListe';
import Orgnrinput from './orgnrinput';
import Organisasjon from '../../arbeidsgiver/organisasjon';
import EditableElement from '../../editableElement';

describe('ArbeidsforholdNorgeListe', () => {
  let props = null;

  beforeEach(() => {
    props = {
      leggTilTekst: 'Legg til',
      slettTekst: 'Sett',
      feltNavn: 'feltnavn',
      redigerbart: true,
      hentOrganisasjon: jest.fn(),
      leggTil: jest.fn(),
      findOrganisasjon: jest.fn(),
    };
  });

  it('Viser en FieldArray med InnerArbeidsforholdNorgeListe', () => {
    const arbeidsforholdNorgeListe = shallow(<ArbeidsforholdNorgeListe {...props} />);
    const fieldArray = arbeidsforholdNorgeListe.find(FieldArray);
    const fieldArrayProps = fieldArray.props();

    expect(fieldArray).toHaveLength(1);
    expect(fieldArrayProps.component).toBe(InnerArbeidsforholdNorgeListe);
  });
});

describe('InnerArbeidsforholdNorgeListe', () => {
  let props = null;

  beforeEach(() => {
    props = {
      leggTilTekst: 'Legg til',
      tittelTekst: 'tittel',
      tittelIkon: () => <span />,
      fields: {
        getAll: jest.fn(() => [
          '123123123',
        ]),
      },
      redigerbart: true,
      hentOrganisasjon: jest.fn(),
      leggTil: jest.fn(),
      findOrganisasjon: jest.fn(() => ({ orgnr: '123123123' })),
      transformerOrgTilElement: jest.fn(),
      defaultElement: {},
      elementerInneholderOrg: jest.fn(),
      saksnummer: '13',
    };
  });

  it('viser en EditableElement', () => {
    const innerArbeidsforholdNorgeListe = shallow(<InnerArbeidsforholdNorgeListe {...props} />);
    const editableElement = innerArbeidsforholdNorgeListe.find(EditableElement);

    expect(editableElement).toHaveLength(1);
  });
});

describe('EnkeltArbeidsforholdNorge', () => {
  let props = null;

  beforeEach(() => {
    props = {
      erstatt: jest.fn(),
      valideringer: [],
      redigerbart: true,
      hentOrganisasjon: jest.fn(),
      organisasjon: { orgnr: '123123123' },
      slett: jest.fn(),
      slettTekst: 'Slett',
    };
  });

  it('viser en Organisasjon', () => {
    const innerArbeidsforholdNorgeListe = shallow(<EnkeltArbeidsforholdNorgeRedigerer {...props} />);
    const organisasjon = innerArbeidsforholdNorgeListe.find(Organisasjon);
    const organisasjonProps = organisasjon.props();

    expect(organisasjon).toHaveLength(1);
    expect(organisasjonProps.organisasjon).toEqual({ orgnr: '123123123' });
    expect(organisasjonProps.redigerbart).toBe(props.redigerbart);
  });

  it('viser en orgnrinput', () => {
    const innerArbeidsforholdNorgeListe = shallow(<EnkeltArbeidsforholdNorgeRedigerer {...props} />);
    const orgnrinput = innerArbeidsforholdNorgeListe.find(Orgnrinput);

    expect(orgnrinput).toHaveLength(1);
  });
});
