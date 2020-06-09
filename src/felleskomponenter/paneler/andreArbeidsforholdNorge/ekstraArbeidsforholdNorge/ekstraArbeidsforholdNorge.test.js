import React from 'react';
import { FieldArray } from 'redux-form';

import EkstraArbeidsforholdNorge, { InnerEkstraArbeidsforholdNorge } from './ekstraArbeidsforholdNorge';
import LeggTilEkstraArbeidsforholdNorge from './leggTilEkstraArbeidsforholdNorge';
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
      slettTekst: 'Sett',
      fields: { getAll: jest.fn() },
      redigerbart: true,
      hentOrganisasjon: jest.fn(),
      leggTil: jest.fn(),
      findOrganisasjon: jest.fn(),
    };
  });

  it('viser en LeggTilEkstraArbeidsforholdNorge', () => {
    const innerEkstraArbeidsforholdNorge = shallow(<InnerEkstraArbeidsforholdNorge {...props} />);
    const leggTilEkstraArbeidsforholdNorge = innerEkstraArbeidsforholdNorge.find(LeggTilEkstraArbeidsforholdNorge);
    const leggTilEkstraArbeidsforholdNorgeProps = leggTilEkstraArbeidsforholdNorge.props();

    expect(leggTilEkstraArbeidsforholdNorge).toHaveLength(1);
    expect(leggTilEkstraArbeidsforholdNorgeProps.leggTilTekst).toBe(props.leggTilTekst);
    expect(leggTilEkstraArbeidsforholdNorgeProps.redigerbart).toBe(props.redigerbart);
    expect(leggTilEkstraArbeidsforholdNorgeProps.hentOrganisasjon).toBe(props.hentOrganisasjon);
  });

  it('viser en Organisasjon', () => {
    props.fields.getAll = jest.fn(() => [
      '123123123',
    ]);
    props.findOrganisasjon = jest.fn(() => ({ orgnr: '123123123' }));

    const innerEkstraArbeidsforholdNorge = shallow(<InnerEkstraArbeidsforholdNorge {...props} />);
    const organisasjon = innerEkstraArbeidsforholdNorge.find(Organisasjon);
    const organisasjonProps = organisasjon.props();

    expect(organisasjon).toHaveLength(1);
    expect(organisasjonProps.organisasjon).toEqual({ orgnr: '123123123' });
    expect(organisasjonProps.redigerbart).toBe(props.redigerbart);
    expect(organisasjonProps.slettTekst).toBe(props.slettTekst);
  });
});
