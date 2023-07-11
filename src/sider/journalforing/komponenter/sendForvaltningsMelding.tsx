import React, { Fragment, useEffect } from "react";

import * as Nav from "../../../navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as KV from "../../../kodeverk";

import "./sendForvaltningsMelding.css";

interface SendForvaltningsMeldingProps {
  avsenderType: string;
  settFeltInnhold: (felt: string, value: string) => void;
  harRegistrertAdresse?: boolean;
}

const SendForvaltningsMelding = ({
  avsenderType,
  settFeltInnhold,
  harRegistrertAdresse,
}: SendForvaltningsMeldingProps) => {
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
          disabled={!harRegistrertAdresse}
          feltNavn="ikkeSendForvaltingsmelding"
          label="Ja, melding skal sendes automatisk"
          value={!harRegistrertAdresse}
        />
        <Skjema.Radio
          feltNavn="ikkeSendForvaltingsmelding"
          label="Nei, jeg vil sende melding senere eller behandle saken innen kort tid"
          value={!!harRegistrertAdresse}
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

      {!harRegistrertAdresse && (
        <Nav.AlertStripe className="feilmelding" type="advarsel">
          Melding kan ikke sendes automatisk pga. manglende eller ugyldig adresse
          <ul>
            <li>
              {avsenderType === KV.AvsenderTyper.FULLMEKTIG ? "Fullmektig" : "Bruker"} må enten registrere adresse i
              Folkeregisteret eller kontaktadresse via nav.no.
            </li>
          </ul>
        </Nav.AlertStripe>
      )}
    </div>
  );
};

export default SendForvaltningsMelding;
