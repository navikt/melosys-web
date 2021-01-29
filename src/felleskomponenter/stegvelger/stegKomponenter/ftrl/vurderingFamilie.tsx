import React, { useCallback, useEffect } from "react";
import { RootState } from "AppTypes";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { change, getFormValues, reduxForm } from "redux-form";
import { MedfolgendeFamiliemedlem, OppsummertFaktaMedfolgendeFamilie } from "Domene";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as Nav from "../../../../utils/navFrontend";
import * as Utils from "../../../../utils";
import * as Skjema from "../../../skjema";
import * as KV from "../../../../kodeverk";

import { oppsummertfaktaOperations, oppsummertfaktaSelectors } from "../../../../ducks/oppsummertfakta";
import { folketrygdenkodeverkSelectors } from "../../../../ducks/folketrygdenkodeverk";
import { behandlingsgrunnlagSelectors } from "../../../../ducks/behandlingsgrunnlag";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { formSelectors } from "../../../../ducks/form";
import { lagYupToReduxformErrorMapper, Skjemaer as YupSkjemaer } from "../../../../yup";
import { MedfolgendeFamilie } from "../../../../kodeverk/form";
import { BOOLSK_STRING } from "../../../../constants";

import "./vurderingFamilie.css";

function initializeFamilieFormValues(barn: MedfolgendeFamilie[], ektefelleSamboer: MedfolgendeFamilie[]) {
  let initialValues = {
    barn: { fritekst: "" },
    ektefelle_samboer: { fritekst: "" },
  };
  barn.forEach((familiemedlem) => {
    initialValues = {
      barn: { ...initialValues.barn, [familiemedlem.uuid]: {} },
      ektefelle_samboer: { ...initialValues.ektefelle_samboer },
    };
  });
  ektefelleSamboer.forEach((familiemedlem) => {
    initialValues = {
      barn: { ...initialValues.barn },
      ektefelle_samboer: { ...initialValues.ektefelle_samboer, [familiemedlem.uuid]: {} },
    };
  });
  return initialValues;
}

