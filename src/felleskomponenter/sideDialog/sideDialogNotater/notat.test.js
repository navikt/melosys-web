import React from 'react';

import * as Nav from '../../../utils/navFrontend';

import Notat from './notat';

const lagLenkeKnappPredicate = knappTekst => n =>
  n.containsMatchingElement(<span>{knappTekst}</span>) &&
  n.type() === Nav.Lenker;

describe('Notat', () => {
  let props = null;

  beforeEach(() => {
    props = {
      redigerbart: true,
      tekst: 'Tekst',
      opprettetDato: '2019-04-23T10:02:52.031Z',
      endretDato: '2019-04-24T09:58:23.899Z',
      forfatter: 'LILLA HEST',
      onUpdate: jest.fn(),
      overskrift: 'Søknad',
      maksTekstLengde: 500,
    };
  });

  it('viser ikke endringsknapp hvis ikke redigerbar', () => {
    props.redigerbart = false;
    const notat = shallow(<Notat {...props} />);

    const endreKnapp = notat.find(Nav.Lenker);

    expect(endreKnapp).toHaveLength(0);
  });

  it('skjuler knapp for lagring av tekst med flere tegn enn maksTekstLengde', () => {
    props.maksTekstLengde = -1;
    const notat = shallow(<Notat {...props} />);

    const endreKnapp = notat.find(Nav.Lenker);
    endreKnapp.simulate('click');

    const lagreKnapp = notat.findWhere(lagLenkeKnappPredicate('Lagre'));

    expect(lagreKnapp).toHaveLength(0);
  });

  it('kaller onUpdate ved lagring av tekst', () => {
    const notat = shallow(<Notat {...props} />);

    const endreKnapp = notat.find(Nav.Lenker);
    endreKnapp.simulate('click');

    const lagreKnapp = notat.findWhere(lagLenkeKnappPredicate('Lagre'));
    lagreKnapp.simulate('click');

    expect(props.onUpdate).toHaveBeenCalledTimes(1);
    expect(props.onUpdate).toHaveBeenCalledWith(props.tekst);
  });

  it('initialiserer tekstfelt med tekst fra prop', () => {
    const notat = shallow(<Notat {...props} />);

    const tekstomrade = notat.find(Nav.Tekstomrade);
    expect(tekstomrade.children().text()).toBe(props.tekst);

    const endreKnapp = notat.find(Nav.Lenker);
    endreKnapp.simulate('click');

    const textarea = notat.find(Nav.Textarea);
    expect(textarea.props().value).toBe(props.tekst);
  });

  it('resetter tekst i tekstfelt dersom man avbryter en endring', () => {
    const notat = shallow(<Notat {...props} />);

    const endreKnapp = notat.find(Nav.Lenker);
    endreKnapp.simulate('click');

    const textarea = notat.find(Nav.Textarea);
    const event = { target: { value: 'Dette er en testsak' } };
    textarea.simulate('change', event);

    expect(notat.find(Nav.Textarea).props().value).toBe('Dette er en testsak');

    const avbrytKnapp = notat.findWhere(lagLenkeKnappPredicate('Avbryt'));
    avbrytKnapp.simulate('click');

    const tekstomrade = notat.find(Nav.Tekstomrade);
    expect(tekstomrade.children().text()).toBe(props.tekst);
  });

  it('viser overskrift', () => {
    const notat = shallow(<Notat {...props} />);
    const overskrift = notat.findWhere(n => n.text() === props.overskrift);

    expect(overskrift).toHaveLength(1);
  });

  it('viser endringsdato dersom opprettetDato og endretDato er forskjellige', () => {
    const notat = shallow(<Notat {...props} />);
    const endringsdato = notat.findWhere(n => n.text().includes('Endret:'));

    expect(endringsdato).toHaveLength(1);
  });

  it('viser ikke endretDato dersom opprettelsesDato og endretDato er like', () => {
    props.endretDato = '2019-04-23T10:02:52.031Z';
    const notat = shallow(<Notat {...props} />);
    const endringsdato = notat.findWhere(n => n.text().includes('Endret:'));

    expect(endringsdato).toHaveLength(0);
  });

  it('viser opprettelsesdato', () => {
    const notat = shallow(<Notat {...props} />);
    const opprettelsesdato = notat.findWhere(n => n.text().includes('Opprettet:'));

    expect(opprettelsesdato).toHaveLength(1);
  });

  it('viser forfatter', () => {
    const notat = shallow(<Notat {...props} />);
    const forfatter = notat.findWhere(n => n.text().includes(props.forfatter));

    expect(forfatter).toHaveLength(1);
  });
});
