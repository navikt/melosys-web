import React from "react";

import * as Skjema from "../../../skjema";

import "./redigerbarSamletVirksomhetINorge.css";

const RedigerbarSamletVirksomhetINorge = () => {
  return (
    <div className="redigerbar-samlet-virksomhet-i-norge">
      <Skjema.Input
        label="Antall ansatte"
        feltNavn="juridiskArbeidsgiverNorge.antallAnsatte"
        bredde="XS"
        className="input"
        feltType="heltall"
      />
      <Skjema.Input
        label="Antall administrativt ansatte"
        feltNavn="juridiskArbeidsgiverNorge.antallAdmAnsatte"
        bredde="XS"
        className="input"
        feltType="heltall"
      />
      <Skjema.Input
        label="Antall utsendte arbeidstakere"
        feltNavn="juridiskArbeidsgiverNorge.antallUtsendte"
        bredde="XS"
        className="input"
        feltType="heltall"
      />
      <div className="input-container">
        <Skjema.Input
          label="Andel ansatte rekruttert i Norge"
          feltNavn="juridiskArbeidsgiverNorge.andelRekruttertINorge"
          bredde="XS"
          className="input"
          feltType="desimal"
        />
        <span className="percent">&#37;</span>
      </div>
      <div className="input-container">
        <Skjema.Input
          label="Andel omsetning opptjent i Norge"
          feltNavn="juridiskArbeidsgiverNorge.andelOmsetningINorge"
          bredde="XS"
          className="input"
          feltType="desimal"
        />
        <span className="percent">&#37;</span>
      </div>
      <div className="input-container">
        <Skjema.Input
          label="Andel oppdragskontrakter inngått i Norge"
          feltNavn="juridiskArbeidsgiverNorge.andelKontrakterINorge"
          bredde="XS"
          className="input"
          feltType="desimal"
        />
        <span className="percent">&#37;</span>
      </div>
      <div className="input-container">
        <Skjema.Input
          label="Andel oppdrag utført i Norge"
          feltNavn="juridiskArbeidsgiverNorge.andelOppdragINorge"
          bredde="XS"
          className="input"
          feltType="desimal"
        />
        <span className="percent">&#37;</span>
      </div>
    </div>
  );
};

export default RedigerbarSamletVirksomhetINorge;
