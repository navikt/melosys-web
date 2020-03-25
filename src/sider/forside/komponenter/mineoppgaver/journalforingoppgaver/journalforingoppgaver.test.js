import React from 'react';

import * as Nav from '../../../../../utils/navFrontend';

import JournalforingOppgaver from './index';
import JournalforingOppgave from '../../../../../felleskomponenter/oppgaveliste/journalforingOppgave';

describe('JournalforingOppgaver', () => {
  let props = null;

  beforeEach(() => {
    props = {
      defaultChecked: 'nyeste',
      journalforinger: [
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

  it('kan sortere slik at nyeste journalforingsoppgave kommer først', () => {
    props.defaultChecked = 'eldste';
    const journalforingOppgaver = shallow(<JournalforingOppgaver {...props} />);

    const fieldset = journalforingOppgaver.find(Nav.Fieldset);
    const event = { target: { value: 'descending' } };
    fieldset.simulate('change', event);

    const journalforingOppgaveListe = journalforingOppgaver.find(JournalforingOppgave);
    const aktivTilDatoer = journalforingOppgaveListe.map(n => n.props().sak.aktivTil);

    expect(aktivTilDatoer[0]).toBe('2016-02-22');
    expect(aktivTilDatoer[1]).toBe('2016-02-21');
    expect(aktivTilDatoer[2]).toBe('2016-02-20');
  });

  it('kan sortere slik at eldste journalforingsoppgave kommer først', () => {
    const journalforingOppgaver = shallow(<JournalforingOppgaver {...props} />);

    const fieldset = journalforingOppgaver.find(Nav.Fieldset);
    const event = { target: { value: 'ascending' } };
    fieldset.simulate('change', event);

    const journalforingOppgaveListe = journalforingOppgaver.find(JournalforingOppgave);
    const aktivTilDatoer = journalforingOppgaveListe.map(n => n.props().sak.aktivTil);

    expect(aktivTilDatoer[0]).toBe('2016-02-20');
    expect(aktivTilDatoer[1]).toBe('2016-02-21');
    expect(aktivTilDatoer[2]).toBe('2016-02-22');
  });

  it('viser ingenting hvis journalforinger er falsy', () => {
    props.journalforinger = null;
    const journalforingOppgaver = shallow(<JournalforingOppgaver {...props} />);

    expect(journalforingOppgaver.isEmptyRender()).toBe(true);
  });
});
