import * as Nav from "../../../navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as KV from "../../../kodeverk";

import "./sendForvaltningsMelding.css";

const { SEND_AVSENDER, SEND_BRUKER, IKKE_SEND } = KV.Koder.FORVALTNINGSMELDING_MOTTAKER;

interface SendForvaltningsMeldingProps {
  avsenderType: string;
  harRegistrertAdresse?: boolean;
}

const SendForvaltningsMelding = ({ avsenderType, harRegistrertAdresse }: SendForvaltningsMeldingProps) => {
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
      </Skjema.RadioGruppe>

      {!harRegistrertAdresse && (
        <Nav.AlertStripe className="feilmelding" type="advarsel">
          <Nav.Typo.Element>Melding kan ikke sendes automatisk pga. manglende eller ugyldig adresse</Nav.Typo.Element>
          <ul>
            <li>Avsender må enten registrere adresse i Folkeregisteret eller kontaktadresse via nav.no.</li>
          </ul>
        </Nav.AlertStripe>
      )}
    </div>
  );
};

export default SendForvaltningsMelding;
