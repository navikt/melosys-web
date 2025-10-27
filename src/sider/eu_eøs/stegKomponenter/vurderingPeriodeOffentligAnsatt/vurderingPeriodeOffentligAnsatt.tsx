import React, { useEffect } from "react";
import { connect } from "react-redux";
import { getFormValues, isValid, reduxForm } from "redux-form";
import { RootState } from "AppTypes";

import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as KV from "../../../../kodeverk";
import * as Mui from "../../../../felleskomponenter/ui";

import { lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";

import {
  konverterLovvalgsbestemmelseTilStegData,
  lagLovvalgsbestemmelse,
  lagLovvalgsperiode,
  lagTilleggBestemmelse,
  slettTilleggBestemmelse,
} from "../../../../felleskomponenter/stegvelger";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import VurderingPeriodeOffentligAnsattSchema from "./vurderingPeriodeOffentligAnsattSchema";

interface FormValues {
  lovvalgsbestemmelse?: string;
  forkortLovvalgsperiode?: boolean;
  fomDato?: string;
  tomDato?: string;
}

interface Props {
  redigerbart: boolean;
  formIsValid: boolean;
  formValues?: FormValues;
  handleSubmit: (callback: () => void) => (e: React.FormEvent) => void;
  byggLovvalgsperioder: () => void;
  lovvalgsbestemmelseSomSkalLagres?: string;
  oppdaterData: (data: unknown) => void;
  slettData: (data?: unknown) => void;
  tilbake: () => void;
  bekreftOgFortsett: () => void;
  mottatteOpplysningerFom: string;
  mottatteOpplysningerTom: string | null;
  soknadsperiode: {
    fom: string;
    tom: string;
  };
}

export function VurderingPeriodeOffentligAnsatt({
  redigerbart,
  formIsValid,
  formValues = {},
  handleSubmit,
  byggLovvalgsperioder: gjenopprettOpprinneligLovvalgsperiode,
  lovvalgsbestemmelseSomSkalLagres = "",
  oppdaterData,
  slettData,
  tilbake,
  bekreftOgFortsett,
  mottatteOpplysningerFom,
  mottatteOpplysningerTom = null,
  soknadsperiode,
}: Props) {
  useEffect(() => {
    if (lovvalgsbestemmelseSomSkalLagres) {
      oppdaterData(konverterLovvalgsbestemmelseTilStegData(lovvalgsbestemmelseSomSkalLagres));
    }

    if (redigerbart) {
      oppdaterData(
        lagLovvalgsperiode({
          fomDato: mottatteOpplysningerFom,
          tomDato: mottatteOpplysningerTom,
        }),
      );
    }

    return () => {
      slettData();
    };
  }, []);

  const valgbareLovvalgsbestemmelser = [
    ...MKV.KTObjects.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.filter(
      ({ kode }: { kode: string }) =>
        kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3B,
    ),
    ...MKV.KTObjects.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.filter(
      ({ kode }: { kode: string }) =>
        kode === MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5,
    ),
  ];

  useEffect(() => {
    if (
      formValues.lovvalgsbestemmelse ===
      MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5
    ) {
      oppdaterData(
        lagLovvalgsbestemmelse(MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A),
      );
      oppdaterData(
        lagTilleggBestemmelse(MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_5),
      );
    } else if (formValues.lovvalgsbestemmelse) {
      oppdaterData(lagLovvalgsbestemmelse(formValues.lovvalgsbestemmelse));
      slettData(slettTilleggBestemmelse());
    }
  }, [formValues.lovvalgsbestemmelse]);

  const onSubmit = () => {
    bekreftOgFortsett();
  };

  const fom = Utils.dato.formatterDatoTilNorsk(
    (formValues.forkortLovvalgsperiode && formValues.fomDato) || soknadsperiode.fom,
  );
  const tom = Utils.dato.formatterDatoTilNorsk(
    (formValues.forkortLovvalgsperiode && formValues.tomDato) || soknadsperiode.tom,
  );

  const stegErGyldig = redigerbart && formIsValid && formValues.lovvalgsbestemmelse;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="vurderingPeriodeOffentligAnsatt">
      <Nav.Heading level="1" className="stegvelgertittel">
        Lovvalgsbestemmelse og -periode
      </Nav.Heading>
      <Nav.Row className="velgLovvalgsbestemmelse">
        <Nav.Column xs="7">
          <Skjema.Select label="Velg en lovvalgsbestemmelse" feltNavn="lovvalgsbestemmelse" disabled={!redigerbart}>
            <option value="">Velg...</option>
            {valgbareLovvalgsbestemmelser.map((bestemmelse) => (
              <option key={bestemmelse.kode} value={bestemmelse.kode}>
                {bestemmelse.term}
              </option>
            ))}
          </Skjema.Select>
        </Nav.Column>
      </Nav.Row>
      {redigerbart && (
        <>
          <Nav.BodyLong weight="semibold" size="small" className="undertittel">
            Lovvalgsperiode
          </Nav.BodyLong>
          <Nav.Row className="lovvalgsperiode">
            <Nav.Column xs="6">
              {fom} - {tom}
            </Nav.Column>
          </Nav.Row>
        </>
      )}
      <Skjema.PeriodeForkorter
        className="periodeForkorter"
        redigerbart={redigerbart}
        fomRedigerbar
        checkboxClassName="forkortLovvalgsperiode"
        checkboxLabel="Lovvalget innvilges for en kortere periode"
        checkboxFeltnavn="forkortLovvalgsperiode"
        onUncheck={gjenopprettOpprinneligLovvalgsperiode}
        forkortPeriode={formValues.forkortLovvalgsperiode || false}
        fomLabel="Startdato"
        fomFeltNavn="fomDato"
        tomLabel="Sluttdato"
        tomFeltNavn="tomDato"
        minDate={Utils.dato.isoStringTilDate(soknadsperiode.fom) || new Date()}
        maxDate={Utils.dato.isoStringTilDate(soknadsperiode.tom)}
      />

      <Mui.StegKnapper
        bekreftKnappProps={{
          disabled: !stegErGyldig,
        }}
        tilbakeKnappProps={{
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            tilbake();
          },
          disabled: !redigerbart,
        }}
      />
    </form>
  );
}

