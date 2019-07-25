import React from 'react';
import { Link } from 'react-router-dom';

import * as MPT from '../../proptypes';
import * as Ikoner from '../../resources/images';
import * as Nav from '../../utils/navFrontend';

import PanelHeader from '../panelHeader/panelHeader';

import './journalforingOppgave.css';

const JournalforingOppgave = ({ sak }) => {
  const {
    journalpostID,
    oppgaveID,
    aktivTil,
    fnr,
    sammensattNavn,
  } = sak;
  const tittel = `Journalføring - ${sammensattNavn} - ${fnr}`;
  const link = `/journalforing/${journalpostID}/${oppgaveID}`;

  const undertittel = () => (
    <Nav.Row>
      <Nav.Column xs="12" md="6">
        <dl className="journalOppgave__meta">
          <dt className="journalOppgave__meta__term">Frist:</dt>
          <dd className="journalOppgave__meta__detalj">{aktivTil}</dd>
        </dl>
      </Nav.Column>
    </Nav.Row>
  );

  return (
    <Link to={link} className="journalOppgave__link">
      <Nav.Panel className="journalOppgave">
        <PanelHeader
          ikon={Ikoner.IkonSak}
          tittel={tittel}
          undertittel={undertittel()} />
      </Nav.Panel>
    </Link>
  );
};

JournalforingOppgave.propTypes = {
  sak: MPT.JournalforingOppgave,
};

JournalforingOppgave.defaultProps = {
  sak: {},
};

export default JournalforingOppgave;
