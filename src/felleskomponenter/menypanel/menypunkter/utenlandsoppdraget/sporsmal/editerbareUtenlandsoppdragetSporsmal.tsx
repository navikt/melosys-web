import React, { ReactNode } from "react";
import { ColumnWidth } from "nav-frontend-grid";

import * as Nav from "../../../../../utils/navFrontend";
import * as Skjema from "../../../../skjema";
import * as Sporsmal from "./sporsmal";

import "./editerbareUtenlandsoppdragetSporsmal.css";
import DatovelgerSkjema from "../../../../skjema/datovelger";

interface RadioknappSvarProps {
  feltNavn: string;
}

const RadioknappSvar = ({ feltNavn }: RadioknappSvarProps) => (
  <>
    <Skjema.Radio label="Ja" feltNavn={feltNavn} value />
    <Skjema.Radio label="Nei" feltNavn={feltNavn} value={false} />
  </>
);

interface PeriodeSvarProps {
  fomFeltNavn: string;
  tomFeltNavn: string;
}

const PeriodeSvar = ({ fomFeltNavn, tomFeltNavn }: PeriodeSvarProps) => (
  <>
    <DatovelgerSkjema feltNavn={fomFeltNavn} label="Fra og med:" />
    <DatovelgerSkjema feltNavn={tomFeltNavn} label="Til og med:" />
  </>
);

interface SporsmalOgSvarProps {
  sporsmal: string;
  svar: ReactNode;
  sporsmalKolonneBredde?: ColumnWidth;
  svarKolonneBredde?: ColumnWidth;
}

const SporsmalOgSvar = ({
  sporsmal,
  svar,
  sporsmalKolonneBredde = "8",
  svarKolonneBredde = "4",
}: SporsmalOgSvarProps) => {
  return (
    <Nav.Row className="sporsmal-og-svar">
      <fieldset>
        <Nav.Column xs={sporsmalKolonneBredde}>
          <legend>
            <Nav.Typo.Normaltekst>{sporsmal}</Nav.Typo.Normaltekst>
          </legend>
        </Nav.Column>
        <Nav.Column xs={svarKolonneBredde} className="col">
          {svar}
        </Nav.Column>
      </fieldset>
    </Nav.Row>
  );
};

const EditerbareUtenlandsoppdragetSporsmal = () => {
  return (
    <div className="editerbare-utenlandsoppdrag-sporsmal">
      <SporsmalOgSvar
        sporsmal={Sporsmal.erErstatningTidligereUtsendte}
        svar={<RadioknappSvar feltNavn="utenlandsoppdraget.erErstatningTidligereUtsendte" />}
      />
      <SporsmalOgSvar
        sporsmal={Sporsmal.erUtsendelseForOppdragIUtlandet}
        svar={<RadioknappSvar feltNavn="utenlandsoppdraget.erUtsendelseForOppdragIUtlandet" />}
      />
      <SporsmalOgSvar
        sporsmal={Sporsmal.erDrattPaaEgetInitiativ}
        svar={<RadioknappSvar feltNavn="utenlandsoppdraget.erDrattPaaEgetInitiativ" />}
      />
      <SporsmalOgSvar
        sporsmal={Sporsmal.erFortsattAnsattEtterOppdraget}
        svar={<RadioknappSvar feltNavn="utenlandsoppdraget.erFortsattAnsattEtterOppdraget" />}
      />
      <SporsmalOgSvar
        sporsmal={Sporsmal.erAnsattForOppdragIUtlandet}
        svar={<RadioknappSvar feltNavn="utenlandsoppdraget.erAnsattForOppdragIUtlandet" />}
      />
      <SporsmalOgSvar
        sporsmal={Sporsmal.samletUtsendingsperiode}
        svar={
          <PeriodeSvar
            fomFeltNavn="utenlandsoppdraget.samletUtsendingsperiode.fom"
            tomFeltNavn="utenlandsoppdraget.samletUtsendingsperiode.tom"
          />
        }
        sporsmalKolonneBredde="6"
        svarKolonneBredde="6"
      />
    </div>
  );
};

export default EditerbareUtenlandsoppdragetSporsmal;
