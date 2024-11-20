import { formValueSelector } from "redux-form";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";

import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../skjema";
import * as KV from "../../../../kodeverk";
import * as Tags from "../../tags";

import EditerbartElement, { Status } from "../editerbartElement";
import RedigerbarSamletVirksomhetINorge from "./redigerbarSamletVirksomhetINorge";
import IkkeRedigerbarSamletVirksomhetINorge from "./ikkeRedigerbarSamletVirksomhetINorge";

import { mottatteOpplysningerOperations } from "../../../../ducks/mottatteOpplysninger";

import "./virksomhetenINorge.css";

const soknadFormValueSelector = formValueSelector<KV.Form.SoknadFormData>(KV.Form.SOKNAD);

const mapStateToProps = (state: RootState) => {
  const juridiskArbeidsgiverNorge = soknadFormValueSelector(
    state,
    "juridiskArbeidsgiverNorge"
  ) as KV.Form.JuridiskArbeidsgiverNorge;

  return {
    erOffentligVirksomhet: juridiskArbeidsgiverNorge.erOffentligVirksomhet,
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterMottatteOpplysninger: () => dispatch(mottatteOpplysningerOperations.oppdaterState()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type VirksomhetenINorgeProps = PropsFromRedux & {
  visArbeidsforholdRolleEtiketter: boolean;
  redigerbart: boolean;
};

const VirksomhetenINorge = ({
  redigerbart,
  visArbeidsforholdRolleEtiketter,
  erOffentligVirksomhet,
  oppdaterMottatteOpplysninger,
}: VirksomhetenINorgeProps) => {
  const lagreHandler = () => {
    oppdaterMottatteOpplysninger();
    return true;
  };

  return (
    <Nav.Container fluid className="virksomheten-i-norge">
      <Nav.Row className="tittel">
        <Nav.Column xs="12" className="col">
          <Nav.Heading size="small">{KV.Menypunkter.OmVirksomhetenINorge.tittel}</Nav.Heading>
          {visArbeidsforholdRolleEtiketter && <Tags.ArbeidsgiversDel />}
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <Nav.Row className="sporsmal-og-svar">
            <Skjema.RadioGroup
              legend="Er arbeidsgiver en offentlig virksomhet?"
              readOnly={!redigerbart}
              name="juridiskArbeidsgiverNorge.erOffentligVirksomhet"
            >
              <Nav.Radio value>Ja</Nav.Radio>
              <Nav.Radio value={false}>Nei</Nav.Radio>
            </Skjema.RadioGroup>
          </Nav.Row>

          {erOffentligVirksomhet && (
            <Nav.BodyLong size="small" className="er-offentlig-virksomhet-hjelpetekst">
              Arbeidsgiveren opplyser å være en offentlig virksomhet, derfor har vi ikke bedt om opplysninger for å
              vurdere vesentlig virksomhet i Norge.
            </Nav.BodyLong>
          )}

          {erOffentligVirksomhet === false && (
            <Nav.Row>
              <Nav.Column xs="9">
                <EditerbartElement
                  redigerbart={redigerbart}
                  harData
                  tittel={KV.Menypunkter.OmVirksomhetenINorge.undertitler.samletVirksomhetINorge}
                  visLagreKnapp
                  onLagreClick={lagreHandler}
                  symbolsynlighet={{ [Status.RedigeringUtfort]: { bin: false, pencil: true } }}
                  redigererRender={() => <RedigerbarSamletVirksomhetINorge />}
                  redigeringUtfortRender={() => <IkkeRedigerbarSamletVirksomhetINorge />}
                />
              </Nav.Column>
            </Nav.Row>
          )}
        </Nav.Column>
      </Nav.Row>
    </Nav.Container>
  );
};

export default connector(VirksomhetenINorge);
