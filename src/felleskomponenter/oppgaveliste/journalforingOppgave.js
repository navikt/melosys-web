import React from "react";
import { Link } from "react-router-dom";

import * as MPT from "../../proptypes";
import * as Ikoner from "../../resources/images";
import * as Nav from "../../navFrontend";

import PanelHeader from "../panelHeader";

import "./journalforingOppgave.css";

const JournalforingOppgave = ({ sak }) => {
  const { journalpostID, oppgaveID, aktivTil, hovedpartIdent, navn } = sak;
  const tittel = `Journalføring - ${navn} - ${hovedpartIdent}`;
  const link = `/journalforing/${journalpostID}/${oppgaveID}`;

  const undertittel = (
    <div className="frist-wrapper">
      <span className="frist">Frist:</span>
      {aktivTil}
    </div>
  );

  return (
    <Link to={link} className="journalOppgave__link">
      <Nav.Panel className="journalOppgave">
        <PanelHeader ikon={Ikoner.IkonSak} tittel={tittel} undertittel={undertittel} />
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
