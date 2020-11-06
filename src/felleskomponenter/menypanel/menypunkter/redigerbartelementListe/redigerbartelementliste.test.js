import React from 'react';
import { FieldArray } from 'redux-form';

import * as Nav from '../../../../utils/navFrontend';

import RedigerbartElementListe, { InnerRedigerbartElementListe } from './redigerbartelementliste';

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
      elementKomponent: TestElement,
      elementClassName: 'elementClassName',
      defaultElement: {},
      className: 'className',
      settFeltVerdi: jest.fn(),
    };
  });

  it('viser elementer fra fields', () => {
    const innerRedigerbartElementListe = shallow(<InnerRedigerbartElementListe {...props} />);
    const elementer = innerRedigerbartElementListe.find(TestElement);

    expect(elementer).toHaveLength(2);
    expect(elementer.first().props().overordnetFeltNavn).toBe('liste[0]');
    expect(elementer.first().props().redigerbart).toBe(props.redigerbart);
    expect(elementer.first().props().className).toBe(props.elementClassName);
    expect(elementer.first().props().verdier).toEqual({});
    expect(elementer.last().props().overordnetFeltNavn).toBe('liste[1]');
    expect(elementer.last().props().redigerbart).toBe(props.redigerbart);
    expect(elementer.last().props().className).toBe(props.elementClassName);
    expect(elementer.first().props().verdier).toEqual({});
  });

  it('viser lenker for å slette elementer', () => {
    const innerRedigerbartElementListe = shallow(<InnerRedigerbartElementListe {...props} />);
    const lenker = innerRedigerbartElementListe.find(Nav.Lenker);

    expect(lenker).toHaveLength(2);

    lenker.first().simulate('click');

    expect(props.fields.remove).toHaveBeenCalledTimes(1);
    expect(props.fields.remove).toHaveBeenLastCalledWith(0);
  });

  it('viser knapp for å legge til elementer', () => {
    const innerRedigerbartElementListe = shallow(<InnerRedigerbartElementListe {...props} />);
    const knapp = innerRedigerbartElementListe.find(Nav.Knapp);

    expect(knapp).toHaveLength(1);

    knapp.simulate('click');

    expect(props.fields.push).toHaveBeenCalledTimes(1);
    expect(props.fields.push).toHaveBeenLastCalledWith({});
  });
});
