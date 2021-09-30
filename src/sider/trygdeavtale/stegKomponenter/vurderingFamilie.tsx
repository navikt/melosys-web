import React, { useCallback, useEffect } from "react";
import { RootState } from "AppTypes";
import { getFormValues, reduxForm } from "redux-form";
import { connect, ConnectedProps } from "react-redux";
import { KTObject } from "@navikt/melosys-kodeverk";

import * as Api from "../../../services/api";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../utils/navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Utils from "../../../utils";

import { formSelectors } from "../../../ducks/form";
import { BOOLSK_STRING } from "../../../constants";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import vurdering_familie from "./vurderingFamilieSchema";

import "./vurderingFamilie.css";

const initializeFamilieFormValues = (data: Api.Trygdeavtale.StegData, resultat: Api.Trygdeavtale.Resultat) => ({
  barn: {
    fritekst: (resultat.barn && resultat.barn[0]?.omfattet) || "",
    ...Object.fromEntries(
      data.barn
        ? data.barn.map((barn) => [
            barn.uuid,
            {
              innvilget:
                resultat.barn?.find((x: Api.Avklartefakta.MedfolgendeFamiliemedlem) => x.uuid === barn.uuid)
                  ?.omfattet || null,
              begrunnelse:
                resultat.barn?.find((x: Api.Avklartefakta.MedfolgendeFamiliemedlem) => x.uuid === barn.uuid)
                  ?.begrunnelseKode || null,
            },
          ])
        : []
    ),
  },
  ektefelle: {
    fritekst: resultat.ektefelle?.begrunnelseFritekst || "",
    innvilget: resultat.ektefelle?.omfattet || null,
    begrunnelse: resultat.ektefelle?.begrunnelseKode || null,
  },
});