interface OwnProps {
  lovvalgsbestemmelseSomSkalVises?: string;
  redigerbart: boolean;
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const forkortLovvalgsperiode = ownProps.redigerbart
    ? false
    : Utils.dato.datoDiffPure(
        mottatteOpplysningerSelectors.PeriodeSelector(state).tom,
        lovvalgsperioderSelectors.TomDatoSelector(state),
        "days",
      ) !== 0;

  return {
    mottatteOpplysningerFom: mottatteOpplysningerSelectors.PeriodeFomSelector(state),
    mottatteOpplysningerTom: mottatteOpplysningerSelectors.PeriodeTomSelector(state),
    soknadsperiode: mottatteOpplysningerSelectors.PeriodeSelector(state),
    formIsValid: isValid(KV.Form.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK)(state),
    formValues: getFormValues(KV.Form.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK)(state),
    initialValues: {
      forkortLovvalgsperiode,
      tomDato: Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.TomDatoSelector(state)),
      fomDato: Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.FomDatoSelector(state)),
      lovvalgsbestemmelse: ownProps.lovvalgsbestemmelseSomSkalVises,
    },
  };
};

const VurderingPeriodeOffentligAnsattForm = reduxForm<FormValues, Props>({
  form: KV.Form.ARBEID_TJENESTEPERSON_ELLER_FLY_VEDTAK,
  enableReinitialize: true,
  destroyOnUnmount: false, // VIKTIG: Vi må beholde form state til vedtak-steget
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) =>
    lagYupToReduxformErrorMapper(VurderingPeriodeOffentligAnsattSchema, {
      context: {
        soknadsperiode: props.soknadsperiode,
      },
    })(values),
})(VurderingPeriodeOffentligAnsatt);

export default connect(mapStateToProps)(VurderingPeriodeOffentligAnsattForm);
