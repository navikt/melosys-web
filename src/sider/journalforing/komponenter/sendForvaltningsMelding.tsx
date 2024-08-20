import * as Nav from "../../../navFrontend";
import * as KV from "../../../kodeverk";
import MKV from "../../../melosyskodeverk";

import "./sendForvaltningsMelding.css";
import { useEffect, useState } from "react";
import * as Utils from "../../../utils";

const { BRUKER, AVSENDER, INGEN } = MKV.Koder.forvaltningsmeldingMottaker;

interface AdresseOpplysning {
  harBrukerAdresse: boolean | false;
  harAvsenderAdresse: boolean | false;
}

interface SendForvaltningsMeldingProps {
  avsenderType: string;
  adresseOpplysninger: AdresseOpplysning;
  settFeltInnhold: (felt: string, innhold: any) => void;
}

enum feilmeldingTyper {
  BRUKER_MANGLER_ADRESSE = "Avsender må enten registrere adresse i Folkeregisteret eller kontaktadresse via nav.no.",
}

const SendForvaltningsMelding = ({
  avsenderType,
  adresseOpplysninger,
  settFeltInnhold,
}: SendForvaltningsMeldingProps) => {
  const [mottaker, setMottaker] = useState(adresseOpplysninger.harBrukerAdresse ? BRUKER : INGEN);
  const [feilmeldinger, setFeilmeldinger] = useState<feilmeldingTyper[]>([]);

  useEffect(() => {
    if (!adresseOpplysninger.harBrukerAdresse) {
      setFeilmeldinger([feilmeldingTyper.BRUKER_MANGLER_ADRESSE]);
    }

    settFeltInnhold("forvaltningsmeldingMottaker", mottaker);
  }, [mottaker]);

  return (
    adresseOpplysninger && (
      <div className="sendForvaltningsmelding">
        <Nav.RadioGroup
          onChange={setMottaker}
          legend="Skal melding om saksbehandlingtid sendes automatisk?"
          defaultValue={mottaker}
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

        {feilmeldinger.length > 0 && (
          <Nav.Alert className="feilmelding" variant="warning">
            <Nav.Typo.Element>Melding kan ikke sendes automatisk pga. manglende eller ugyldig adresse</Nav.Typo.Element>
            <ul>
              {feilmeldinger.map((feilmelding) => {
                return <li key={Utils._uuid()}>{feilmelding}</li>;
              })}
            </ul>
          </Nav.Alert>
        )}
      </div>
    )
  );
};

export default SendForvaltningsMelding;
