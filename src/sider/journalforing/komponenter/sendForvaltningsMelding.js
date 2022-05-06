import React, { Fragment, useEffect } from "react";
import PT from "prop-types";

import * as Nav from "../../../navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as KV from "../../../kodeverk";
import { BOOLSK } from "../../../constants";

import "./sendForvaltningsMelding.css";

const SendForvaltningsMelding = ({ avsenderType, settFeltInnhold }) => {
  const avsenderErFullmelktig = avsenderType === KV.AvsenderTyper.FULLMEKTIG;

  useEffect(
    () => () => {
      if (!avsenderErFullmelktig) {
        settFeltInnhold("representantKontaktPerson", "");
      }
    },
    [avsenderType]
  );

  return (
    <div className="sendForvaltningsmelding">
      <Nav.Typo.Element>Skal melding om saksbehandlingtid sendes automatisk?</Nav.Typo.Element>

      <Skjema.RadioGruppe feltNavn="ikkeSendForvaltingsmelding" label="">
        <Skjema.Radio
          feltNavn="ikkeSendForvaltingsmelding"
          label="Ja, melding skal sendes automatisk"
          value={BOOLSK.USANN}
          className="sendForvaltningsmelding__radio"
        />
        <Skjema.Radio
          feltNavn="ikkeSendForvaltingsmelding"
          label="Nei, jeg vil sende melding senere eller behandle saken innen kort tid"
          value={BOOLSK.SANN}
          className="sendForvaltningsmelding__radio"
        />
        {avsenderErFullmelktig && (
          <Fragment>
            <Nav.Typo.Element>
              Oppgi kontaktperson hos fullmektig som skal motta meldingen hvis dette er oppgitt
            </Nav.Typo.Element>
            <Skjema.Input feltNavn="representantKontaktPerson" label="" placeholder="Skriv inn..." />
          </Fragment>
        )}
      </Skjema.RadioGruppe>
    </div>
  );
};

SendForvaltningsMelding.propTypes = {
  avsenderType: PT.string.isRequired,
  settFeltInnhold: PT.func.isRequired,
};

export default SendForvaltningsMelding;
