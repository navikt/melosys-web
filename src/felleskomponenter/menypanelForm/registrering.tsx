import { FormEventHandler } from "react";
import { connect, ConnectedProps } from "react-redux";
import { reduxForm, InjectedFormProps } from "redux-form";
import { RootState } from "AppTypes";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";

import * as KV from "../../kodeverk";

import Menypanel from "../menypanel";

import { mottatteOpplysningerSelectors, mottatteOpplysningerOperations } from "../../ducks/mottatteOpplysninger";

const mapStateToProps = (state: RootState) => ({
  initialValues: {
    oppgittAdresseTilleggsnavn: mottatteOpplysningerSelectors.BostedAdresseSelector(state).tilleggsnavn,
    oppgittAdresseGatenavn: mottatteOpplysningerSelectors.BostedAdresseSelector(state).gatenavn,
    oppgittAdresseHusnummerEtasjeLeilighet:
      mottatteOpplysningerSelectors.BostedAdresseSelector(state).husnummerEtasjeLeilighet,
    oppgittAdresseRegion: mottatteOpplysningerSelectors.BostedAdresseSelector(state).region,
    oppgittAdressePostboks: mottatteOpplysningerSelectors.BostedAdresseSelector(state).postboks,
    oppgittAdressePostnummer: mottatteOpplysningerSelectors.BostedAdresseSelector(state).postnummer,
    oppgittAdressePoststed: mottatteOpplysningerSelectors.BostedAdresseSelector(state).poststed,
    oppgittAdresseLand: mottatteOpplysningerSelectors.BostedAdresseSelector(state).landkode,
  },
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => ({
  lagreSoknad: () => dispatch(mottatteOpplysningerOperations.lagre()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type RegistreringProps = PropsFromRedux & {
  startOgVisOppfriskModal: () => void;
};

function Registrering({
  lagreSoknad,
  startOgVisOppfriskModal,
}: RegistreringProps & InjectedFormProps<KV.Form.RegistreringPanelerFormData, RegistreringProps>) {
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
}

const MenypanelForm = reduxForm<KV.Form.RegistreringPanelerFormData, RegistreringProps>({
  form: KV.Form.REGISTRERING_PANELER,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
})(Registrering);

export default connector(MenypanelForm);
