import React, { useEffect } from "react";
import { RootState } from "AppTypes";
import { getFormValues, reduxForm } from "redux-form";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../utils/navFrontend";
import * as Skjema from "../../../skjema";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { trygdeavtaleOperations, trygdeavtaleSelectors } from "../../../../ducks/trygdeavtale";
import { formSelectors } from "../../../../ducks/form";
import { StegDataReqDto } from "../../../../services/modules/trygdeavtale/flyt";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import vurdering_bestemmelse from "./vurderingBestemmelseSchema";

import "./vurderingBestemmelse.css";

const mapStateToProps = (state: RootState) => {
  const bestemmelseStegData = trygdeavtaleSelectors.BestemmelseStegDataSelector(state);
  return {
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
    bestemmelseStegData,
    formIsValid: formSelectors.TrygdeavtaleBestemmelseFormValidSelector(state),
    formValues: getFormValues(KV.Form.Trygdeavtale.BESTEMMELSE)(state),
    initialValues: {
      vedtak: bestemmelseStegData?.resultat?.vedtakValg || undefined,
      innvilgelse: bestemmelseStegData?.resultat?.innvilgelseValg || undefined,
      bestemmelse: bestemmelseStegData?.resultat?.bestemmelseValg || undefined,
    },
    bestemmelseValg: bestemmelseStegData?.bestemmelseValg || undefined,
    innvilgelseValg: bestemmelseStegData?.innvilgelseValg || undefined,
    vedtakValg: bestemmelseStegData?.vedtakValg || undefined,
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  sendStegData: (behandlingID: number, data: StegDataReqDto) =>
    dispatch(trygdeavtaleOperations.sendStegData(behandlingID, data)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface FormValuesProps {
  vedtak?: string;
  innvilgelse?: string;
  bestemmelse?: string;
}

interface Props {
  formValues: FormValuesProps;
  fortsett: () => void;
  tilbake: () => void;
  redigerbart: boolean;
}

const VurderingBestemmelse = ({
  behandlingID,
  bestemmelseStegData,
  bestemmelseValg,
  formIsValid,
  formValues,
  fortsett,
  innvilgelseValg,
  tilbake,
  redigerbart,
  sendStegData,
  vedtakValg,
}: PropsFromRedux & Props) => {
  useEffect(() => {
    if (formValues?.vedtak) {
      sendStegData(behandlingID, {
        stegId: KV.Koder.StegNavn.BESTEMMELSE,
        stegData: {
          vedtakValg: formValues.vedtak,
          innvilgelseValg: formValues?.innvilgelse,
          bestemmelseValg: formValues?.bestemmelse,
        },
      });
    }
  }, [formValues]);

  if (!formValues) return null;
  return (
    <div className="vurderingBestemmelse">
      <Nav.Typo.Undertittel className="undertittel">Bestemmelse og vurdering</Nav.Typo.Undertittel>

      <Nav.Fieldset legend="Kan du fatte vedtak?">
        {vedtakValg?.map((valg) => (
          <Skjema.Radio key={valg} feltNavn="vedtak" label={valg} value={valg} disabled={!redigerbart} />
        ))}
      </Nav.Fieldset>

      {formValues?.vedtak && innvilgelseValg && (
        <Nav.Fieldset legend="Skal søknaden innvilges?">
          {innvilgelseValg?.map((valg) => (
            <Skjema.Radio key={valg} feltNavn="innvilgelse" label={valg} value={valg} disabled={!redigerbart} />
          ))}
        </Nav.Fieldset>
      )}

      {formValues?.innvilgelse && bestemmelseValg && (
        <Nav.Fieldset legend="Velg bestemmelse">
          <Skjema.Select
            label=""
            feltNavn="bestemmelse"
            disabled={!redigerbart}
            emptyFieldText="Velg"
            emptyFieldDisabled={!!formValues.bestemmelse}
          >
            {bestemmelseValg?.map((bestemmelse: KTObject) => (
              <option key={bestemmelse.kode} value={bestemmelse.kode}>
                {bestemmelse.term}
              </option>
            ))}
          </Skjema.Select>
        </Nav.Fieldset>
      )}
      <div className="fane__knapplinje">
        <Nav.Knapp mini disabled={!redigerbart} className="fane__navigasjonsknapp" onClick={tilbake}>
          Tilbake
        </Nav.Knapp>
        <Nav.Hovedknapp
          mini
          disabled={bestemmelseStegData?.status !== "FERDIG" || !formIsValid || !redigerbart}
          className="fane__navigasjonsknapp"
          onClick={fortsett}
        >
          Fortsett
        </Nav.Hovedknapp>
      </div>
    </div>
  );
};

const VurderingBestemmelseForm = reduxForm<{}, PropsFromRedux & Props>({
  form: KV.Form.Trygdeavtale.BESTEMMELSE,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(vurdering_bestemmelse),
})(VurderingBestemmelse);

export default connector(VurderingBestemmelseForm);
