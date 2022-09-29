import React from "react";
import { Link } from "react-router-dom";

import * as MPT from "../../proptypes";
import * as Ikoner from "../../resources/images";
import * as Nav from "../../navFrontend";

import PanelHeader from "../panelHeader";

import "./journalforingOppgave.css";

const JournalforingOppgave = ({ sak }) => {
  const { journalpostID, oppgaveID, aktivTil, navn } = sak;
  const link = `/journalforing/${journalpostID}/${oppgaveID}`;

  const tittel = (
    <div className="panel-slim-wrapper">
      <span>{navn}</span>
      <span className="frist">
        <b>Frist:</b> {aktivTil}
      </span>
    </div>
  );

  return (
    <Link to={link} className="journalOppgave__link">
      <Nav.Panel className="journalOppgave">
        <PanelHeader ikon={Ikoner.IkonSak} tittel={tittel} />
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
