import React from 'react';
import { FieldArray } from 'redux-form';

import EkstraArbeidsforholdNorge, { InnerEkstraArbeidsforholdNorge } from './ekstraArbeidsforholdNorge';
import Orgnrinput from './orgnrinput';
import Organisasjon from '../../arbeidsgiver/organisasjon';

describe('EkstraArbeidsforholdNorge', () => {
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

  it('Viser en FieldArray med InnerEkstraArbeidsforholdNorge', () => {
    const ekstraArbeidsforholdNorge = shallow(<EkstraArbeidsforholdNorge {...props} />);
    const fieldArray = ekstraArbeidsforholdNorge.find(FieldArray);
    const fieldArrayProps = fieldArray.props();

    expect(fieldArray).toHaveLength(1);
    expect(fieldArrayProps.component).toBe(InnerEkstraArbeidsforholdNorge);
  });
});

describe('InnerEkstraArbeidsforholdNorge', () => {
  let props = null;

  beforeEach(() => {
    props = {
      leggTilTekst: 'Legg til',
      slettTekst: 'Slett',
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
    };
  });

  it('viser en Organisasjon', () => {
    const innerEkstraArbeidsforholdNorge = shallow(<InnerEkstraArbeidsforholdNorge {...props} />);
    const organisasjon = innerEkstraArbeidsforholdNorge.find(Organisasjon);
    const organisasjonProps = organisasjon.props();

    expect(organisasjon).toHaveLength(1);
    expect(organisasjonProps.organisasjon).toEqual({ orgnr: '123123123' });
    expect(organisasjonProps.redigerbart).toBe(props.redigerbart);
  });

  it('viser en orgnrinput', () => {
    const innerEkstraArbeidsforholdNorge = shallow(<InnerEkstraArbeidsforholdNorge {...props} />);
    const orgnrinput = innerEkstraArbeidsforholdNorge.find(Orgnrinput);

    expect(orgnrinput).toHaveLength(1);
  });
});
