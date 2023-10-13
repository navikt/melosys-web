import { Fragment, useEffect } from "react";

import * as Nav from "../../../navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as KV from "../../../kodeverk";
import MKV from "../../../melosyskodeverk";

import "./sendForvaltningsMelding.css";

interface SendForvaltningsMeldingProps {
  avsenderType: string;
  settFeltInnhold: (felt: string, value: string | boolean) => void;
  harRegistrertAdresse?: boolean;
  representantRepresenterer?: string;
}

const SendForvaltningsMelding = ({
  avsenderType,
  settFeltInnhold,
  harRegistrertAdresse,
  representantRepresenterer,
}: SendForvaltningsMeldingProps) => {
  const avsenderErFullmelktig = avsenderType === KV.AvsenderTyper.FULLMEKTIG;
  const representererBruker = [MKV.Koder.representerer.BRUKER, MKV.Koder.representerer.BEGGE].includes(
    representantRepresenterer
  );

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
          value={false}
        />
        <Skjema.Radio
          feltNavn="ikkeSendForvaltingsmelding"
          label="Nei, jeg vil sende melding senere eller behandle saken innen kort tid"
          value
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

      {harRegistrertAdresse === false && (
        <Nav.AlertStripe className="feilmelding" type="advarsel">
          <Nav.Typo.Element>Melding kan ikke sendes automatisk pga. manglende eller ugyldig adresse</Nav.Typo.Element>
          <ul>
            <li>
              {avsenderErFullmelktig && representererBruker ? "Fullmektig" : "Bruker"} må enten registrere adresse i
              Folkeregisteret eller kontaktadresse via nav.no.
            </li>
          </ul>
        </Nav.AlertStripe>
      )}
    </div>
  );
};

export default SendForvaltningsMelding;
