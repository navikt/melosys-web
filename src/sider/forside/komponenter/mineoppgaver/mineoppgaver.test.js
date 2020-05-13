import React from 'react';

import BehandlingOppgave from '../../../../felleskomponenter/oppgaveliste/behandlingOppgave';
import JournalforingOppgave from '../../../../felleskomponenter/oppgaveliste/journalforingOppgave';
import OppgaverMedSortering from '../../../../felleskomponenter/oppgaveliste/oppgaverMedSortering';
import { MineOppgaver } from './mineoppgaver';

describe('MineOppgaver', () => {
  let props = null;

  const journalforing = [
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
  ];

  const saksbehandling = [
    {
      oppgaveID: '174562068',
      sammensattNavn: 'GLITRENDE HATT',
      fnr: '28106600300',
      saksnummer: '4',
      sakstype: {
        kode: 'TRYGDEAVTALE',
        term: 'Trygdeavtale',
      },
      behandling: {
        behandlingID: 4,
        behandlingstype: {
          kode: 'SOEKNAD',
          term: 'Søknad',
        },
        behandlingsstatus: {
          kode: 'UBEH',
          term: 'Under behandling',
        },
        endretDato: '2018-08-10T15:00:00.622Z',
        erUnderOppdatering: false,
        registrertDato: '2018-12-11T16:30:00.622Z',
        svarFrist: '2019-12-11T16:30:00.622Z',
      },
      aktivTil: '2018-01-28',
      periode: {
        fom: '2018-10-01',
        tom: '2019-08-31',
      },
      prioritet: 'HOY',
      land: ['NO'],
      versjon: 1,
      ansvarligID: 'Z991001',
    },
  ];

  beforeEach(() => {
    props = {
      minesaker: {
        journalforing,
        saksbehandling,
      },
    };
  });

  it('viser en OppgaverMedSortering for journalføringsoppgaver', () => {
    const mineOppgaver = shallow(<MineOppgaver {...props} />);

    const journalforingOppgaver = mineOppgaver
      .find(OppgaverMedSortering)
      .first();

    const journalforingOppgaverProps = journalforingOppgaver.props();
    expect(journalforingOppgaverProps.component).toBe(JournalforingOppgave);
    expect(journalforingOppgaverProps.oppgaver).toBe(props.minesaker.journalforing);
  });

  it('viser en OppgaverMedSortering for behandlinger', () => {
    const mineOppgaver = shallow(<MineOppgaver {...props} />);

    const journalforingOppgaver = mineOppgaver
      .find(OppgaverMedSortering)
      .last();

    const journalforingOppgaverProps = journalforingOppgaver.props();
    expect(journalforingOppgaverProps.component).toBe(BehandlingOppgave);
    expect(journalforingOppgaverProps.oppgaver).toBe(props.minesaker.saksbehandling);
  });

  it('viser en melding dersom det ikke er noen journalføringsoppgaver eller behandlinger', () => {
    props.minesaker = {
      journalforing: [],
      saksbehandling: [],
    };
    const mineOppgaver = shallow(<MineOppgaver {...props} />);

    expect(mineOppgaver.containsMatchingElement('Du har ingen saker akkurat nå. Velg en ny sak eller journalføringsoppgave fra panelene til høyre.')).toBe(true);
  });
});
