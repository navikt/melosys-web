import React, { useEffect } from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { change, getFormValues, reduxForm, untouch } from "redux-form";
import { connect, ConnectedProps } from "react-redux";
import { KTObject } from "@navikt/melosys-kodeverk";
import parse from "html-react-parser";

import * as Api from "../../../../services/api";
import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Utils from "../../../../utils";

import { formSelectors } from "../../../../ducks/form";
import { StegStatus } from "../../stegvelger";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import vurdering_bestemmelse from "./vurderingBestemmelseSchema";

import "./vurderingBestemmelse.css";

const mapStateToProps = (state: RootState, ownProps: Props) => ({
  formIsValid: formSelectors.TrygdeavtaleBestemmelseFormValidSelector(state),
  formValues: getFormValues(KV.Form.Trygdeavtale.BESTEMMELSE)(state),
  initialValues: {
    vedtak: ownProps.resultat?.vedtak,
    innvilgelse: ownProps.resultat?.innvilgelse,
    bestemmelse: ownProps.resultat?.bestemmelse,
  },
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  resetField: (field: string) => {
    dispatch(change(KV.Form.Trygdeavtale.BESTEMMELSE, field, null));
    dispatch(untouch(KV.Form.Trygdeavtale.BESTEMMELSE, field));
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);

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
  oppdaterFlyt: (resultat: Api.Trygdeavtale.Resultat) => void;
}

const VurderingBestemmelse = ({
  data: { vedtakValg, innvilgelseValg, bestemmelseValg, bestemmelseTekst },
  formIsValid,
  formValues,
  fortsett,
  tilbake,
  redigerbart,
  resetField,
  resultat,
  steg,
  oppdaterFlyt,
}: PropsFromRedux & Props) => {
  useEffect(() => {
    if (redigerbart && formValues) {
      oppdaterFlyt({
        ...resultat,
        vedtak: formValues?.vedtak,
        innvilgelse: formValues?.innvilgelse,
        bestemmelse: formValues?.bestemmelse,
      });
    }
  }, [formValues]);

  if (!formValues) return null;

  const usaBestemmelserEndaIkkeStøttet = [
    MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_trygdeavtale_usa.USA_ART5_1,
    MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_trygdeavtale_usa.USA_ART5_9,
  ];

  return (
    <div className="vurderingBestemmelse">
      <Nav.Typo.Undertittel className="undertittel">Bestemmelse og vurdering</Nav.Typo.Undertittel>

      <Nav.Fieldset legend="Kan du fatte vedtak?">
        {vedtakValg?.map((valg) => (
          <Skjema.Radio
            key={valg.kode}
            feltNavn="vedtak"
            label={valg.term}
            value={valg.kode}
            disabled={!redigerbart || valg.kode.startsWith("NEI")}
            onChange={() => {
              resetField("innvilgelse");
              resetField("bestemmelse");
            }}
          />
        ))}
      </Nav.Fieldset>

      {formValues?.vedtak && !Utils._isEmpty(innvilgelseValg) && (
        <Nav.Fieldset legend="Skal søknaden innvilges?">
          {innvilgelseValg?.map((valg) => (
            <Skjema.Radio
              key={valg.kode}
              feltNavn="innvilgelse"
              label={valg.term}
              value={valg.kode}
              disabled={!redigerbart || valg.kode.startsWith("NEI")}
              onChange={() => resetField("bestemmelse")}
            />
          ))}
        </Nav.Fieldset>
      )}

      {formValues?.innvilgelse && !Utils._isEmpty(bestemmelseValg) && (
        <Nav.Fieldset legend="Velg bestemmelse" className="bestemmelseValg">
          <Nav.Row>
            <Nav.Column xs="10">
              <Skjema.Select
                label=""
                feltNavn="bestemmelse"
                disabled={!redigerbart}
                emptyFieldText="Velg"
                emptyFieldDisabled={!!formValues.bestemmelse}
              >
                {bestemmelseValg
                  ?.filter((bestemmelse: KTObject) => !usaBestemmelserEndaIkkeStøttet.includes(bestemmelse.kode))
                  .map((bestemmelse: KTObject) => (
                    <option key={bestemmelse.kode} value={bestemmelse.kode}>
                      {bestemmelse.term}
                    </option>
                  ))}
              </Skjema.Select>
            </Nav.Column>
          </Nav.Row>
        </Nav.Fieldset>
      )}

      {bestemmelseTekst && (
        <Nav.Row>
          <Nav.Column xs="10" className="bestemmelseTekst">
            <div>{parse(bestemmelseTekst)}</div>
          </Nav.Column>
        </Nav.Row>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: fortsett,
          disabled: steg.status !== StegStatus.FERDIG || !formIsValid || !redigerbart,
        }}
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
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
