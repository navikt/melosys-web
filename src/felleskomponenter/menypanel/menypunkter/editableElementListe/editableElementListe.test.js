import React from 'react';
import { FieldArray } from 'redux-form';

import * as Mui from '../../../ui';

import EditableElementListe, { InnerEditableElementListe } from './editableElementListe';
import EditableElement from '../editableElement';

describe('EditableElementListe', () => {
  let props = null;

  beforeEach(() => {
    props = {
      feltNavn: 'arbeidUtland',
    };
  });

  it('viser en fieldArray', () => {
    const editableElementListe = shallow(<EditableElementListe {...props} />);
    const fieldArray = editableElementListe.find(FieldArray);
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
      redigererKomponent: () => TestElement,
      redigeringUtfortKomponent: () => TestElement,
      harData: () => true,
      tittelIkon: () => <div />,
    };
  });

  it('viser EditableElementer', () => {
    const innerEditableElementListe = shallow(<InnerEditableElementListe {...props} />);
    const elementer = innerEditableElementListe.find(EditableElement);

    expect(elementer).toHaveLength(2);
  });

  it('kaller fields.remove ved kall til EditableElement sin binClickHandler', () => {
    const innerEditableElementListe = shallow(<InnerEditableElementListe {...props} />);
    const elementer = innerEditableElementListe.find(EditableElement);

    elementer.first().props().onBinClick();

    expect(props.fields.remove).toHaveBeenCalledTimes(1);
    expect(props.fields.remove).toHaveBeenLastCalledWith(0);
  });

  it('viser knapp for å legge til elementer', () => {
    const innerEditableElementListe = shallow(<InnerEditableElementListe {...props} />);
    const knappelenke = innerEditableElementListe.find(Mui.Knappelenke);

    expect(knappelenke).toHaveLength(1);

    knappelenke.props().onClick();

    expect(props.fields.push).toHaveBeenCalledTimes(1);
    expect(props.fields.push).toHaveBeenLastCalledWith({});
  });
});
