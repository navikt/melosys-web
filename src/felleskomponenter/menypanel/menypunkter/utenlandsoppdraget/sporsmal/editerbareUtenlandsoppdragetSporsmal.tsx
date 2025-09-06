import * as Nav from "../../../../../navFrontend";
import * as Skjema from "../../../../skjema";
import * as Sporsmal from "./sporsmal";

import "./editerbareUtenlandsoppdragetSporsmal.less";

interface SporsmalOgSvarProps {
  sporsmal: string;
  feltNavn: string;
}

function SporsmalOgSvar({ sporsmal, feltNavn }: SporsmalOgSvarProps) {
  return (
    <Nav.Row className="sporsmal-og-svar">
      <Skjema.RadioGroup legend={sporsmal} name={feltNavn}>
        <Nav.Radio value>Ja</Nav.Radio>
        <Nav.Radio value={false}>Nei</Nav.Radio>
      </Skjema.RadioGroup>
    </Nav.Row>
  );
}

function EditerbareUtenlandsoppdragetSporsmal() {
  return (
    <div className="editerbare-utenlandsoppdrag-sporsmal">
      <SporsmalOgSvar
        sporsmal={Sporsmal.erErstatningTidligereUtsendte}
        feltNavn="utenlandsoppdraget.erErstatningTidligereUtsendte"
      />
      <SporsmalOgSvar
        sporsmal={Sporsmal.erUtsendelseForOppdragIUtlandet}
        feltNavn="utenlandsoppdraget.erUtsendelseForOppdragIUtlandet"
      />
      <SporsmalOgSvar
        sporsmal={Sporsmal.erDrattPaaEgetInitiativ}
        feltNavn="utenlandsoppdraget.erDrattPaaEgetInitiativ"
      />
      <SporsmalOgSvar
        sporsmal={Sporsmal.erFortsattAnsattEtterOppdraget}
        feltNavn="utenlandsoppdraget.erFortsattAnsattEtterOppdraget"
      />
      <SporsmalOgSvar
        sporsmal={Sporsmal.erAnsattForOppdragIUtlandet}
        feltNavn="utenlandsoppdraget.erAnsattForOppdragIUtlandet"
      />

      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.BodyLong weight="semibold" size="small" className="utsendingsperiode__label">
            {Sporsmal.samletUtsendingsperiode}
          </Nav.BodyLong>
        </Nav.Column>
        <Nav.Column xs="6">
          <Skjema.Datovelger feltNavn="utenlandsoppdraget.samletUtsendingsperiode.fom" label="Fra og med" />
        </Nav.Column>
        <Nav.Column xs="6">
          <Skjema.Datovelger feltNavn="utenlandsoppdraget.samletUtsendingsperiode.tom" label="Til og med" />
        </Nav.Column>
      </Nav.Row>
    </div>
  );
}

export default EditerbareUtenlandsoppdragetSporsmal;
