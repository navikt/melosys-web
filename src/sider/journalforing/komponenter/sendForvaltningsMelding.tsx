import * as Nav from "../../../navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as KV from "../../../kodeverk";
import MKV from "../../../melosyskodeverk";

import "./sendForvaltningsMelding.css";

const { BRUKER, AVSENDER, INGEN } = MKV.Koder.forvaltningsmeldingMottaker;

interface SendForvaltningsMeldingProps {
  avsenderType: string;
  harRegistrertAdresse?: boolean;
}

const SendForvaltningsMelding = ({ avsenderType, harRegistrertAdresse }: SendForvaltningsMeldingProps) => {
  var defaultChecked = BRUKER;
  if (!harRegistrertAdresse) {
    defaultChecked = INGEN;
  }
  return (
    <div className="sendForvaltningsmelding">
      <Nav.RadioGroup
        legend={"Skal melding om saksbehandlingtid sendes automatisk?"}
        defaultValue={defaultChecked}
        name="meldingvalg"
        size="small"
      >
        <Nav.Radio disabled={!harRegistrertAdresse} value={BRUKER}>
          Ja, melding skal sendes automatisk til <b>bruker</b>
        </Nav.Radio>
        {avsenderType === KV.AvsenderTyper.ANNEN_PERSON_ELLER_VIRKSOMHET ? (
          <Nav.Radio disabled={!harRegistrertAdresse} value={AVSENDER}>
            Ja, melding skal sendes automatisk til <b>avsender</b>
          </Nav.Radio>
        ) : null}
        <Nav.Radio value={INGEN}>Nei, jeg vil sende melding senere eller behandle saken innen kort tid</Nav.Radio>
      </Nav.RadioGroup>

      {!harRegistrertAdresse && (
        <Nav.Alert className="feilmelding" variant="warning">
          <Nav.Typo.Element>Melding kan ikke sendes automatisk pga. manglende eller ugyldig adresse</Nav.Typo.Element>
          <ul>
            <li>Avsender må enten registrere adresse i Folkeregisteret eller kontaktadresse via nav.no.</li>
          </ul>
        </Nav.Alert>
      )}
    </div>
  );
};

export default SendForvaltningsMelding;