const mapStateToProps = (state: RootState, ownProps: Props) => ({
  formIsValid: formSelectors.TrygdeavtaleFamilieFormValidSelector(state),
  formValues: getFormValues(KV.Form.Trygdeavtale.FAMILIE)(state),
  initialValues: initializeFamilieFormValues(ownProps.data, ownProps.resultat),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

interface FormValuesProps {
  barn: {
    fritekst: string;
  } & {
    [key: string]: {
      innvilget: string | null;
      begrunnelse: string | null;
    };
  };
  ektefelle: {
    innvilget: string | null;
    begrunnelse: string | null;
    fritekst: string | null;
  };
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

const VurderingFamilie = ({
  data: { barn: tilknyttedeBarn, barnBegrunnelseValg, ektefelle: tilknyttetEktefelle, ektefelleBegrunnelseValg },
  formIsValid,
  formValues,
  fortsett,
  tilbake,
  redigerbart,
  resultat,
  steg,
  oppdaterStegData,
}: PropsFromRedux & Props) => {
  const obsTekst = '* Hvis dette ikke stemmer, må du legge inn nødvendig informasjon i menypunktet "Familieforhold".';

  const sendOppdatertStegData = (data: { formValues: FormValuesProps; formIsValid: boolean }) => {
    if (data.formIsValid && data.formValues) {
      oppdaterStegData({
        resultat: {
          ...resultat,
          barn:
            tilknyttedeBarn && !Utils._isEmpty(tilknyttedeBarn)
              ? [
                  ...tilknyttedeBarn.map((barn) => ({
                    uuid: barn?.uuid || "",
                    omfattet: data.formValues.barn[barn?.uuid]?.innvilget === BOOLSK_STRING.SANN,
                    begrunnelseKode:
                      data.formValues.barn[barn?.uuid]?.innvilget === BOOLSK_STRING.SANN
                        ? null
                        : data.formValues.barn[barn?.uuid]?.begrunnelse,
                    begrunnelseFritekst:
                      data.formValues.barn[barn?.uuid]?.innvilget === BOOLSK_STRING.SANN
                        ? null
                        : data.formValues.barn.fritekst,
                  })),
                ]
              : [],
          ektefelle: tilknyttetEktefelle
            ? {
                uuid: tilknyttetEktefelle?.uuid || "",
                omfattet: data.formValues.ektefelle.innvilget === BOOLSK_STRING.SANN,
                begrunnelseKode:
                  data.formValues.ektefelle.innvilget === BOOLSK_STRING.SANN
                    ? null
                    : data.formValues.ektefelle.begrunnelse,
                begrunnelseFritekst:
                  data.formValues.ektefelle.innvilget === BOOLSK_STRING.SANN
                    ? null
                    : data.formValues.ektefelle.fritekst,
              }
            : undefined,
        },
      });
    }
  };
  const debouncedLagreStegData = useCallback(Utils._debounce(sendOppdatertStegData, 1000), []);

  useEffect(() => {
    if (redigerbart) debouncedLagreStegData({ formValues, formIsValid });
  }, [formValues, formIsValid]);

  if (!formValues) return null;

  return (
    <div className="vurderingFamilie">
      <Nav.Typo.Undertittel className="undertittel">
        Skal familiemedlemmer oppgitt i søknaden innvilges medlemskap?
      </Nav.Typo.Undertittel>

      {Utils._isEmpty(tilknyttedeBarn) && !tilknyttetEktefelle ? (
        <div>
          <Nav.AlertStripe className="alertstripe" type="suksess">
            Ingen medfølgende familiemedlemmer.
          </Nav.AlertStripe>
          <span>{obsTekst}</span>
        </div>
      ) : (
        <div>
          <Nav.Fieldset legend="Barn" className="barn">
            {tilknyttedeBarn?.map((barn: Api.Trygdeavtale.FamilieValg) => (
              <Nav.Row key={barn.uuid} className="barnet">
                <Nav.Column xs="8">
                  <Nav.Typo.Normaltekst>{`${Utils.streng.storeForbokstaver(barn.navn)} (F.nr: ${
                    barn.fnr
                  })`}</Nav.Typo.Normaltekst>
                  <Nav.Row className="familiemedlem_radio">
                    <Nav.Column xs="2">
                      <Skjema.Radio
                        label="Ja"
                        feltNavn={`barn.${barn.uuid}.innvilget`}
                        id={`${barn.uuid}.${BOOLSK_STRING.SANN}`}
                        value={BOOLSK_STRING.SANN}
                        disabled={!redigerbart}
                      />
                    </Nav.Column>
                    <Nav.Column xs="2">
                      <Skjema.Radio
                        label="Nei"
                        feltNavn={`barn.${barn.uuid}.innvilget`}
                        id={`${barn.uuid}.${BOOLSK_STRING.USANN}`}
                        value={BOOLSK_STRING.USANN}
                        disabled={!redigerbart}
                      />
                    </Nav.Column>
                  </Nav.Row>
                  {formValues.barn[barn.uuid].innvilget === BOOLSK_STRING.USANN && (
                    <Skjema.Select
                      label="Begrunnelse:"
                      feltNavn={`barn.${barn.uuid}.begrunnelse`}
                      emptyFieldText="Velg..."
                      emptyFieldDisabled={!redigerbart || !!formValues.barn[barn.uuid].begrunnelse}
                      name={barn.uuid}
                      disabled={!redigerbart}
                    >
                      {barnBegrunnelseValg?.map((begrunnelse: KTObject) => (
                        <option key={begrunnelse.kode} value={begrunnelse.kode}>
                          {begrunnelse.term}
                        </option>
                      ))}
                    </Skjema.Select>
                  )}
                </Nav.Column>
              </Nav.Row>
            ))}
            {tilknyttedeBarn?.some(
              (barn: Api.Trygdeavtale.FamilieValg) => formValues.barn[barn.uuid].innvilget === BOOLSK_STRING.USANN
            ) && (
              <div style={{ marginBottom: "2rem" }}>
                <Nav.Typo.Element>Fritekst til avsnitt om barn i vedtaksbrev</Nav.Typo.Element>
                <Skjema.HTMLEditor feltNavn="barn.fritekst" className="fritekst" disabled={!redigerbart} />
              </div>
            )}
          </Nav.Fieldset>
          <Nav.Fieldset legend="Ektefelle/partner/samboer">
            {tilknyttetEktefelle && (
              <div>
                <Nav.Row className="ektefelle">
                  <Nav.Column xs="8">
                    <Nav.Typo.Normaltekst>{`${Utils.streng.storeForbokstaver(tilknyttetEktefelle.navn)} (F.nr: ${
                      tilknyttetEktefelle.fnr
                    })`}</Nav.Typo.Normaltekst>
                    <Nav.Row className="familiemedlem_radio">
                      <Nav.Column xs="2">
                        <Skjema.Radio
                          label="Ja"
                          feltNavn={`ektefelle.innvilget`}
                          id={`${tilknyttetEktefelle.uuid}.${BOOLSK_STRING.SANN}`}
                          value={BOOLSK_STRING.SANN}
                          disabled={!redigerbart}
                        />
                      </Nav.Column>
                      <Nav.Column xs="2">
                        <Skjema.Radio
                          label="Nei"
                          feltNavn={`ektefelle.innvilget`}
                          id={`${tilknyttetEktefelle.uuid}.${BOOLSK_STRING.USANN}`}
                          value={BOOLSK_STRING.USANN}
                          disabled={!redigerbart}
                        />
                      </Nav.Column>
                    </Nav.Row>
                    {formValues.ektefelle?.innvilget === BOOLSK_STRING.USANN && (
                      <Skjema.Select
                        label="Begrunnelse:"
                        feltNavn={`ektefelle.begrunnelse`}
                        emptyFieldText="Velg..."
                        emptyFieldDisabled={!redigerbart || !!formValues.ektefelle.begrunnelse}
                        name={tilknyttetEktefelle.uuid}
                        disabled={!redigerbart}
                      >
                        {ektefelleBegrunnelseValg?.map((begrunnelse: KTObject) => (
                          <option key={begrunnelse.kode} value={begrunnelse.kode}>
                            {begrunnelse.term}
                          </option>
                        ))}
                      </Skjema.Select>
                    )}
                  </Nav.Column>
                </Nav.Row>
                {formValues.ektefelle?.innvilget === BOOLSK_STRING.USANN && (
                  <div>
                    <Nav.Typo.Element>Fritekst til avsnitt om ektefelle/samboer i vedtaksbrev</Nav.Typo.Element>
                    <Skjema.HTMLEditor feltNavn="ektefelle.fritekst" className="fritekst" disabled={!redigerbart} />
                  </div>
                )}
              </div>
            )}
          </Nav.Fieldset>
        </div>
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

const VurderingFamilieForm = reduxForm<{}, PropsFromRedux & Props>({
  form: KV.Form.Trygdeavtale.FAMILIE,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) =>
    lagYupToReduxformErrorMapper(vurdering_familie, {
      context: {
        tilknyttedeBarn: props.data.barn,
        tilknyttetEktefelle: props.data.ektefelle,
      },
    }),
})(VurderingFamilie);

export default connector(VurderingFamilieForm);
