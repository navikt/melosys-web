import { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { getFormValues, isValid, reduxForm } from "redux-form";
import PT from "prop-types";
import * as EKV from "eessi-kodeverk";

import MKV from "../../../../melosyskodeverk";

import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as KV from "../../../../kodeverk";
import * as MPT from "../../../../proptypes";
import * as Mui from "../../../../felleskomponenter/ui";
import Dokumentliste from "../../../../felleskomponenter/dokumentliste";
import { MottakerinstitusjonvelgerFlervalg } from "../../../../felleskomponenter/mottakerinstitusjonvelger";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";
import { formOperations } from "../../../../ducks/form";
import { vedtakOperations } from "../../../../ducks/vedtak";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import VurderingArtikkel13_x_vedtakSchema from "./vurderingArtikkel13_x_vedtakSchema";
import "./vurderingArtikkel13_x_vedtak.less";

export function VurderingArtikkel13_x_vedtak({
  redigerbart,
  tilbake,
  behandlingID,
  lovvalgsperiode = {},
  harLandSomKreverSED,
  formIsValid,
  formValues = {},
  form,
  handleSubmit,
  touchAll,
  endreLovvalgsPeriode,
  tilstand: { overskrift },
  lagreLovvalgsperioder,
  behandlingstype,
  soknadsperiode,
  kontrollerFerdigbehandling,
  harFeilmeldinger,
  aktivtSteg = false,
  validerMottatteOpplysninger,
  fattVedtak,
  mottatteOpplysningerStatus,
}) {
  const [vedtakPending, setVedtakPending] = useState(false);
  let oppdaterFørKontroll = true;

  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

  const fom = Utils.dato.formatterDatoTilNorsk(
    (formValues.forkortLovvalgsperiode && formValues.fomDato) || soknadsperiode.fom,
  );
  const tom = Utils.dato.formatterDatoTilNorsk(
    (formValues.forkortLovvalgsperiode && formValues.tomDato) || soknadsperiode.tom,
  );

  const kontrollerBehandling = async (data) => {
    if (redigerbart && data.mottatteOpplysningerStatus === "OK" && data.aktivtSteg && data.formIsValid) {
      setVedtakPending(true);
      const request = {
        behandlingID,
        vedtakstype: data.formValues.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
        behandlingsresultattype: MKV.Koder.behandlinger.behandlingsresultattyper.FORELOEPIG_FASTSATT_LOVVALGSLAND,
        skalRegisteropplysningerOppdateres: oppdaterFørKontroll,
      };
      oppdaterFørKontroll = false;
      await kontrollerFerdigbehandling(request);
      setVedtakPending(false);
    }
  };
  const debouncedKontrollerBehandling = useCallback(Utils._debounce(kontrollerBehandling, 500), [
    kontrollerFerdigbehandling,
  ]);

  useEffect(() => {
    debouncedKontrollerBehandling({ aktivtSteg, formIsValid, formValues, mottatteOpplysningerStatus });
  }, [aktivtSteg, formIsValid, mottatteOpplysningerStatus]);

  const oppdaterLovvalgsperiode = async (fomdato, tomdato) => {
    await endreLovvalgsPeriode(fomdato, tomdato);
    lagreLovvalgsperioder();
  };

  useEffect(() => {
    if (!redigerbart) return;
    const isoTomDato = Utils.dato.formatterDatoTilISO(formValues.tomDato, null);
    if (isoTomDato) {
      oppdaterLovvalgsperiode(lovvalgsperiode.fomDato, isoTomDato);
    }
    debouncedKontrollerBehandling({ aktivtSteg, formIsValid, formValues, mottatteOpplysningerStatus });
  }, [formValues?.tomDato]);

  const gjenopprettOpprinneligLovvalgsperiode = () => {
    oppdaterLovvalgsperiode(soknadsperiode.fom, soknadsperiode.tom);
  };

  const vedKlikkForhandsvis = async () => {
    if (!formIsValid) {
      touchAll();
      return false;
    }
    return formIsValid;
  };

  const skalViseSedAlternativer = redigerbart && harLandSomKreverSED;

  const pdfDokumenter = [
    {
      dokumentData: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV_FLERE_LAND,
        mottaker: MKV.Koder.mottakerroller.BRUKER,
        fritekst: formValues.vedtaksbrevFritekst,
      },
    },
  ];

  if (skalViseSedAlternativer) {
    pdfDokumenter.push({
      sedType: EKV.Koder.sedtyper.A003,
      sedData: {
        fritekst: formValues.fritekstSed,
      },
    });
  }

  const lagFattVedtakEOSReqDto = () => {
    return {
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FORELOEPIG_FASTSATT_LOVVALGSLAND,
      fritekst: formValues.vedtaksbrevFritekst,
      fritekstSed: formValues.fritekstSed,
      mottakerinstitusjoner: formValues.mottakerinstitusjoner
        .filter((inst) => inst.kreverMottakerinstitusjon)
        .map((inst) => inst.id),
      vedtakstype: formValues.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      nyVurderingBakgrunn: formValues.vedtakstypebegrunnelse,
    };
  };

  const onSubmit = async () => {
    debouncedKontrollerBehandling.cancel?.();

    setVedtakPending(true);

    validerMottatteOpplysninger()
      .then(() => {
        fattVedtak(behandlingID, lagFattVedtakEOSReqDto()).then((res) => {
          if (res.data?.data?.error) {
            setVedtakPending(false);
          }
        });
      })
      .catch(() => setVedtakPending(false));
  };

  const stegErGyldig = redigerbart && formIsValid && !harFeilmeldinger;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="vurderingArtikkel13_x_vedtak">
      <Nav.Heading level="1" className="stegvelgertittel">
        {overskrift}
      </Nav.Heading>
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
        redigerbart={redigerbart}
        fomRedigerbar
        checkboxClassName="forkortLovvalgsperiode"
        checkboxLabel="Lovvalget innvilges for en kortere periode"
        checkboxFeltnavn="forkortLovvalgsperiode"
        onUncheck={gjenopprettOpprinneligLovvalgsperiode}
        forkortPeriode={formValues.forkortLovvalgsperiode}
        fomLabel="Startdato"
        fomFeltNavn="fomDato"
        minDate={Utils.dato.isoStringTilDate(soknadsperiode.fom)}
        maxDate={Utils.dato.isoStringTilDate(soknadsperiode.tom)}
        tomLabel="Sluttdato"
        tomFeltNavn="tomDato"
      />
      {erNyVurdering && <Skjema.Vedtakstype redigerbart={redigerbart} />}
      <Nav.Row className="fritekst">
        <Nav.Column xs="8">
          <Skjema.Textarea
            feltNavn="vedtaksbrevFritekst"
            label="Fritekst til begrunnelse"
            readOnly={!redigerbart}
            maxLength={4000}
          />
        </Nav.Column>
      </Nav.Row>
      {skalViseSedAlternativer && (
        <Nav.Row className="fritekstSed">
          <Nav.Column xs="8">
            <Skjema.Textarea
              label="Ytterligere informasjon til SED (valgfri)"
              feltNavn="fritekstSed"
              maxLength={500}
              readOnly={!redigerbart}
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
        <Nav.Column xs="8">
          {stegErGyldig && (
            <Dokumentliste
              behandlingID={behandlingID}
              dokumenter={pdfDokumenter}
              validateOnClick={vedKlikkForhandsvis}
            />
          )}
        </Nav.Column>
      </Nav.Row>
      {erNyVurdering && redigerbart && (
        <Nav.Alert variant="info">{KV.Koder.AlertstripeTekst.NY_VURDERING_MEDL_TEKST}</Nav.Alert>
      )}
      <Mui.StegKnapper
        bekreftKnappProps={{
          loading: vedtakPending,
          disabled: !stegErGyldig,
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{
          onClick: (e) => {
            e.preventDefault();
            tilbake();
          },
          disabled: !redigerbart,
        }}
      />
    </form>
  );
}

VurderingArtikkel13_x_vedtak.propTypes = {
  tilstand: PT.shape({
    overskrift: PT.string.isRequired,
  }).isRequired,
  redigerbart: PT.bool.isRequired,
  tilbake: PT.func.isRequired,
  behandlingID: PT.number.isRequired,
  lovvalgsperiode: MPT.Periode,
  harLandSomKreverSED: PT.bool.isRequired,
  formIsValid: PT.bool.isRequired,
  formValues: PT.object,
  touchAll: PT.func.isRequired,
  endreLovvalgsPeriode: PT.func.isRequired,
  lagreLovvalgsperioder: PT.func.isRequired,
  behandlingstype: PT.string.isRequired,
  form: PT.string.isRequired,
  handleSubmit: PT.func.isRequired,
  soknadsperiode: PT.shape({
    fom: PT.string.isRequired,
    tom: PT.string,
  }).isRequired,
  kontrollerFerdigbehandling: PT.func.isRequired,
  harFeilmeldinger: PT.bool.isRequired,
  aktivtSteg: PT.bool,
  validerMottatteOpplysninger: PT.func.isRequired,
  fattVedtak: PT.func.isRequired,
  mottatteOpplysningerStatus: PT.string.isRequired,
};

const mapStateToProps = (state) => {
  const lovvalgsperiodeTom = lovvalgsperioderSelectors.TomDatoSelector(state);
  const erLovvalgsperiodeForkortet = () =>
    Utils.dato.datoDiffPure(mottatteOpplysningerSelectors.PeriodeSelector(state).tom, lovvalgsperiodeTom, "days") !== 0;

  const forkortLovvalgsperiode = lovvalgsperiodeTom === null ? false : erLovvalgsperiodeForkortet();

  return {
    behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
    redigerbart: redigerbartSelectors.RedigerbartSelector(state),
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
    lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
    harLandSomKreverSED: avklartefaktaSelectors.LandSomKreverSEDSelector(state).length > 0,
    soknadsperiode: mottatteOpplysningerSelectors.PeriodeSelector(state),
    mottatteOpplysningerStatus: mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector(state),
    formIsValid: isValid(KV.Form.ARTIKKEL_13_X_VEDTAK)(state),
    formValues: getFormValues(KV.Form.ARTIKKEL_13_X_VEDTAK)(state),
    initialValues: {
      forkortLovvalgsperiode,
      tomDato: Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.TomDatoSelector(state)),
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
  lagreLovvalgsperioder: () => dispatch(lovvalgsperioderOperations.lagre()),
  endreLovvalgsPeriode: async (fomdato, tomdato) =>
    dispatch(lovvalgsperioderOperations.endreLovvalgsPeriode(fomdato, tomdato)),
  touchAll: () => dispatch(formOperations.touchAll(KV.Form.ARTIKKEL_13_X_VEDTAK)),
  fattVedtak: (behandlingID, body) => dispatch(vedtakOperations.fatt(behandlingID, body)),
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
