import React, { useEffect } from "react";
import { RootState } from "AppTypes";
import { getFormValues, reduxForm } from "redux-form";
import { connect, ConnectedProps } from "react-redux";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as Api from "../../../services/api";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../utils/navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";

import { formSelectors } from "../../../ducks/form";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import vurdering_bestemmelse from "./vurderingBestemmelseSchema";

import "./vurderingBestemmelse.css";

const mapStateToProps = (state: RootState, ownProps: Props) => ({
  formIsValid: formSelectors.TrygdeavtaleBestemmelseFormValidSelector(state),
  formValues: getFormValues(KV.Form.Trygdeavtale.BESTEMMELSE)(state),
  initialValues: {
    vedtak: ownProps.resultat?.vedtakValg || undefined,
    innvilgelse: ownProps.resultat?.innvilgelseValg || undefined,
    bestemmelse: ownProps.resultat?.bestemmelseValg || undefined,
  },
  bestemmelseValg: ownProps.data?.bestemmelseValg || undefined,
  innvilgelseValg: ownProps.data?.innvilgelseValg || undefined,
  vedtakValg: ownProps.data?.vedtakValg || undefined,
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

interface FormValuesProps {
  vedtak?: string;
  innvilgelse?: string;
  bestemmelse?: string;
}

interface Props {
  data: Api.Trygdeavtale.StegData;
  formValues: FormValuesProps;
  fortsett: () => void;
  tilbake: () => void;
  redigerbart: boolean;
  resultat: Api.Trygdeavtale.Resultat;
  steg: Api.Trygdeavtale.Steg;
  oppdaterStegData: (data: Api.Trygdeavtale.FlytReqDto) => void;
}

const VurderingBestemmelse = ({
  bestemmelseValg,
  formIsValid,
  formValues,
  fortsett,
  innvilgelseValg,
  tilbake,
  redigerbart,
  resultat,
  steg,
  oppdaterStegData,
  vedtakValg,
}: PropsFromRedux & Props) => {
  useEffect(() => {
    if (formValues?.vedtak) {
      oppdaterStegData({
        resultat: {
          ...resultat,
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
          <Skjema.Radio key={valg.kode} feltNavn="vedtak" label={valg.term} value={valg.kode} disabled={!redigerbart} />
        ))}
      </Nav.Fieldset>

      {formValues?.vedtak && innvilgelseValg && (
        <Nav.Fieldset legend="Skal søknaden innvilges?">
          {innvilgelseValg?.map((valg) => (
            <Skjema.Radio
              key={valg.kode}
              feltNavn="innvilgelse"
              label={valg.term}
              value={valg.kode}
              disabled={!redigerbart}
            />
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
          disabled={steg.status !== "FERDIG" || !formIsValid || !redigerbart}
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
