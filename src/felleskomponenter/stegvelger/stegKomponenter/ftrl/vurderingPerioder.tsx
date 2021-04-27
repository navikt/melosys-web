import React, { Fragment, useCallback, useEffect } from "react";
import { arrayPush, arrayRemove, change, getFormValues, reduxForm } from "redux-form";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { KTObject } from "@navikt/melosys-kodeverk";
import { RootState } from "AppTypes";
import { Medlemskapsperiode, OppdaterMedlemskapsperiode } from "Domene";

import MKV from "../../../../melosyskodeverk";
import * as Api from "../../../../services/api";
import * as Ikoner from "../../../../resources/images";
import * as KV from "../../../../kodeverk";
import * as Mui from "../../../ui";
import * as Nav from "../../../../utils/navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Utils from "../../../../utils";

import { behandlingsgrunnlagSelectors } from "../../../../ducks/behandlingsgrunnlag";
import { medlemskapsperioderOperations, medlemskapsperioderSelectors } from "../../../../ducks/medlemskapsperioder";
import { folketrygdenkodeverkSelectors } from "../../../../ducks/folketrygdenkodeverk";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { lagYupToReduxformErrorMapper } from "../../../../yup";
import vurderingPerioderSchema from "./vurderingPerioderSchema";
import { formSelectors } from "../../../../ducks/form";

import "./vurderingPerioder.css";
import { FeatureToggle } from "../../../../featuretoggle";

interface formValuesProp {
  medlemskapsperioder?: MedlemskapsperiodeProp[];
}

type MedlemskapsperiodeProp = Medlemskapsperiode & { ny: boolean; feil: string | undefined };

interface PeriodeElementProps {
  index: number;
  redigerbart: boolean;
  trygdedekninger: KTObject[];
  innvilgelsesResultater: KTObject[];
  formValues: formValuesProp;
  handleSlett: (index: number) => void;
}
const PeriodeElement = ({
  index,
  redigerbart,
  trygdedekninger,
  innvilgelsesResultater,
  formValues,
  handleSlett,
}: PeriodeElementProps) => {
  if (!formValues || !formValues.medlemskapsperioder) return null;
  return (
    <Fragment>
      <Nav.Fieldset legend="Periode" className="understrek">
        <Nav.Row>
          <Nav.Column xs="2">
            <FeatureToggle togglename="melosys.input.DATOFELT">
              {(status) =>
                status === "enabled" ? (
                  <Skjema.Datovelger label="Fra og med:" feltNavn={`medlemskapsperioder[${index}].fomDato`} disabled />
                ) : (
                  <Skjema.Input
                    datoFelt
                    label="Fra og med:"
                    feltNavn={`medlemskapsperioder[${index}].fomDato`}
                    disabled
                  />
                )
              }
            </FeatureToggle>
          </Nav.Column>
          <Nav.Column xs="2">
            <FeatureToggle togglename="melosys.input.DATOFELT">
              {(status) =>
                status === "enabled" ? (
                  <Skjema.Datovelger
                    label="Til og med:"
                    feltNavn={`medlemskapsperioder[${index}].tomDato`}
                    disabled={!redigerbart}
                  />
                ) : (
                  <Skjema.Input
                    datoFelt
                    label="Til og med:"
                    feltNavn={`medlemskapsperioder[${index}].tomDato`}
                    disabled={!redigerbart}
                  />
                )
              }
            </FeatureToggle>
          </Nav.Column>
          <Nav.Column xs="4">
            <Skjema.Select
              label="Trygdedekning"
              feltNavn={`medlemskapsperioder[${index}].trygdedekning`}
              emptyFieldText="Velg"
              emptyFieldDisabled={!!formValues.medlemskapsperioder[index].trygdedekning}
            >
              {trygdedekninger.map((item: KTObject) => (
                <option key={item.kode} value={item.kode}>
                  {item.term}
                </option>
              ))}
            </Skjema.Select>
          </Nav.Column>
          <Nav.Column xs="4">
            <Skjema.Select
              label="Resultat"
              feltNavn={`medlemskapsperioder[${index}].innvilgelsesResultat`}
              emptyFieldText="Velg"
              emptyFieldDisabled={!!formValues.medlemskapsperioder[index].innvilgelsesResultat}
            >
              {innvilgelsesResultater.map((item: KTObject) => (
                <option key={item.kode} value={item.kode}>
                  {item.term}
                </option>
              ))}
            </Skjema.Select>
          </Nav.Column>
        </Nav.Row>
        {formValues.medlemskapsperioder[index].feil && (
          <Nav.AlertStripe type="feil" style={{ marginBottom: "1rem" }}>
            {formValues.medlemskapsperioder[index].feil}
          </Nav.AlertStripe>
        )}
        {redigerbart && index === formValues.medlemskapsperioder.length - 1 && (
          <Nav.Lenker className="slettKnapp" href="#" onClick={() => handleSlett(index)} title="Slett periode">
            <Ikoner.Bin />
            <span>Slett periode</span>
          </Nav.Lenker>
        )}
      </Nav.Fieldset>
    </Fragment>
  );
};

