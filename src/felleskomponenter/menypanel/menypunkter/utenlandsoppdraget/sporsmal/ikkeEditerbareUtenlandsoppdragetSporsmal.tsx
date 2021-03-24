import React from "react";
import { formValueSelector } from "redux-form";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";

import * as Nav from "../../../../../utils/navFrontend";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";
import * as Sporsmal from "./sporsmal";

interface SporsmalOgSvarProps {
  sporsmal: string;
  svar?: boolean | null;
}

const SporsmalOgSvar = ({ sporsmal, svar }: SporsmalOgSvarProps) => {
  const svarString = Utils._isNil(svar) ? "-" : Utils._capitalize(Utils.streng.boolTilNorsk(svar));

  return (
    <Nav.Row>
      <Nav.Column xs="8">
        <Nav.typo.Normaltekst>{sporsmal}</Nav.typo.Normaltekst>
      </Nav.Column>
      <Nav.Column xs="4">
        <Nav.typo.Element>{svarString}</Nav.typo.Element>
      </Nav.Column>
    </Nav.Row>
  );
};

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
}: PropsFromRedux) => (
  <div>
    <SporsmalOgSvar sporsmal={Sporsmal.erErstatningTidligereUtsendte} svar={erErstatningTidligereUtsendte} />
    <SporsmalOgSvar sporsmal={Sporsmal.erUtsendelseForOppdragIUtlandet} svar={erUtsendelseForOppdragIUtlandet} />
    <SporsmalOgSvar sporsmal={Sporsmal.erDrattPaaEgetInitiativ} svar={erDrattPaaEgetInitiativ} />
    <SporsmalOgSvar sporsmal={Sporsmal.erFortsattAnsattEtterOppdraget} svar={erFortsattAnsattEtterOppdraget} />
    <SporsmalOgSvar sporsmal={Sporsmal.erAnsattForOppdragIUtlandet} svar={erAnsattForOppdragIUtlandet} />
  </div>
);

export default connector(IkkeEditerbareUtenlandsoppdragetSporsmal);
