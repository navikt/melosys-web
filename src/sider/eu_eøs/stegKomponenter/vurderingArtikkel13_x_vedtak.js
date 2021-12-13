import React, { Fragment, useState } from "react";
import { connect } from "react-redux";
import { reduxForm, isValid, getFormValues } from "redux-form";
import PT from "prop-types";
import * as EKV from "eessi-kodeverk";

import MKV from "../../../melosyskodeverk";

import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as KV from "../../../kodeverk";
import * as MPT from "../../../proptypes";
import * as Mui from "../../../felleskomponenter/ui";
import * as Hooks from "../../../hooks";

import PdfLenkeListe from "../../../felleskomponenter/pdfLenkeListe";

import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { lovvalgsperioderSelectors, lovvalgsperioderOperations } from "../../../ducks/lovvalgsperioder";
import { redigerbartSelectors } from "../../../ducks/redigerbart";
import { behandlingsgrunnlagSelectors } from "../../../ducks/behandlingsgrunnlag";
import { avklartefaktaSelectors } from "../../../ducks/avklartefakta";
import { formOperations } from "../../../ducks/form";
import { MottakerinstitusjonvelgerFlervalg } from "../../../felleskomponenter/mottakerinstitusjonvelger";
import { lagYupToReduxformErrorMapper } from "../../../yup";
import VurderingArtikkel13_x_vedtakSchema from "./vurderingArtikkel13_x_vedtakSchema";

import "./vurderingArtikkel13_x_vedtak.css";

export const VurderingArtikkel13_x_vedtak = ({
  redigerbart,
  tilbake,
  behandlingID,
  lovvalgsperiode,
  harLandSomKreverSED,
  formIsValid,
  formValues,
  form,
  handleSubmit,
  touchAll,
  endreLovvalgsPeriode,
  tilstand: { overskrift },
  lagreLovvalgsperioder,
  byggLovvalgsperioder: gjenopprettOpprinneligLovvalgsperiode,
  behandlingstype,
  soknadsperiode,
}) => {
  const [vedtakPending, setVedtakPending] = useState(false);
  const isMounted = Hooks.useIsMounted();

  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

  const forkortLovvalgsperiode = () =>
    endreLovvalgsPeriode(lovvalgsperiode.fomDato, Utils.dato.formatterDatoTilISO(formValues.tomDato));

  const vedKlikkForhandsvis = async () => {
    if (!formIsValid) {
      touchAll();
      return false;
    }

    if (formValues.forkortLovvalgsperiode) {
      await forkortLovvalgsperiode();
    }

    lagreLovvalgsperioder();
    return formIsValid;
  };

  const skalViseSedAlternativer = redigerbart && harLandSomKreverSED;

  const pdfDokumenter = [
    {
      navn: "Forhåndsvis vedtaksbrev og A1",
      type: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV_FLERE_LAND,
      data: {
        mottaker: MKV.Koder.aktoersroller.BRUKER,
        fritekst: formValues.vedtaksbrevFritekst,
      },
    },
  ];

  if (skalViseSedAlternativer) {
    pdfDokumenter.push({
      navn: "Forhåndsvis SED A003",
      type: EKV.Koder.sedtyper.A003,
      erSed: true,
      data: {
        fritekst: formValues.fritekstSed,
      },
    });
  }

  const fom = Utils.dato.formatterDatoTilNorsk(soknadsperiode.fom);
  const tom = Utils.dato.formatterDatoTilNorsk(soknadsperiode.tom);

  const fattVedtak = async (values, dispatch, props) => {
    setVedtakPending(true);

    if (values.forkortLovvalgsperiode) {
      await props.endreLovvalgsPeriode(props.lovvalgsperiode.fomDato, Utils.dato.formatterDatoTilISO(values.tomDato));
    }

    await props.lagreOgFatteVedtak({
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FORELOEPIG_FASTSATT_LOVVALGSLAND,
      fritekst: values.vedtaksbrevFritekst,
      fritekstSed: values.fritekstSed,
      mottakerinstitusjoner: values.mottakerinstitusjoner
        .filter((inst) => inst.kreverMottakerinstitusjon)
        .map((inst) => inst.id),
      vedtakstype: values.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      revurderBegrunnelse: values.vedtakstypebegrunnelse,
    });

    // Vedtak-operation navigerer til forside, og komponenten kan derfor være unmountet.
    if (isMounted.current) {
      setVedtakPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(fattVedtak)} className="vurderingArtikkel13_x_vedtak">
      <Nav.Typo.Undertittel>{overskrift}</Nav.Typo.Undertittel>
      {redigerbart && (
        <Fragment>
          <Nav.Typo.Element className="undertittel">Søknadsperiode</Nav.Typo.Element>
          <Nav.Row className="lovvalgsperiode">
            <Nav.Column xs="6">
              {fom} - {tom}
            </Nav.Column>
          </Nav.Row>
        </Fragment>
      )}
      <Skjema.PeriodeForkorter
        redigerbart={redigerbart}
        fomRedigerbar={false}
        checkboxClassName="forkortLovvalgsperiode"
        checkboxLabel="Lovvalget innvilges for en kortere periode"
        checkboxFeltnavn="forkortLovvalgsperiode"
        onUncheck={gjenopprettOpprinneligLovvalgsperiode}
        forkortPeriode={formValues.forkortLovvalgsperiode}
        fomLabel="Startdato"
        fomFeltNavn="fomDato"
        tomLabel="Sluttdato"
        tomFeltNavn="tomDato"
      />
      {erNyVurdering && <Skjema.Vedtakstype redigerbart={redigerbart} />}
      <Nav.Row className="fritekst">
        <Nav.Column xs="8">
          <Skjema.Textarea
            feltNavn="vedtaksbrevFritekst"
            label="Fritekst til vedtaksbrev"
            placeholder="Skriv inn tekst til vedtaksbrevet..."
            disabled={!redigerbart}
          />
        </Nav.Column>
      </Nav.Row>
      {skalViseSedAlternativer && (
        <Nav.Row className="fritekstSed">
          <Nav.Column xs="8">
            <Skjema.Textarea
              label="Ytterligere informasjon til SED (valgfri)"
              feltNavn="fritekstSed"
              disabled={!redigerbart}
              visTellerFra={500}
              maxLength={500}
            />
          </Nav.Column>
        </Nav.Row>
      )}
      <Nav.Row>
        <Nav.Column xs="8">
          <MottakerinstitusjonvelgerFlervalg
            feltnavn="mottakerinstitusjoner"
            bucType={EKV.Koder.buctyper.legislation.LA_BUC_02}
            redigerbart={redigerbart}
            form={form}
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="6">
          {redigerbart && (
            <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} vedKlikk={vedKlikkForhandsvis} />
          )}
        </Nav.Column>
      </Nav.Row>
      <Mui.StegKnapper
        bekreftKnappProps={{
          spinner: vedtakPending,
          autoDisableVedSpinner: true,
          disabled: !redigerbart,
          htmlType: "submit",
        }}
        bekreftTekst="FATT VEDTAK"
        tilbakeKnappProps={{
          onClick: tilbake,
          disabled: !redigerbart,
        }}
      />
    </form>
  );
};

