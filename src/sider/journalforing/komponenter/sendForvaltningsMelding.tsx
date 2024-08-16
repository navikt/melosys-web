import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";
import MKV from "../../../melosyskodeverk";

import "./sendForvaltningsMelding.css";
import { useState } from "react";

const { BRUKER, AVSENDER, INGEN } = MKV.Koder.forvaltningsmeldingMottaker;

interface SendForvaltningsMeldingProps {
  avsenderType: string;
  adresseOpplysninger: any; // TODO fix thomas
  settFeltInnhold: (felt: string, innhold: any) => void;
}

const SendForvaltningsMelding = ({
  avsenderType,
  adresseOpplysninger,
  settFeltInnhold,
}: SendForvaltningsMeldingProps) => {
  const [mottaker, setMottaker] = useState("");
  const endreForvaltningsmeldingMottaker = (value: string) => {
    settFeltInnhold("forvaltningsmeldingMottaker", value);
    setMottaker(value);
  };

  return (
    adresseOpplysninger && (
      <div className="sendForvaltningsmelding">
        <Nav.RadioGroup
          onChange={endreForvaltningsmeldingMottaker}
          legend="Skal melding om saksbehandlingtid sendes automatisk?"
          defaultValue={adresseOpplysninger.harBrukerAdresse ? BRUKER : INGEN}
          name="forvaltningsmeldingMottaker"
          size="small"
        >
          <Nav.Radio disabled={!adresseOpplysninger.harBrukerAdresse} value={BRUKER}>
            Ja, melding skal sendes automatisk til <b>bruker</b>
          </Nav.Radio>
          {avsenderType === KV.AvsenderTyper.ANNEN_PERSON_ELLER_VIRKSOMHET ? (
            <Nav.Radio disabled={!adresseOpplysninger.harAvsenderAdresse} value={AVSENDER}>
              Ja, melding skal sendes automatisk til <b>avsender</b>
            </Nav.Radio>
          ) : null}
          <Nav.Radio value={INGEN}>Nei, jeg vil sende melding senere eller behandle saken innen kort tid</Nav.Radio>
        </Nav.RadioGroup>

        {(mottaker === BRUKER && adresseOpplysninger.harBrukerAdresse === false) ||
          (mottaker === AVSENDER && adresseOpplysninger.harAvsenderAdresse === false && (
            <Nav.Alert className="feilmelding" variant="warning">
              <Nav.Typo.Element>
                Melding kan ikke sendes automatisk pga. manglende eller ugyldig adresse
              </Nav.Typo.Element>
              <ul>
                <li>Avsender må enten registrere adresse i Folkeregisteret eller kontaktadresse via nav.no.</li>
              </ul>
            </Nav.Alert>
          ))}
      </div>
    )
  );
};

export default SendForvaltningsMelding;
