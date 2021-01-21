import React, { useState, useEffect, ChangeEventHandler } from "react";

import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../utils/navFrontend";
import * as Skjema from "../../../../skjema";
import * as Utils from "../../../../../utils";
import * as Api from "../../../../../services/api";
import * as Symboler from "../../symboler";

import { EnRedigeringsknappListeRedigerer } from "../../editerbartElementListe";

import "./redigerer.css";

const Redigerer = ({
  redigerbart,
  overordnetFeltNavn,
  slett,
  settVerdi,
  verdier,
}: EnRedigeringsknappListeRedigerer<KV.Form.MedfolgendeFamilie>) => {
  const [disableNavnInput, setDisableNavnInput] = useState(false);
  const [visNavnSpinner, setVisNavnSpinner] = useState(false);

  const hentNavn = async (idNummer: string) => {
    if (Utils.person.erGyldigFnr(idNummer) || Utils.person.erGyldigDnr(idNummer)) {
      setVisNavnSpinner(true);
      setDisableNavnInput(true);

      try {
        const person = await Api.Personer.hentPerson(idNummer);
        settVerdi("navn", person.sammensattNavn);
      } catch (e) {
        if (e.status !== 404) Utils.logger.error(e);
        setDisableNavnInput(false);
      }

      setVisNavnSpinner(false);
    }
  };

  const idNummerChangeHandler: ChangeEventHandler<HTMLInputElement> = async (event) => {
    setDisableNavnInput(false);

    const idNummer = event.target.value;
    hentNavn(idNummer);
  };

  useEffect(() => {
    if (verdier.fnr) {
      hentNavn(verdier.fnr.toString());
    }
  }, []);

  return (
    <Nav.Row className="medfolgende-barn__redigerer">
      <Nav.Column xs="5">
        <Skjema.Input
          label="F.nr./d-nr."
          feltNavn={`${overordnetFeltNavn}.fnr`}
          disabled={!redigerbart}
          bredde="fullbredde"
          datoFelt={false}
          onChange={idNummerChangeHandler}
        />
      </Nav.Column>
      <Nav.Column xs="5">
        <Skjema.Input
          label="Fullt navn"
          feltNavn={`${overordnetFeltNavn}.navn`}
          disabled={!redigerbart || disableNavnInput}
          bredde="fullbredde"
          datoFelt={false}
        />
        {visNavnSpinner && <Nav.NavFrontendSpinner className="navn-spinner" />}
      </Nav.Column>
      <Symboler.Slett onClick={slett} className="slett-symbol" />
    </Nav.Row>
  );
};

export default Redigerer;
