import React, { ReactNode } from "react";
import { formValueSelector } from "redux-form";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";

import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../skjema";
import * as KV from "../../../../kodeverk";
import * as Etiketter from "../../etiketter";

import EditerbartElement, { Status } from "../editerbartElement";
import RedigerbarSamletVirksomhetINorge from "./redigerbarSamletVirksomhetINorge";
import IkkeRedigerbarSamletVirksomhetINorge from "./ikkeRedigerbarSamletVirksomhetINorge";

import { mottatteOpplysningerOperations } from "../../../../ducks/mottatteOpplysninger";

import "./virksomhetenINorge.css";

interface RadioknappSvarProps {
  feltNavn: string;
  redigerbart: boolean;
}

const RadioknappSvar = ({ feltNavn, redigerbart }: RadioknappSvarProps) => (
  <>
    <Skjema.Radio disabled={!redigerbart} label="Ja" feltNavn={feltNavn} value />
    <Skjema.Radio disabled={!redigerbart} label="Nei" feltNavn={feltNavn} value={false} />
  </>
);

interface SporsmalOgSvarProps {
  sporsmal: string;
  svar: ReactNode;
}

const SporsmalOgSvar = ({ sporsmal, svar }: SporsmalOgSvarProps) => {
  return (
    <Nav.Row className="sporsmal-og-svar">
      <fieldset>
        <Nav.Column xs="7">
          <legend>
            <Nav.Typo.Normaltekst>{sporsmal}</Nav.Typo.Normaltekst>
          </legend>
        </Nav.Column>
        <Nav.Column xs="5" className="col">
          {svar}
        </Nav.Column>
      </fieldset>
    </Nav.Row>
  );
};

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
          <Nav.Typo.Innholdstittel>{KV.Menypunkter.OmVirksomhetenINorge.tittel}</Nav.Typo.Innholdstittel>
          {visArbeidsforholdRolleEtiketter && <Etiketter.ArbeidsgiversDel />}
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="12">
          <SporsmalOgSvar
            sporsmal="Er arbeidsgiver en offentlig virksomhet?"
            svar={
              <RadioknappSvar redigerbart={redigerbart} feltNavn="juridiskArbeidsgiverNorge.erOffentligVirksomhet" />
            }
          />

          {erOffentligVirksomhet && (
            <Nav.Typo.Normaltekst className="er-offentlig-virksomhet-hjelpetekst">
              Arbeidsgiveren opplyser å være en offentlig virksomhet, derfor har vi ikke bedt om opplysninger for å
              vurdere vesentlig virksomhet i Norge.
            </Nav.Typo.Normaltekst>
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
