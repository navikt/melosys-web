import React from 'react';

import * as Nav from '../../utils/navFrontend';

import SorterbarListe from './sorterbarListe';
import JournalforingOppgave from '../oppgaveliste/journalforingOppgave';

describe('Oppgaver', () => {
  let props = null;

  beforeEach(() => {
    props = {
      component: JournalforingOppgave,
      defaultChecked: 'nyeste',
      sortingLegend: 'Sorter journalføringsoppgaver etter frist:',
      sortingPath: 'aktivTil',
      elementer: [
        {
          aktivTil: '2016-02-21',
          ansvarligID: 'Z991111',
          fnr: '28106600300',
          journalpostID: 'DOK_3789',
          oppgaveID: '174464932',
          prioritet: 'HOY',
          sammensattNavn: 'KAKE ARTIG',
          versjon: 1,
        },
        {
          aktivTil: '2016-02-20',
          ansvarligID: 'Z992222',
          fnr: '28106600300',
          journalpostID: 'DOK_3789',
          oppgaveID: '174464932',
          prioritet: 'HOY',
          sammensattNavn: 'KAKE ARTIG',
          versjon: 1,
        },
        {
          aktivTil: '2016-02-22',
          ansvarligID: 'Z993333',
          fnr: '28106600300',
          journalpostID: 'DOK_3789',
          oppgaveID: '174464932',
          prioritet: 'HOY',
          sammensattNavn: 'KAKE ARTIG',
          versjon: 1,
        },
      ],
    };
  });

  it('kan sortere slik at nyeste oppgave kommer først', () => {
    props.defaultChecked = 'eldste';
    const journalforingOppgaver = shallow(<SorterbarListe {...props} />);

    const fieldset = journalforingOppgaver.find(Nav.Fieldset);
    const event = { target: { value: 'descending' } };
    fieldset.simulate('change', event);

    const oppgaveListe = journalforingOppgaver.find(JournalforingOppgave);
    const aktivTilDatoer = oppgaveListe.map(n => n.props().sak.aktivTil);

    expect(aktivTilDatoer[0]).toBe('2016-02-22');
    expect(aktivTilDatoer[1]).toBe('2016-02-21');
    expect(aktivTilDatoer[2]).toBe('2016-02-20');
  });

  it('kan sortere slik at eldste oppgave kommer først', () => {
    const journalforingOppgaver = shallow(<SorterbarListe {...props} />);

    const fieldset = journalforingOppgaver.find(Nav.Fieldset);
    const event = { target: { value: 'ascending' } };
    fieldset.simulate('change', event);

    const oppgaveListe = journalforingOppgaver.find(JournalforingOppgave);
    const aktivTilDatoer = oppgaveListe.map(n => n.props().sak.aktivTil);

    expect(aktivTilDatoer[0]).toBe('2016-02-20');
    expect(aktivTilDatoer[1]).toBe('2016-02-21');
    expect(aktivTilDatoer[2]).toBe('2016-02-22');
  });

  it('viser ingenting hvis oppgaver er falsy', () => {
    props.elementer = null;
    const journalforingOppgaver = shallow(<SorterbarListe {...props} />);

    expect(journalforingOppgaver.isEmptyRender()).toBe(true);
  });
});
