import React, { FormEventHandler } from "react";
import { connect, ConnectedProps } from "react-redux";
import { reduxForm, InjectedFormProps } from "redux-form";
import { RootState } from "AppTypes";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";

import * as KV from "../../kodeverk";

import Menypanel from "../menypanel";

import { behandlingsgrunnlagSelectors, behandlingsgrunnlagOperations } from "../../ducks/behandlingsgrunnlag";

const mapStateToProps = (state: RootState) => ({
  initialValues: {
    oppgittAdresseTilleggsnavn: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).tilleggsnavn,
    oppgittAdresseGatenavn: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).gatenavn,
    oppgittAdresseHusnummerEtasjeLeilighet:
      behandlingsgrunnlagSelectors.BostedAdresseSelector(state).husnummerEtasjeLeilighet,
    oppgittAdresseRegion: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).region,
    oppgittAdressePostboks: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).postboks,
    oppgittAdressePostnummer: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).postnummer,
    oppgittAdressePoststed: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).poststed,
    oppgittAdresseLand: behandlingsgrunnlagSelectors.BostedAdresseSelector(state).landkode,
  },
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => ({
  lagreSoknad: () => dispatch(behandlingsgrunnlagOperations.lagre()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type RegistreringProps = PropsFromRedux & {
  startOgVisOppfriskModal: () => void;
};

const Registrering = ({
  lagreSoknad,
  startOgVisOppfriskModal,
}: RegistreringProps & InjectedFormProps<KV.Form.RegistreringPanelerFormData, RegistreringProps>) => {
  const submitHandler: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
  };

  const lagreSoknadOgOppfriskSaksopplysninger = async () => {
    await lagreSoknad();
    startOgVisOppfriskModal();
  };

  return (
    <form name="registrering" id="soknad" onSubmit={submitHandler}>
      <Menypanel lagreSoknadOgOppfriskSaksopplysninger={lagreSoknadOgOppfriskSaksopplysninger} />
    </form>
  );
};

const MenypanelForm = reduxForm<KV.Form.RegistreringPanelerFormData, RegistreringProps>({
  form: KV.Form.REGISTRERING_PANELER,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})(Registrering);

export default connector(MenypanelForm);
