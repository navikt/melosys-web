import { formValueSelector } from "redux-form";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import classNames from "classnames";

import * as Nav from "../../../../../navFrontend";
import * as KV from "../../../../../kodeverk";
import * as Utils from "../../../../../utils";

import "./ikkeEditerbareArbeidPaaLandSporsmal.css";

const soknadFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.SOKNAD);

const mapStateToProps = (state: RootState) => {
  const arbeidPaaLand = soknadFormValueSelector(state, "arbeidPaaLand") as KV.Form.ArbeidsstedPaaLand;

  return {
    erHjemmekontor: arbeidPaaLand.erHjemmekontor,
    erFastArbeidssted: arbeidPaaLand.erFastArbeidssted,
  };
};

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

const IkkeEditerbareArbeidPaaLandSporsmal = ({ erFastArbeidssted, erHjemmekontor }: PropsFromRedux) => {
  const erFastArbeidsstedString = Utils._isNil(erFastArbeidssted)
    ? ""
    : Utils._capitalize(Utils.streng.boolTilNorsk(erFastArbeidssted));
  const erHjemmekontorString = Utils._isNil(erHjemmekontor)
    ? ""
    : Utils._capitalize(Utils.streng.boolTilNorsk(erHjemmekontor));

  const cls = classNames("ikke-editerbare-arbeidpaaland-sporsmal");

  return (
    <div className={cls}>
      <Nav.Typo.Element>Opplysninger om arbeidssted</Nav.Typo.Element>
      <Nav.Row className="row">
        <Nav.Column xs="8">
          <Nav.BodyLong size="small">Vil arbeidstakeren ha et fast arbeidssted i utlandet?</Nav.BodyLong>
        </Nav.Column>
        <Nav.Column xs="4">
          <Nav.Typo.Element>{erFastArbeidsstedString}</Nav.Typo.Element>
        </Nav.Column>
      </Nav.Row>
      <Nav.Row className="row">
        <Nav.Column xs="8">
          <Nav.BodyLong size="small">Vil arbeidstakeren kun eller hovedsaklig arbeide på hjemmekontor?</Nav.BodyLong>
        </Nav.Column>
        <Nav.Column xs="4">
          <Nav.Typo.Element>{erHjemmekontorString}</Nav.Typo.Element>
        </Nav.Column>
      </Nav.Row>
    </div>
  );
};

export default connector(IkkeEditerbareArbeidPaaLandSporsmal);
