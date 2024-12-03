import { formValueSelector } from "redux-form";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";

import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";

import "./ikkeRedigerbarSamletVirksomhetINorge.css";

interface LabelOgSvarProps {
  label: string;
  svar?: string;
  percent?: boolean;
}

const LabelOgSvar = ({ label, svar, percent }: LabelOgSvarProps) => (
  <Nav.Row>
    <Nav.Column xs="10">
      <Nav.BodyLong size="small">{label}</Nav.BodyLong>
    </Nav.Column>
    <Nav.Column xs="2">
      <Nav.BodyLong weight="semibold" size="small">
        {svar || "-"}
        {percent && svar && String.fromCharCode(37)}
      </Nav.BodyLong>
    </Nav.Column>
  </Nav.Row>
);

const soknadFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.SOKNAD);

const mapStateToProps = (state: RootState) => {
  const juridiskArbeidsgiverNorge = soknadFormValueSelector(
    state,
    "juridiskArbeidsgiverNorge",
  ) as KV.Form.JuridiskArbeidsgiverNorge;

  return {
    juridiskArbeidsgiverNorge,
  };
};

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

const IkkeRedigerbarSamletVirksomhetINorge = ({ juridiskArbeidsgiverNorge }: PropsFromRedux) => {
  return (
    <div className="ikke-redigerbar-samlet-virksomhet-i-norge">
      <LabelOgSvar label="Antall ansatte" svar={juridiskArbeidsgiverNorge.antallAnsatte} />
      <LabelOgSvar label="Antall administrativt ansatte" svar={juridiskArbeidsgiverNorge.antallAdmAnsatte} />
      <LabelOgSvar label="Antall utsendte arbeidstakere" svar={juridiskArbeidsgiverNorge.antallUtsendte} />
      <LabelOgSvar
        label="Andel ansatte rekruttert i Norge"
        svar={juridiskArbeidsgiverNorge.andelRekruttertINorge}
        percent
      />
      <LabelOgSvar
        label="Andel omsetning opptjent i Norge"
        svar={juridiskArbeidsgiverNorge.andelOmsetningINorge}
        percent
      />
      <LabelOgSvar
        label="Andel oppdragskontrakter inngått i Norge"
        svar={juridiskArbeidsgiverNorge.andelKontrakterINorge}
        percent
      />
      <LabelOgSvar label="Andel oppdrag utført i Norge" svar={juridiskArbeidsgiverNorge.andelOppdragINorge} percent />
    </div>
  );
};

export default connector(IkkeRedigerbarSamletVirksomhetINorge);
