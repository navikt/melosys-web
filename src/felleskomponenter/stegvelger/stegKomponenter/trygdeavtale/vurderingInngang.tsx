import React, { Fragment, useCallback, useEffect } from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { getFormValues, reduxForm } from "redux-form";

import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../utils/navFrontend";
import * as Skjema from "../../../skjema";
import * as Utils from "../../../../utils";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { trygdeavtaleOperations, trygdeavtaleSelectors } from "../../../../ducks/trygdeavtale";
import { formSelectors } from "../../../../ducks/form";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import vurdering_inngang from "./vurderingInngangSchema";

import "./vurderingInngang.css";

import { StegData, StegDataReqDto } from "../../../../services/modules/trygdeavtale/flyt";

const initializeValues = (stegData: StegData | undefined) => ({
  fom: stegData?.resultat?.fom ? Utils.dato.formatterDatoTilNorsk(stegData.resultat.fom) : undefined,
  tom: stegData?.resultat?.tom ? Utils.dato.formatterDatoTilNorsk(stegData.resultat.tom) : undefined,
  land: stegData?.resultat?.land ? stegData.resultat.land[0] : undefined,
});

const mapStateToProps = (state: RootState) => {
  const inngangStegData = trygdeavtaleSelectors.InngangStegDataSelector(state);
  return {
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
    inngangStegData,
    formValues: getFormValues(KV.Form.Trygdeavtale.INNGANG)(state),
    initialValues: initializeValues(inngangStegData),
    formIsValid: formSelectors.TrygdeavtaleInngangFormValidSelector(state),
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  sendStegData: (behandlindID: number, data: StegDataReqDto) =>
    dispatch(trygdeavtaleOperations.sendStegData(behandlindID, data)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface FormValuesProps {
  fom?: string;
  tom?: string;
  land?: string;
}

interface Props {
  fortsett: () => void;
  formValues: FormValuesProps;
  redigerbart: boolean;
}

const VurderingInngang = ({
  behandlingID,
  formValues,
  formIsValid,
  fortsett,
  inngangStegData,
  redigerbart,
  sendStegData,
}: PropsFromRedux & Props) => {
  const hjelpetekst = "Oppgi landet der arbeidet utføres. Hvis søker arbeider på skip, skal du oppgi flagglandet.";
  const Hjelpetekst = () => (
    <Nav.Hjelpetekst className="hjelpetekst" tittel={hjelpetekst} type={Nav.PopoverOrientering.Hoyre}>
      {hjelpetekst}
    </Nav.Hjelpetekst>
  );
  const landkoder = [{ kode: "GB", term: "Storbritannia" }]; // TODO: temp

  const sendOppdatertStegData = (data: { formValues: FormValuesProps; formIsValid: boolean }) => {
    if (data.formIsValid && data.formValues) {
      const requestData = {
        fom: data.formValues.fom ? Utils.dato.formatterDatoTilISO(data.formValues.fom) : undefined,
        tom: data.formValues.tom ? Utils.dato.formatterDatoTilISO(data.formValues.tom) : undefined,
        land: data.formValues.land ? [data.formValues.land] : [],
      };
      sendStegData(behandlingID, { stegId: KV.Koder.StegNavn.INNGANG, stegData: requestData });
    }
  };
  const debouncedLagreStegData = useCallback(Utils._debounce(sendOppdatertStegData, 500), []);

  useEffect(() => {
    if (redigerbart) debouncedLagreStegData({ formValues, formIsValid });
  }, [formValues, formIsValid]);

  return (
    <div className="vurderingInngang">
      <Nav.Typo.Undertittel className="undertittel">Oppgi opplysninger fra søknaden</Nav.Typo.Undertittel>
      <Nav.Fieldset legend="Periode">
        <Nav.Row>
          <Nav.Column xs="3">
            <Skjema.Datovelger label="Fra og med:" feltNavn="fom" disabled={!redigerbart} />
          </Nav.Column>
          <Nav.Column xs="3">
            <Skjema.Datovelger label="Til og med:" feltNavn="tom" disabled={!redigerbart} />
          </Nav.Column>
          <Nav.Column xs="5">
            <Skjema.LandVelger
              label={
                <Fragment>
                  Arbeidsland
                  <Hjelpetekst />
                </Fragment>
              }
              feltNavn="land"
              placeholder="Velg..."
              landkoder={landkoder}
              disabled
            />
          </Nav.Column>
        </Nav.Row>
      </Nav.Fieldset>

      <div className="fane__knapplinje">
        <Nav.Hovedknapp
          mini
          disabled={inngangStegData?.status !== "FERDIG" || !formIsValid || !redigerbart}
          className="fane__navigasjonsknapp"
          onClick={fortsett}
        >
          Fortsett
        </Nav.Hovedknapp>
      </div>
    </div>
  );
};

const VurderingInngangForm = reduxForm<{}, PropsFromRedux & Props>({
  form: KV.Form.Trygdeavtale.INNGANG,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(vurdering_inngang),
})(VurderingInngang);

export default connector(VurderingInngangForm);
