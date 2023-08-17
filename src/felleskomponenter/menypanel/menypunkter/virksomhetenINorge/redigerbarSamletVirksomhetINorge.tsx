import * as Skjema from "../../../skjema";
import { normalizeDecimal, normalizeInt } from "../../../../utils/normalisering";

import "./redigerbarSamletVirksomhetINorge.css";

const RedigerbarSamletVirksomhetINorge = () => {
  return (
    <div className="redigerbar-samlet-virksomhet-i-norge">
      <Skjema.Input
        label="Antall ansatte"
        feltNavn="juridiskArbeidsgiverNorge.antallAnsatte"
        bredde="XS"
        className="input"
        normalize={normalizeInt}
      />
      <Skjema.Input
        label="Antall administrativt ansatte"
        feltNavn="juridiskArbeidsgiverNorge.antallAdmAnsatte"
        bredde="XS"
        className="input"
        normalize={normalizeInt}
      />
      <Skjema.Input
        label="Antall utsendte arbeidstakere"
        feltNavn="juridiskArbeidsgiverNorge.antallUtsendte"
        bredde="XS"
        className="input"
        normalize={normalizeInt}
      />
      <div className="input-container">
        <Skjema.Input
          label="Andel ansatte rekruttert i Norge"
          feltNavn="juridiskArbeidsgiverNorge.andelRekruttertINorge"
          bredde="XS"
          className="input"
          normalize={normalizeDecimal}
        />
        <span className="percent">&#37;</span>
      </div>
      <div className="input-container">
        <Skjema.Input
          label="Andel omsetning opptjent i Norge"
          feltNavn="juridiskArbeidsgiverNorge.andelOmsetningINorge"
          bredde="XS"
          className="input"
          normalize={normalizeDecimal}
        />
        <span className="percent">&#37;</span>
      </div>
      <div className="input-container">
        <Skjema.Input
          label="Andel oppdragskontrakter inngått i Norge"
          feltNavn="juridiskArbeidsgiverNorge.andelKontrakterINorge"
          bredde="XS"
          className="input"
          normalize={normalizeDecimal}
        />
        <span className="percent">&#37;</span>
      </div>
      <div className="input-container">
        <Skjema.Input
          label="Andel oppdrag utført i Norge"
          feltNavn="juridiskArbeidsgiverNorge.andelOppdragINorge"
          bredde="XS"
          className="input"
          normalize={normalizeDecimal}
        />
        <span className="percent">&#37;</span>
      </div>
    </div>
  );
};

export default RedigerbarSamletVirksomhetINorge;