VurderingArtikkel13_x_vedtak.propTypes = {
  tilstand: PT.shape({
    overskrift: PT.string.isRequired,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
  tilbake: PT.func.isRequired,
  behandlingID: PT.number.isRequired,
  lovvalgsperiode: MPT.Periode,
  harLandSomKreverSED: PT.bool.isRequired,
  lagreOgFatteVedtak: PT.func.isRequired,
  formIsValid: PT.bool.isRequired,
  formValues: PT.object,
  touchAll: PT.func.isRequired,
  endreLovvalgsPeriode: PT.func.isRequired,
  byggLovvalgsperioder: PT.func.isRequired,
  lagreLovvalgsperioder: PT.func.isRequired,
  behandlingstype: PT.string.isRequired,
  form: PT.string.isRequired,
  handleSubmit: PT.func.isRequired,
  soknadsperiode: PT.shape({
    fom: PT.string.isRequired,
    tom: PT.string.isRequired,
  }).isRequired,
};

VurderingArtikkel13_x_vedtak.defaultProps = {
  lovvalgsperiode: {},
  formValues: {},
};

const mapStateToProps = (state) => {
  const lovvalgsperiodeTom = lovvalgsperioderSelectors.TomDatoSelector(state);
  const erLovvalgsperiodeForkortet = () =>
    Utils.dato.datoDiffPure(behandlingsgrunnlagSelectors.PeriodeSelector(state).tom, lovvalgsperiodeTom, "days") !== 0;

  const forkortLovvalgsperiode = lovvalgsperiodeTom === null ? false : erLovvalgsperiodeForkortet();

  return {
    behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
    redigerbart: redigerbartSelectors.RedigerbartSelector(state),
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
    lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
    harLandSomKreverSED: avklartefaktaSelectors.LandSomKreverSEDSelector(state).length > 0,
    soknadsperiode: behandlingsgrunnlagSelectors.PeriodeSelector(state),
    formIsValid: isValid(KV.Form.ARTIKKEL_13_X_VEDTAK)(state),
    formValues: getFormValues(KV.Form.ARTIKKEL_13_X_VEDTAK)(state),
    initialValues: {
      forkortLovvalgsperiode,
      tomDato: forkortLovvalgsperiode
        ? Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.TomDatoSelector(state))
        : "",
      fomDato: Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.FomDatoSelector(state)),
      vedtakstypebegrunnelse: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
      vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
      vedtaksbrevFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
      mottakerinstitusjoner: avklartefaktaSelectors.LandSomKreverSEDKTSelector(state) || [],
      kreverMottakerinstitusjon: false,
      fritekstSed: null,
    },
  };
};

const mapDispatchToProps = (dispatch) => ({
  endreLovvalgsPeriode: (fomdato, tomdato) =>
    dispatch(lovvalgsperioderOperations.endreLovvalgsPeriode(fomdato, tomdato)),
  touchAll: () => dispatch(formOperations.touchAll(KV.Form.ARTIKKEL_13_X_VEDTAK)),
});

const VurderingArtikkel13_x_vedtak_form = reduxForm({
  form: KV.Form.ARTIKKEL_13_X_VEDTAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) =>
    lagYupToReduxformErrorMapper(VurderingArtikkel13_x_vedtakSchema, {
      context: {
        soknadsperiode: props.soknadsperiode,
        behandlingstype: props.behandlingstype,
      },
    })(values),
})(VurderingArtikkel13_x_vedtak);

export default connect(mapStateToProps, mapDispatchToProps)(VurderingArtikkel13_x_vedtak_form);