const mapStateToProps = (state: RootState) => {
  const medfolgendeBarn = behandlingsgrunnlagSelectors.MedfolgendeBarnSelector(state);
  const medfolgendeEktefelleSamboer = behandlingsgrunnlagSelectors.MedfolgendeEktefelleSamboerSelector(state);
  return {
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
    medfolgendeFamilie: behandlingsgrunnlagSelectors.MedfolgendeFamilieSelector(state),
    avklarteMedfolgendeFamilie: oppsummertfaktaSelectors.MedfolgendeFamilieSelector(state),
    medfolgendeBarn,
    medfolgendeEktefelleSamboer,
    medfolgende_barn_begrunnelser: folketrygdenkodeverkSelectors.Medfolgende_barn_begrunnelser_ftrlBegrunnelserSelector(
      state
    ),
    medfolgende_ektefelle_samboer_begrunnelser: folketrygdenkodeverkSelectors.Medfolgende_ektefelle_samboer_begrunnelser_ftrlBegrunnelserSelector(
      state
    ),
    formIsValid: formSelectors.VurderFamilieFormValid(state),
    formValues: getFormValues(KV.Form.FAMILIE)(state),
    initialValues: initializeFamilieFormValues(medfolgendeBarn, medfolgendeEktefelleSamboer),
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  changeField: (field: string, data: any) => dispatch(change(KV.Form.FAMILIE, field, data)),
  sendMedfolgendeFamilie: (behandlingID: number, data: OppsummertFaktaMedfolgendeFamilie) =>
    dispatch(oppsummertfaktaOperations.sendMedfolgendeFamilie(behandlingID, data)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface FormValueProp {
  barn: {
    [key: string]: any;
  };
  ektefelle_samboer: {
    [key: string]: any;
  };
}

interface Props {
  bekreft: () => void;
  oppdater: () => void;
  tilbake: () => void;
  redigerbart: boolean;
  formValues: FormValueProp;
}

const VurderingFamilie = ({
  bekreft,
  medfolgendeFamilie,
  medfolgendeBarn,
  medfolgendeEktefelleSamboer,
  redigerbart,
  tilbake,
  avklarteMedfolgendeFamilie,
  medfolgende_barn_begrunnelser,
  medfolgende_ektefelle_samboer_begrunnelser,
  formValues,
  behandlingID,
  oppdater,
  changeField,
  formIsValid,
  sendMedfolgendeFamilie,
}: Props & PropsFromRedux) => {
  const obsTekst = '* Hvis dette ikke stemmer, må du legge inn nødvendig informasjon i menypunktet "Familieforhold".';

  function tilMedfolgendeFamilie(fraFormValues: FormValueProp): OppsummertFaktaMedfolgendeFamilie {
    const medfolgendeFamiliemedlem: MedfolgendeFamiliemedlem[] = [];

    medfolgendeBarn.forEach((familiemedlem: MedfolgendeFamilie) => {
      medfolgendeFamiliemedlem.push({
        uuid: familiemedlem.uuid,
        omfattet: fraFormValues.barn[familiemedlem.uuid].innvilget === BOOLSK_STRING.SANN,
        begrunnelseKode: fraFormValues.barn[familiemedlem.uuid].begrunnelse
          ? fraFormValues.barn[familiemedlem.uuid].begrunnelse
          : null,
        begrunnelseFritekst: fraFormValues.barn.fritekst,
      });
    });
    medfolgendeEktefelleSamboer.forEach((familiemedlem: MedfolgendeFamilie) => {
      medfolgendeFamiliemedlem.push({
        uuid: familiemedlem.uuid,
        omfattet: fraFormValues.ektefelle_samboer[familiemedlem.uuid].innvilget === BOOLSK_STRING.SANN,
        begrunnelseKode: fraFormValues.ektefelle_samboer[familiemedlem.uuid].begrunnelse
          ? fraFormValues.ektefelle_samboer[familiemedlem.uuid].begrunnelse
          : null,
        begrunnelseFritekst: fraFormValues.ektefelle_samboer.fritekst,
      });
    });
    return { medfolgendeFamilie: medfolgendeFamiliemedlem };
  }

  function lagreMedfolgendeFamilie(data: any) {
    if (data.formIsValid) {
      sendMedfolgendeFamilie(behandlingID, tilMedfolgendeFamilie(data.formValues));
    }
  }

  const debouncedLagring = useCallback(Utils._debounce(lagreMedfolgendeFamilie, 1000), []);

  useEffect(() => {
    debouncedLagring({ formValues, formIsValid });
  }, [formIsValid, formValues]);

  useEffect(() => {
    oppdater();
  }, [formIsValid]);

  useEffect(() => {
    if (avklarteMedfolgendeFamilie) {
      avklarteMedfolgendeFamilie.forEach((familiemedlem) => {
        if (
          medfolgendeFamilie.some(
            (person: MedfolgendeFamilie) =>
              person.uuid === familiemedlem.uuid && person.relasjonsrolle === KV.Koder.Relasjonsrolle.BARN
          )
        ) {
          changeField(
            `barn.${familiemedlem.uuid}.innvilget`,
            familiemedlem.omfattet ? BOOLSK_STRING.SANN : BOOLSK_STRING.USANN
          );
          if (!familiemedlem.omfattet) {
            changeField(`barn.${familiemedlem.uuid}.begrunnelse`, familiemedlem.begrunnelseKode);
            changeField(`barn.fritekst`, familiemedlem.begrunnelseFritekst);
          }
        }

        if (
          medfolgendeFamilie.some(
            (person: MedfolgendeFamilie) =>
              person.uuid === familiemedlem.uuid && person.relasjonsrolle === KV.Koder.Relasjonsrolle.EKTEFELLE_SAMBOER
          )
        ) {
          changeField(
            `ektefelle_samboer.${familiemedlem.uuid}.innvilget`,
            familiemedlem.omfattet ? BOOLSK_STRING.SANN : BOOLSK_STRING.USANN
          );
          if (!familiemedlem.omfattet) {
            changeField(`ektefelle_samboer.${familiemedlem.uuid}.begrunnelse`, familiemedlem.begrunnelseKode);
            changeField(`ektefelle_samboer.fritekst`, familiemedlem.begrunnelseFritekst);
          }
        }
      });
    }
  }, [avklarteMedfolgendeFamilie]);

  if (!formValues) return null;

  return (
    <div className="vurderingFamilie">
      <Nav.typo.Undertittel className="undertittel">
        Skal medfolgendeFamilie oppgitt i søknaden innvilges medlemskap?
      </Nav.typo.Undertittel>

      {medfolgendeFamilie && medfolgendeFamilie.length > 0 ? (
        <div>
          <Nav.Fieldset legend="Barn">
            <Nav.Row>
              {medfolgendeBarn.map((barn: MedfolgendeFamilie) => (
                <Nav.Column xs="6" key={barn.uuid}>
                  <Nav.typo.Normaltekst>{`${Utils.streng.storeForbokstaver(barn.navn)} (F.nr: ${
                    barn.fnr
                  })`}</Nav.typo.Normaltekst>
                  <Nav.Row className="familiemedlem_radio">
                    <Nav.Column xs="2">
                      <Skjema.Radio
                        label="Ja"
                        feltNavn={`barn.${barn.uuid}.innvilget`}
                        id={`${barn.uuid}.${BOOLSK_STRING.SANN}`}
                        value={BOOLSK_STRING.SANN}
                        disabled={!redigerbart}
                        className=""
                      />
                    </Nav.Column>
                    <Nav.Column xs="2">
                      <Skjema.Radio
                        label="Nei"
                        feltNavn={`barn.${barn.uuid}.innvilget`}
                        id={`${barn.uuid}.${BOOLSK_STRING.USANN}`}
                        value={BOOLSK_STRING.USANN}
                        disabled={!redigerbart}
                        className=""
                      />
                    </Nav.Column>
                  </Nav.Row>
                  {formValues.barn && formValues.barn[barn.uuid].innvilget === BOOLSK_STRING.USANN && (
                    <Skjema.Select
                      label="Begrunnelse:"
                      feltNavn={`barn.${barn.uuid}.begrunnelse`}
                      emptyFieldText="Velg..."
                      emptyFieldDisabled={!redigerbart || !!formValues.barn[barn.uuid].begrunnelse}
                      name={barn.uuid}
                    >
                      {medfolgende_barn_begrunnelser.map((begrunnelse: KTObject) => (
                        <option key={begrunnelse.kode} value={begrunnelse.kode}>
                          {begrunnelse.term}
                        </option>
                      ))}
                    </Skjema.Select>
                  )}
                </Nav.Column>
              ))}
            </Nav.Row>
            {medfolgendeBarn.some(
              (barn: MedfolgendeFamilie) =>
                formValues.ektefelle_samboer && formValues.barn[barn.uuid].innvilget === BOOLSK_STRING.USANN
            ) && (
              <div>
                <Nav.typo.Element>Fritekst til avsnitt om barn i vedtaksbrev</Nav.typo.Element>
                <Skjema.HTMLEditor feltNavn="barn.fritekst" className="fritekst" />
              </div>
            )}
          </Nav.Fieldset>
          <Nav.Fieldset legend="Ektefelle/parner/samboer">
            <Nav.Row>
              {medfolgendeEktefelleSamboer.map((ektefelleSamboer: MedfolgendeFamilie) => (
                <Nav.Column xs="6" key={ektefelleSamboer.uuid}>
                  <Nav.typo.Normaltekst>{`${Utils.streng.storeForbokstaver(ektefelleSamboer.navn)} (F.nr: ${
                    ektefelleSamboer.fnr
                  })`}</Nav.typo.Normaltekst>
                  <Nav.Row className="familiemedlem_radio">
                    <Nav.Column xs="2">
                      <Skjema.Radio
                        label="Ja"
                        feltNavn={`ektefelle_samboer.${ektefelleSamboer.uuid}.innvilget`}
                        id={`${ektefelleSamboer.uuid}.${BOOLSK_STRING.SANN}`}
                        value={BOOLSK_STRING.SANN}
                        disabled={!redigerbart}
                        className=""
                      />
                    </Nav.Column>
                    <Nav.Column xs="2">
                      <Skjema.Radio
                        label="Nei"
                        feltNavn={`ektefelle_samboer.${ektefelleSamboer.uuid}.innvilget`}
                        id={`${ektefelleSamboer.uuid}.${BOOLSK_STRING.USANN}`}
                        value={BOOLSK_STRING.USANN}
                        disabled={!redigerbart}
                        className=""
                      />
                    </Nav.Column>
                  </Nav.Row>
                  {formValues.ektefelle_samboer &&
                    formValues.ektefelle_samboer[ektefelleSamboer.uuid].innvilget === BOOLSK_STRING.USANN && (
                      <Skjema.Select
                        label="Begrunnelse:"
                        feltNavn={`ektefelle_samboer.${ektefelleSamboer.uuid}.begrunnelse`}
                        emptyFieldText="Velg..."
                        emptyFieldDisabled={
                          !redigerbart || !!formValues.ektefelle_samboer[ektefelleSamboer.uuid].begrunnelse
                        }
                        name={ektefelleSamboer.uuid}
                      >
                        {medfolgende_ektefelle_samboer_begrunnelser.map((begrunnelse: KTObject) => (
                          <option key={begrunnelse.kode} value={begrunnelse.kode}>
                            {begrunnelse.term}
                          </option>
                        ))}
                      </Skjema.Select>
                    )}
                </Nav.Column>
              ))}
            </Nav.Row>
            {medfolgendeEktefelleSamboer.some(
              (ektefelleSamboer: MedfolgendeFamilie) =>
                formValues.ektefelle_samboer &&
                formValues.ektefelle_samboer[ektefelleSamboer.uuid].innvilget === BOOLSK_STRING.USANN
            ) && (
              <div>
                <Nav.typo.Element>Fritekst til avsnitt om ektefelle/samboer i vedtaksbrev</Nav.typo.Element>
                <Skjema.HTMLEditor feltNavn="ektefelle_samboer.fritekst" className="fritekst" />
              </div>
            )}
          </Nav.Fieldset>
        </div>
      ) : (
        <div>
          <Nav.AlertStripe className="alertstripe" type="suksess">
            Ingen medfølgende familiemedlemmer.
          </Nav.AlertStripe>
          <span>{obsTekst}</span>
        </div>
      )}

      <div className="fane__knapplinje">
        <Nav.Knapp mini className="fane__navigasjonsknapp" onClick={tilbake}>
          Tilbake
        </Nav.Knapp>
        <Nav.Hovedknapp
          mini
          disabled={!redigerbart || !formIsValid}
          className="fane__navigasjonsknapp"
          onClick={bekreft}
        >
          Fortsett
        </Nav.Hovedknapp>
      </div>
    </div>
  );
};

const VurderingFamilieForm = reduxForm({
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  onSubmit: (values: any, dispatch: any, props: any) => {},
  form: KV.Form.FAMILIE,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) =>
    lagYupToReduxformErrorMapper(YupSkjemaer.vurdering_familie, {
      context: {
        medfolgendeBarn: props.medfolgendeBarn,
        medfolgendeEktefelleSamboer: props.medfolgendeEktefelleSamboer,
      },
    })(values),
})(VurderingFamilie);

export default connector(VurderingFamilieForm);