function transformInitialMedlemskapsperioder(state: RootState) {
  const medlemskapsperioder = medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector(state);
  return (
    medlemskapsperioder &&
    [...medlemskapsperioder]
      .sort((a, b) => a.fomDato.localeCompare(b.fomDato))
      .map((medlemskapsperiode) => ({
        ...medlemskapsperiode,
        tomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.tomDato),
        fomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.fomDato),
      }))
  );
}

const mapStateToProps = (state: RootState) => ({
  mottaksdato: behandlingsgrunnlagSelectors.MottaksdatoSelector(state),
  valgtTrygdedekning: behandlingsgrunnlagSelectors.TrygdedekningSelector(state),
  formValues: getFormValues(KV.Form.PERIODER)(state),
  initialValues: {
    medlemskapsperioder: transformInitialMedlemskapsperioder(state),
  },
  trygdedekninger: folketrygdenkodeverkSelectors.TrygdedekningerSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  innvilgelsesResultater: folketrygdenkodeverkSelectors.InnvilgelsesResultatSelector(state),
  formIsValid: formSelectors.VurderPerioderFormValid(state),
  søknadsperiode: behandlingsgrunnlagSelectors.PeriodeSelector(state),
});

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  removeField: (index: number) => dispatch(arrayRemove(KV.Form.PERIODER, "medlemskapsperioder", index)),
  changeField: (index: number, data: MedlemskapsperiodeProp) =>
    dispatch(change(KV.Form.PERIODER, `medlemskapsperioder[${index}]`, data)),
  changeFieldFeil: (index: number, feil: string | undefined) =>
    dispatch(change(KV.Form.PERIODER, `medlemskapsperioder[${index}].feil`, feil)),
  pushField: (data: { id: string; ny: boolean; fomDato: string | null }) =>
    dispatch(arrayPush(KV.Form.PERIODER, "medlemskapsperioder", data)),
  hentMedlemskapsperioder: (behandlingID: number) =>
    dispatch(medlemskapsperioderOperations.hentMedlemskapsperioder(behandlingID)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  bekreft: () => void;
  oppdater: () => void;
  tilbake: () => void;
  redigerbart: boolean;
  formValues: formValuesProp;
}

type VurderingPerioderProps = Props & PropsFromRedux;

