import React, { useCallback, useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { reduxForm, change, getFormValues } from "redux-form";

import * as Api from "../../../../services/api";
import * as KV from "../../../../kodeverk";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Nav from "../../../../utils/navFrontend";
import * as Utils from "../../../../utils";

import { formSelectors } from "../../../../ducks/form";
import { lagYupToReduxformErrorMapper } from "../../../../yup";
import vurdering_avklar_virksomhet from "./vurderingAvklarVirksomhetSchema";

import "./vurderingAvklarVirksomhet.css";

const mapStateToProps = (state: RootState, ownProps: Props) => ({
  virksomheterListe:
    ownProps.flyt.data?.virksomheter?.map((virksomhet: Api.Trygdeavtale.Virksomhet) => ({
      kode: virksomhet.orgId,
      term: virksomhet.navn,
    })) || [],
  avklarVirksomhetSteg: ownProps.flyt.steg?.find((steg) => steg.navn === KV.Koder.StegNavn.AVKLAR_VIRKSOMHET),
  formValues: getFormValues(KV.Form.Trygdeavtale.AVKLAR_VIRKSOMHET)(state),
  initialValues: {
    virksomheter: ownProps.flyt.resultat?.virksomheter,
  },
  formIsValid: formSelectors.TrygdeavtaleAvklarVirksomhetFormValidSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  changeValgteVirksomheter: (data: string[]) =>
    dispatch(change(KV.Form.Trygdeavtale.AVKLAR_VIRKSOMHET, "virksomheter", data)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface FormValuesProps {
  virksomheter?: string[];
}
interface Props {
  fortsett: () => void;
  formValues: FormValuesProps;
  redigerbart: boolean;
  tilbake: () => void;
  oppdaterStegData: (data: Api.Trygdeavtale.FlytReqDto) => void;
  flyt: Api.Trygdeavtale.FlytResDto;
}

const VurderingAvklarVirksomhet = ({
  avklarVirksomhetSteg,
  changeValgteVirksomheter,
  flyt,
  formValues,
  formIsValid,
  fortsett,
  redigerbart,
  oppdaterStegData,
  tilbake,
  virksomheterListe,
}: PropsFromRedux & Props) => {
  const hjelpetekst =
    "Velg virksomhet søker er ansatt av og arbeider for i søknadsperioden. Det er mulig å velge flere virksomheter om søker har mer enn ett arbeidsforhold. " +
    'Hvis søker arbeider for en virksomhet som ikke er synlig her, må du legge den til i sidemenyen under "Arbeidsgiver/virksomhet".';

  const sendOppdatertStegData = (data: { formValues: FormValuesProps; formIsValid: boolean }) => {
    if (data.formIsValid && data.formValues) {
      oppdaterStegData({
        resultat: { ...flyt.resultat, virksomheter: data.formValues.virksomheter || [] },
      });
    }
  };
  const debouncedLagreStegData = useCallback(Utils._debounce(sendOppdatertStegData, 500), []);

  useEffect(() => {
    if (redigerbart) debouncedLagreStegData({ formValues, formIsValid });
  }, [formValues, formIsValid]);

  return (
    <div className="vurderingAvklarVirksomhet">
      <Nav.Typo.Undertittel className="undertittel">
        Velg virksomhet
        <Nav.Hjelpetekst className="hjelpetekst" tittel={hjelpetekst} type={Nav.PopoverOrientering.Hoyre}>
          {hjelpetekst}
        </Nav.Hjelpetekst>
      </Nav.Typo.Undertittel>

      <Mui.Checkboxgruppe
        muligeValg={virksomheterListe}
        onChange={(checkedVirksomheter) => changeValgteVirksomheter(checkedVirksomheter)}
        disabled={!redigerbart}
        defaultValg={formValues?.virksomheter || []}
      />

      <div className="fane__knapplinje">
        <Nav.Knapp mini disabled={!redigerbart} className="fane__navigasjonsknapp" onClick={tilbake}>
          Tilbake
        </Nav.Knapp>
        <Nav.Hovedknapp
          mini
          disabled={avklarVirksomhetSteg?.status !== "FERDIG" || !formIsValid || !redigerbart}
          className="fane__navigasjonsknapp"
          onClick={fortsett}
        >
          Fortsett
        </Nav.Hovedknapp>
      </div>
    </div>
  );
};

const VurderingAvklarVirksomhetForm = reduxForm<{}, PropsFromRedux & Props>({
  form: KV.Form.Trygdeavtale.AVKLAR_VIRKSOMHET,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(vurdering_avklar_virksomhet),
})(VurderingAvklarVirksomhet);

export default connector(VurderingAvklarVirksomhetForm);
