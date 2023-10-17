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
  annenPersonOrgErFullmektig?: boolean;
  fullmakter?: string[];
}

const SendForvaltningsMelding = ({
  avsenderType,
  settFeltInnhold,
  harRegistrertAdresse,
  representantRepresenterer,
  annenPersonOrgErFullmektig,
  fullmakter,
}: SendForvaltningsMeldingProps) => {
  const representererBruker = [MKV.Koder.representerer.BRUKER, MKV.Koder.representerer.BEGGE].includes(
    representantRepresenterer
  );
  const fullmektigForBruker = fullmakter?.includes(MKV.Koder.fullmaktstype.FULLMEKTIG_SØKNAD);
  const avsenderErFullmektigForBruker =
    (avsenderType === KV.AvsenderTyper.FULLMEKTIG && representererBruker) ||
    (avsenderType === KV.AvsenderTyper.ANNEN_PERSON_ORG && annenPersonOrgErFullmektig && fullmektigForBruker);

  useEffect(
    () => () => {
      if (avsenderType !== KV.AvsenderTyper.FULLMEKTIG) {
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
        {avsenderType === KV.AvsenderTyper.FULLMEKTIG && (
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
          <Nav.Typo.Element>Melding kan ikke sendes automatisk pga. manglende eller ugyldig adresse</Nav.Typo.Element>
          <ul>
            <li>
              {avsenderErFullmektigForBruker ? "Fullmektig" : "Bruker"} må enten registrere adresse i Folkeregisteret
              eller kontaktadresse via nav.no.
            </li>
          </ul>
        </Nav.AlertStripe>
      )}
    </div>
  );
};

export default SendForvaltningsMelding;
