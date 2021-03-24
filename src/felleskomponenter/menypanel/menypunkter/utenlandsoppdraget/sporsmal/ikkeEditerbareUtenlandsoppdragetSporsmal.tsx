import React, { ReactNode } from "react";
import { formValueSelector } from "redux-form";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import * as Nav from "../../../../../utils/navFrontend";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";
import * as Sporsmal from "./sporsmal";

import "./ikkeEditerbareUtenlandsoppdragetSporsmal.css";

interface RadioknappSvarProps {
  svar: boolean | null | undefined;
}

const RadioknappSvar = ({ svar }: RadioknappSvarProps) => {
  const svarString = Utils._isNil(svar) ? "-" : Utils._capitalize(Utils.streng.boolTilNorsk(svar));

  return <Nav.typo.Element>{svarString}</Nav.typo.Element>;
};

interface PeriodeSvarProps {
  fom: string | undefined;
  tom: string | undefined;
}

const PeriodeSvar = ({ fom, tom }: PeriodeSvarProps) => (
  <Nav.typo.Element>
    {fom} - {tom}
  </Nav.typo.Element>
);

interface SporsmalOgSvarProps {
  sporsmal: string;
  svar: ReactNode;
}

const SporsmalOgSvar = ({ sporsmal, svar }: SporsmalOgSvarProps) => (
  <Nav.Row>
    <Nav.Column xs="8">
      <Nav.typo.Normaltekst>{sporsmal}</Nav.typo.Normaltekst>
    </Nav.Column>
    <Nav.Column xs="4">{svar}</Nav.Column>
  </Nav.Row>
);

const soknadFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.SOKNAD);

const mapStateToProps = (state: RootState) => {
  const utenlandsoppdraget = soknadFormValueSelector(state, "utenlandsoppdraget") as KV.Form.Utenlandsoppdraget;

  return {
    erUtsendelseForOppdragIUtlandet: utenlandsoppdraget.erUtsendelseForOppdragIUtlandet,
    erAnsattForOppdragIUtlandet: utenlandsoppdraget.erAnsattForOppdragIUtlandet,
    erFortsattAnsattEtterOppdraget: utenlandsoppdraget.erFortsattAnsattEtterOppdraget,
    erDrattPaaEgetInitiativ: utenlandsoppdraget.erDrattPaaEgetInitiativ,
    erErstatningTidligereUtsendte: utenlandsoppdraget.erErstatningTidligereUtsendte,
    samletUtsendingsperiode: utenlandsoppdraget.samletUtsendingsperiode,
  };
};

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

const IkkeEditerbareUtenlandsoppdragetSporsmal = ({
  erUtsendelseForOppdragIUtlandet,
  erAnsattForOppdragIUtlandet,
  erFortsattAnsattEtterOppdraget,
  erDrattPaaEgetInitiativ,
  erErstatningTidligereUtsendte,
  samletUtsendingsperiode,
}: PropsFromRedux) => (
  <div className="ikke-editerbare-utenlandsoppdrag-sporsmal">
    <SporsmalOgSvar
      sporsmal={Sporsmal.erErstatningTidligereUtsendte}
      svar={<RadioknappSvar svar={erErstatningTidligereUtsendte} />}
    />
    <SporsmalOgSvar
      sporsmal={Sporsmal.erUtsendelseForOppdragIUtlandet}
      svar={<RadioknappSvar svar={erUtsendelseForOppdragIUtlandet} />}
    />
    <SporsmalOgSvar
      sporsmal={Sporsmal.erDrattPaaEgetInitiativ}
      svar={<RadioknappSvar svar={erDrattPaaEgetInitiativ} />}
    />
    <SporsmalOgSvar
      sporsmal={Sporsmal.erFortsattAnsattEtterOppdraget}
      svar={<RadioknappSvar svar={erFortsattAnsattEtterOppdraget} />}
    />
    <SporsmalOgSvar
      sporsmal={Sporsmal.erAnsattForOppdragIUtlandet}
      svar={<RadioknappSvar svar={erAnsattForOppdragIUtlandet} />}
    />
    <SporsmalOgSvar
      sporsmal={Sporsmal.samletUtsendingsperiode}
      svar={<PeriodeSvar fom={samletUtsendingsperiode.fom} tom={samletUtsendingsperiode.tom} />}
    />
  </div>
);

export default connector(IkkeEditerbareUtenlandsoppdragetSporsmal);
