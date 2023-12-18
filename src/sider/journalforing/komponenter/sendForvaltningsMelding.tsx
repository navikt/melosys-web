import { Fragment, useEffect } from "react";

import * as Nav from "../../../navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as KV from "../../../kodeverk";
import MKV from "../../../melosyskodeverk";

import "./sendForvaltningsMelding.css";

const { SEND_AVSENDER, SEND_BRUKER, IKKE_SEND } = KV.Koder.FORVALTNINGSMELDING_MOTTAKER;

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
  const representererBruker = [MKV.Koder.representerer.BRUKER, MKV.Koder.representerer.BEGGE].includes(
    representantRepresenterer
  );
  const avsenderErFullmektigForBruker = avsenderType === KV.AvsenderTyper.FULLMEKTIG && representererBruker;

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

      <Skjema.RadioGruppe feltNavn="mottakerForvaltingsmelding" label="">
        <Skjema.Radio
          disabled={!harRegistrertAdresse}
          feltNavn="mottakerForvaltingsmelding"
          label={
            <>
              Ja, melding skal sendes automatisk til <b>bruker</b>
            </>
          }
          value={SEND_BRUKER}
        />
        {avsenderType === KV.AvsenderTyper.ANNEN_PERSON_ELLER_VIRKSOMHET ? (
          <Skjema.Radio
            disabled={!harRegistrertAdresse}
            feltNavn="mottakerForvaltingsmelding"
            label={
              <>
                Ja, melding skal sendes automatisk til <b>avsender</b>
              </>
            }
            value={SEND_AVSENDER}
          />
        ) : null}
        <Skjema.Radio
          feltNavn="mottakerForvaltingsmelding"
          label="Nei, jeg vil sende melding senere eller behandle saken innen kort tid"
          value={IKKE_SEND}
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
