import { Link } from "react-router-dom";

import * as MPT from "../../proptypes";
import * as Ikoner from "../../resources/images";

import PanelHeader from "../panelHeader";

import "./journalforingOppgave.less";

function JournalforingOppgave({ sak = {} }) {
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
      <div className="panel journalOppgave">
        <PanelHeader ikon={Ikoner.IkonSak} tittel={tittel} />
      </div>
    </Link>
  );
}

JournalforingOppgave.propTypes = {
  sak: MPT.JournalforingOppgave,
};

export default JournalforingOppgave;
