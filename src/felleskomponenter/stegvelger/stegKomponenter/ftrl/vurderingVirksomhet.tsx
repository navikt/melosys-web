import React, { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { change, getFormValues, reduxForm } from "redux-form";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { OppsummertFaktaVirksomheter } from "Domene";

import * as Nav from "../../../../utils/navFrontend";
import * as Mui from "../../../../felleskomponenter/ui";
import * as KV from "../../../../kodeverk";

import { lagYupToReduxformErrorMapper, Skjemaer as YupSkjemaer } from "../../../../yup";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { oppsummertfaktaOperations, oppsummertfaktaSelectors } from "../../../../ducks/oppsummertfakta";
import { behandlingsgrunnlagOperations } from "../../../../ducks/behandlingsgrunnlag";

import "./vurderingVirksomhet.css";
import { formSelectors } from "../../../../ducks/form";

const mapStateToProps = (state: RootState) => ({
  virksomheterListe: behandlingerSelectors.AlleVirksomheterSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  formValues: getFormValues(KV.Form.VIRKSOMHET)(state),
  initialValues: {
    valgteVirksomheter: oppsummertfaktaSelectors.VirksomhetIDerSelector(state),
  },
  formIsValid: formSelectors.VurderVirksomhetFormValid(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  hentOppsummertFakta: (behandlingID: number) => dispatch(oppsummertfaktaOperations.hentOppsummertFakta(behandlingID)),
  sendVirksomheter: (behandlingID: number, virksomheter: OppsummertFaktaVirksomheter) =>
    dispatch(oppsummertfaktaOperations.sendVirksomheter(behandlingID, virksomheter)),
  hentBehandlingsgrunnlag: (behandlingID: number) => dispatch(behandlingsgrunnlagOperations.hent(behandlingID)),
  changeValgteVirksomheter: (data: string[]) => dispatch(change(KV.Form.VIRKSOMHET, "valgteVirksomheter", data)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreft: () => void;
  redigerbart: boolean;
  tilbake: () => void;
  formValues: {
    valgteVirksomheter?: string[];
  };
}

const VurderingVirksomhet = ({
  behandlingID,
  bekreft,
  changeValgteVirksomheter,
  formIsValid,
  formValues,
  hentBehandlingsgrunnlag,
  hentOppsummertFakta,
  redigerbart,
  sendVirksomheter,
  tilbake,
  virksomheterListe,
}: Props & PropsFromRedux) => {
  const [erBehandlingsgrunnlagLastetInn, setErBehandlingsgrunnlagLastetInn] = useState(false);
  const hjelpetekst =
    "Velg virksomhet søker er ansatt av og arbeider for i søknadsperioden. Det er mulig å velge flere virksomheter om søker har mer enn ett arbeidsforhold. " +
    'Hvis søker arbeider for en virksomhet som ikke er synlig her, må du legge den til i sidemenyen under "Arbeidsgiver/virksomhet".';

  const lastInnBehandlingsgrunnlag = async () => {
    await hentBehandlingsgrunnlag(behandlingID);
    setErBehandlingsgrunnlagLastetInn(true);
  };

  useEffect(() => {
    lastInnBehandlingsgrunnlag();
    return () => {
      hentOppsummertFakta(behandlingID);
    };
  }, []);

  const handleFortsett = () => {
    if (formValues && formValues.valgteVirksomheter) {
      sendVirksomheter(behandlingID, { virksomhetIDer: formValues.valgteVirksomheter });
      bekreft();
    }
  };

  if (!erBehandlingsgrunnlagLastetInn || !formValues) {
    return null;
  }

  return (
    <div className="vurderingVirksomhet">
      <Nav.typo.Undertittel className="undertittel">
        Velg virksomhet
        <Nav.Hjelpetekst className="hjelpetekst" tittel={hjelpetekst} type={Nav.PopoverOrientering.Hoyre}>
          {hjelpetekst}
        </Nav.Hjelpetekst>
      </Nav.typo.Undertittel>

      <Mui.Checkboxgruppe
        muligeValg={virksomheterListe}
        onChange={(checkedVirksomheter) => changeValgteVirksomheter(checkedVirksomheter)}
        disabled={!redigerbart}
        defaultValg={formValues.valgteVirksomheter}
      />

      <div className="fane__knapplinje">
        <Nav.Knapp mini className="fane__navigasjonsknapp" onClick={tilbake}>
          Tilbake
        </Nav.Knapp>
        <Nav.Hovedknapp mini disabled={!formIsValid} className="fane__navigasjonsknapp" onClick={handleFortsett}>
          Fortsett
        </Nav.Hovedknapp>
      </div>
    </div>
  );
};

const VurderingVirksomhetForm = reduxForm<{}, PropsFromRedux & Props>({
  form: KV.Form.VIRKSOMHET,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values) => lagYupToReduxformErrorMapper(YupSkjemaer.vurdering_virksomhet)(values),
})(VurderingVirksomhet);

export default connector(VurderingVirksomhetForm);