const VurderingPerioder = ({
  formValues,
  removeField,
  changeField,
  changeFieldFeil,
  pushField,
  bekreft,
  tilbake,
  oppdater,
  behandlingID,
  hentMedlemskapsperioder,
  valgtTrygdedekning,
  mottaksdato,
  formIsValid,
  søknadsperiode,
  ...props
}: VurderingPerioderProps) => {
  const hjelpetekst =
    "Perioder er foreslått på bakgrunn av periode og dekning det er søkt for, og tidspunkt søknaden ble mottatt. Du har mulighet til å gjøre endringer.";

  const oppdaterMedlemskapsperiode = (
    oppdatertMedlemskapsperiode: OppdaterMedlemskapsperiode,
    index: number,
    medlemskapsperiodeID: number
  ) => {
    Api.Medlemskapsperioder.putMedlemskapsperioder(behandlingID, medlemskapsperiodeID, oppdatertMedlemskapsperiode)
      .then(() => {
        changeFieldFeil(index, undefined);
      })
      .catch((error) => {
        Utils.logger.error(error);
        changeFieldFeil(index, error.body && error.body.message ? error.body.message : error);
      });
  };

  const opprettMedlemskapsperiode = (oppdatertMedlemskapsperiode: OppdaterMedlemskapsperiode, index: number) => {
    Api.Medlemskapsperioder.postMedlemskapsperioder(behandlingID, oppdatertMedlemskapsperiode)
      .then((response) => {
        changeField(index, {
          ...response,
          ny: false,
          tomDato: Utils.dato.formatterDatoTilNorsk(response.tomDato),
          fomDato: Utils.dato.formatterDatoTilNorsk(response.fomDato),
          feil: undefined,
        });
      })
      .catch((error) => {
        Utils.logger.error(error);
        changeFieldFeil(index, error.body && error.body.message ? error.body.message : error);
      });
  };

  const lagreMedlemskapsperioder = (data: {
    medlemskapsperioder: MedlemskapsperiodeProp[] | undefined;
    valid: boolean;
  }) => {
    if (data.medlemskapsperioder && data.valid) {
      data.medlemskapsperioder.forEach((medlemskapsperiode, index) => {
        const oppdatertMedlemskapsperiode = {
          fomDato: Utils.dato.formatterDatoTilISO(medlemskapsperiode.fomDato),
          tomDato: Utils._isEmpty(medlemskapsperiode.tomDato)
            ? null
            : Utils.dato.formatterDatoTilISO(medlemskapsperiode.tomDato),
          trygdedekning: medlemskapsperiode.trygdedekning,
          innvilgelsesResultat: medlemskapsperiode.innvilgelsesResultat,
        };

        if (medlemskapsperiode.ny) {
          opprettMedlemskapsperiode(oppdatertMedlemskapsperiode, index);
        } else {
          oppdaterMedlemskapsperiode(oppdatertMedlemskapsperiode, index, medlemskapsperiode.id);
        }
      });
    }
  };
  const debouncedLagreMedlemskapsperioder = useCallback(Utils._debounce(lagreMedlemskapsperioder, 1000), []);

  useEffect(() => {
    oppdater();
    if (formIsValid && formValues?.medlemskapsperioder?.length && formValues.medlemskapsperioder.length > 1) {
      changeField(1, {
        ...formValues.medlemskapsperioder[1],
        fomDato: Utils.dato.plussEnDag(formValues.medlemskapsperioder[0].tomDato),
      });
    }
    debouncedLagreMedlemskapsperioder({ medlemskapsperioder: formValues?.medlemskapsperioder, valid: formIsValid });
  }, [formValues?.medlemskapsperioder, formIsValid]);

  const handleSlett = (index: number) => {
    if (!formValues || !formValues.medlemskapsperioder) return;

    if (formValues.medlemskapsperioder[index].ny) {
      removeField(index);
      return;
    }

    Api.Medlemskapsperioder.deleteMedlemskapsperioder(behandlingID, formValues.medlemskapsperioder[index].id)
      .then(() => {
        removeField(index);
      })
      .catch((error) => {
        Utils.logger.error(error);
        changeFieldFeil(index, error.body && error.body.message ? error.body.message : error);
      });
  };

  const handleLeggTil = () => {
    if (!formValues || !formValues.medlemskapsperioder) return;

    const nyPeriodeFomDato =
      formValues.medlemskapsperioder.length > 0
        ? Utils.dato.plussEnDag(formValues.medlemskapsperioder[formValues.medlemskapsperioder.length - 1].tomDato)
        : Utils.dato.formatterDatoTilNorsk(søknadsperiode.fom);

    const nyMedlemskapsperiode = {
      id: Utils._uuid(),
      ny: true,
      fomDato: nyPeriodeFomDato,
    };
    pushField(nyMedlemskapsperiode);
  };

  const handleBekreft = () => {
    hentMedlemskapsperioder(behandlingID);
    bekreft();
  };

  const visLeggTilNyPeriode =
    formValues?.medlemskapsperioder?.length !== undefined &&
    formValues.medlemskapsperioder.length < 2 &&
    !formValues.medlemskapsperioder.some((periode) => Utils._isEmpty(periode.tomDato));

  const erAllePerioderAvslått = !formValues?.medlemskapsperioder?.some(
    (medlemskapsperiode) => medlemskapsperiode.innvilgelsesResultat !== KV.Koder.AVSLAATT
  );

  const ingenMedlemskapsperioder =
    formValues?.medlemskapsperioder?.length === undefined || formValues.medlemskapsperioder.length === 0;

  return (
    <div className="vurderingPerioder">
      <Nav.typo.Undertittel className="undertittel">
        Kontroller foreslåtte medlemskapsperioder
        <Nav.Hjelpetekst className="hjelpetekst" tittel={hjelpetekst} type={Nav.PopoverOrientering.Hoyre}>
          {hjelpetekst}
        </Nav.Hjelpetekst>
      </Nav.typo.Undertittel>

      <div>
        <Nav.typo.Element className="info_element">Søknad mottatt: </Nav.typo.Element>
        <Nav.typo.Normaltekst className="info_element">
          {Utils.dato.formatterDatoTilNorsk(mottaksdato)}
        </Nav.typo.Normaltekst>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <Nav.typo.Element className="info_element">Trygdedekning fra søknad: </Nav.typo.Element>
        <Nav.typo.Normaltekst className="info_element">
          {KV.finnTermFraListe(MKV.KTObjects.trygdedekninger, valgtTrygdedekning)}
        </Nav.typo.Normaltekst>
      </div>

      {formValues &&
        formValues.medlemskapsperioder &&
        formValues.medlemskapsperioder.map((medlemskapsperiode: MedlemskapsperiodeProp, index: number) => (
          <PeriodeElement
            key={medlemskapsperiode.id}
            index={index}
            formValues={formValues}
            handleSlett={handleSlett}
            {...props}
          />
        ))}

      {visLeggTilNyPeriode && (
        <div className="leggTilKnapp" title="Legg til ny periode">
          <Mui.Knappelenke onClick={handleLeggTil} ikon={Ikoner.Add}>
            Legg til ny periode
          </Mui.Knappelenke>
        </div>
      )}

      {erAllePerioderAvslått && !ingenMedlemskapsperioder && (
        <Nav.AlertStripe type="feil">
          Søknaden kan foreløpig ikke behandles i Melosys. Avslutt saken som bortfalt.
        </Nav.AlertStripe>
      )}

      {ingenMedlemskapsperioder && (
        <Nav.AlertStripe type="advarsel">Du må legge inn minst én periode før du kan fortsette.</Nav.AlertStripe>
      )}

      <div className="fane__knapplinje">
        <Nav.Knapp mini disabled={!props.redigerbart} className="fane__navigasjonsknapp" onClick={tilbake}>
          Tilbake
        </Nav.Knapp>
        <Nav.Hovedknapp
          mini
          disabled={!props.redigerbart || !formIsValid}
          className="fane__navigasjonsknapp"
          onClick={handleBekreft}
        >
          Fortsett
        </Nav.Hovedknapp>
      </div>
    </div>
  );
};

const VurderingPerioderForm = reduxForm<{}, PropsFromRedux & Props>({
  form: KV.Form.PERIODER,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) =>
    lagYupToReduxformErrorMapper(vurderingPerioderSchema, {
      context: {
        søknadsperiode: props.søknadsperiode,
        formValues: props.formValues,
      },
    })(values),
})(VurderingPerioder);

export default connector(VurderingPerioderForm);
