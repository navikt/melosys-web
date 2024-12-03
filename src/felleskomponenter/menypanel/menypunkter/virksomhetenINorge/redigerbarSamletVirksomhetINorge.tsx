import * as Skjema from "../../../skjema";
import { normalizeDecimal, normalizeInt } from "../../../../utils/normalisering";

import "./redigerbarSamletVirksomhetINorge.css";

function RedigerbarSamletVirksomhetINorge() {
  return (
    <div className="redigerbar-samlet-virksomhet-i-norge">
      <Skjema.Input
        label="Antall ansatte"
        feltNavn="juridiskArbeidsgiverNorge.antallAnsatte"
        className="input"
        normalize={normalizeInt}
      />
      <Skjema.Input
        label="Antall administrativt ansatte"
        feltNavn="juridiskArbeidsgiverNorge.antallAdmAnsatte"
        className="input"
        normalize={normalizeInt}
      />
      <Skjema.Input
        label="Antall utsendte arbeidstakere"
        feltNavn="juridiskArbeidsgiverNorge.antallUtsendte"
        className="input"
        normalize={normalizeInt}
      />
      <div className="input-container">
        <Skjema.Input
          label="Andel ansatte rekruttert i Norge"
          feltNavn="juridiskArbeidsgiverNorge.andelRekruttertINorge"
          className="input"
          normalize={normalizeDecimal}
        />
        <span className="percent">&#37;</span>
      </div>
      <div className="input-container">
        <Skjema.Input
          label="Andel omsetning opptjent i Norge"
          feltNavn="juridiskArbeidsgiverNorge.andelOmsetningINorge"
          className="input"
          normalize={normalizeDecimal}
        />
        <span className="percent">&#37;</span>
      </div>
      <div className="input-container">
        <Skjema.Input
          label="Andel oppdragskontrakter inngått i Norge"
          feltNavn="juridiskArbeidsgiverNorge.andelKontrakterINorge"
          className="input"
          normalize={normalizeDecimal}
        />
        <span className="percent">&#37;</span>
      </div>
      <div className="input-container">
        <Skjema.Input
          label="Andel oppdrag utført i Norge"
          feltNavn="juridiskArbeidsgiverNorge.andelOppdragINorge"
          className="input"
          normalize={normalizeDecimal}
        />
        <span className="percent">&#37;</span>
      </div>
    </div>
  );
}

export default RedigerbarSamletVirksomhetINorge;
