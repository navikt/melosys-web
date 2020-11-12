import React from 'react';
import { FieldArray } from 'redux-form';

import * as Mui from '../../../ui';

import RedigerbartElementListe, { InnerRedigerbartElementListe } from './redigerbartelementliste';
import RedigerbartElement from '../redigerbartelement';

describe('RedigerbartElementListe', () => {
  let props = null;

  beforeEach(() => {
    props = {
      feltNavn: 'arbeidUtland',
    };
  });

  it('viser en fieldArray', () => {
    const redigerbartElementListe = shallow(<RedigerbartElementListe {...props} />);
    const fieldArray = redigerbartElementListe.find(FieldArray);
    const fieldArrayProps = fieldArray.props();

    expect(fieldArray).toHaveLength(1);
    expect(fieldArrayProps.name).toBe(props.feltNavn);
  });
});

describe('InnerElementlListe', () => {
  let props = null;

  const TestElement = () => <div>Element</div>;

  beforeEach(() => {
    props = {
      leggTilTekst: 'Legg til',
      slettTekst: 'Slett',
      redigerbart: true,
      fields: {
        getAll: jest.fn(() => [{}, {}]),
        name: 'liste',
        remove: jest.fn(),
        push: jest.fn(),
      },
      elementClassName: 'elementClassName',
      defaultElement: {},
      className: 'className',
      settFeltVerdi: jest.fn(),
      hentNavn: jest.fn(() => 'Navn'),
      tittelTekst: 'tittel',
      elementKomponentRedigerer: () => TestElement,
      elementKomponentRedigeringUtfort: () => TestElement,
      harData: () => true,
      tittelIkon: () => <div />,
    };
  });

  it('viser redigerbartElementer', () => {
    const innerRedigerbartElementListe = shallow(<InnerRedigerbartElementListe {...props} />);
    const elementer = innerRedigerbartElementListe.find(RedigerbartElement);

    expect(elementer).toHaveLength(2);
  });

  it('kaller fields.remove ved kall til redigerbartElement sin binClickHandler', () => {
    const innerRedigerbartElementListe = shallow(<InnerRedigerbartElementListe {...props} />);
    const elementer = innerRedigerbartElementListe.find(RedigerbartElement);

    elementer.first().props().onBinClick();

    expect(props.fields.remove).toHaveBeenCalledTimes(1);
    expect(props.fields.remove).toHaveBeenLastCalledWith(0);
  });

  it('viser knapp for å legge til elementer', () => {
    const innerRedigerbartElementListe = shallow(<InnerRedigerbartElementListe {...props} />);
    const knappelenke = innerRedigerbartElementListe.find(Mui.Knappelenke);

    expect(knappelenke).toHaveLength(1);

    knappelenke.props().onClick();

    expect(props.fields.push).toHaveBeenCalledTimes(1);
    expect(props.fields.push).toHaveBeenLastCalledWith({});
  });
});
