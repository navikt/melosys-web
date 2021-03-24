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
  feltVerdi?: boolean | null;
}

const SporsmalOgSvar = ({ sporsmal, feltVerdi }: SporsmalOgSvarProps) => {
  const feltString = Utils._isNil(feltVerdi) ? "-" : Utils._capitalize(Utils.streng.boolTilNorsk(feltVerdi));

  return (
    <Nav.Row className="row">
      <Nav.Column xs="8">
        <Nav.typo.Normaltekst>{sporsmal}</Nav.typo.Normaltekst>
      </Nav.Column>
      <Nav.Column xs="4">
        <Nav.typo.Element>{feltString}</Nav.typo.Element>
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
    <SporsmalOgSvar sporsmal={Sporsmal.erErstatningTidligereUtsendte} feltVerdi={erErstatningTidligereUtsendte} />
    <SporsmalOgSvar sporsmal={Sporsmal.erUtsendelseForOppdragIUtlandet} feltVerdi={erUtsendelseForOppdragIUtlandet} />
    <SporsmalOgSvar sporsmal={Sporsmal.erDrattPaaEgetInitiativ} feltVerdi={erDrattPaaEgetInitiativ} />
    <SporsmalOgSvar sporsmal={Sporsmal.erFortsattAnsattEtterOppdraget} feltVerdi={erFortsattAnsattEtterOppdraget} />
    <SporsmalOgSvar sporsmal={Sporsmal.erAnsattForOppdragIUtlandet} feltVerdi={erAnsattForOppdragIUtlandet} />
  </div>
);

export default connector(IkkeEditerbareUtenlandsoppdragetSporsmal);
