import React, { Fragment, useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { getFormValues, isValid, reduxForm } from "redux-form";
import PT from "prop-types";
import MKV from "../../../../melosyskodeverk";

import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Utils from "../../../../utils";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { anmodningsperiodesvarSelectors } from "../../../../ducks/anmodningsperiodesvar";
import { anmodningsperioderSelectors } from "../../../../ducks/anmodningsperioder";
import { vilkarSelectors } from "../../../../ducks/vilkar";
import { vedtakOperations } from "../../../../ducks/vedtak";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";

import VurderingArtikkel16VedtakSchema from "../vurderingArtikkel16VedtakSchema";
import { lagYupToReduxformErrorMapper } from "../../../../yup";
import "../vurderingArtikkel16Vedtak.css";
import { Innvilgelse } from "./innvilgelse";
import { DelvisInnvilgelse } from "./delvisInnvilgelse";
import { Avslag } from "./avslag";
import { VurderingArtikkel16VedtakBegrunnelser } from "./vurderingArtikkel16VedtakBegrunnelser";

const hentLovvalgsperiode = (anmodningsperiodesvar, anmodningsperiode) => {
  const { anmodningsperiodeSvarType, endretPeriode } = anmodningsperiodesvar;

  if (anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE) {
    return {
      fomDato: anmodningsperiode.fomDato,
      tomDato: anmodningsperiode.tomDato,
    };
  }
  if (anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE) {
    return {
      fomDato: endretPeriode.fom,
      tomDato: endretPeriode.tom,
    };
  }

  return {
    fomDato: null,
    tomDato: null,
  };
};

export const VurderingArtikkel16Vedtak = ({
  redigerbart,
  behandlingID,
  anmodningsperiode,
  anmodningsperiodesvar,
  art_12_1_begrunnelser,
  art_12_2_begrunnelser,
  formIsValid,
  formValues,
  vilkarBegrunnelser,
  behandlingstype,
  touch,
  harValgtNorskArbeidsgiver,
  endreLovvalgsperiode,
  hentLovvalgsperioder,
  lagreLovvalgsperioder,
  tilbake,
  kontrollerFerdigbehandling,
  harFeilmeldinger,
  aktivtSteg,
  publiserStegdata,
  validerBehandlingsgrunnlag,
  fattVedtak,
}) => {
  const [vedtakPending, setVedtakPending] = useState(false);
  const [oppdaterFoerKontroll, setOppdaterFoerKontroll] = useState(true);

  useEffect(() => {
    /**
     * Backend tar ansvar for å opprette en lovvalgsperiode ved POST av anmodningsperiodeSvar, med periode enten fra anmodningsperiode(ved innvilgelse eller avslag), eller fra anmodningsperiodeSvar(ved delvis innvilgelse). Henter denne ned her.
     */
    hentLovvalgsperioder(behandlingID);
  }, [anmodningsperiodesvar]);

  const { anmodningsperiodeSvarType } = anmodningsperiodesvar;

  const validerForm = () => {
    touch("vedtakstype");
    touch("vedtakstypebegrunnelse");
    touch("fomDato");
    touch("tomDato");
    return formIsValid;
  };

  const forkortLovvalgsperiode = () =>
    endreLovvalgsperiode(
      Utils.dato.formatterDatoTilISO(formValues.fomDato),
      Utils.dato.formatterDatoTilISO(formValues.tomDato)
    );

  const vedKlikkForhandsvis = async () => {
    if (!validerForm()) return false;

    if (formValues.forkortLovvalgsperiode) {
      await forkortLovvalgsperiode();
    }

    await lagreLovvalgsperioder();

    return true;
  };

  const lagFattVedtakEOSReqDto = () => {
    return {
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
      fritekst: formValues.vedtaksbrevFritekst,
      fritekstSed: null,
      mottakerinstitusjoner: null,
      vedtakstype: formValues.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      nyVurderingBakgrunn: formValues.vedtakstypebegrunnelse,
    };
  };

  useEffect(() => {
    async function kontroller() {
      if (aktivtSteg && formIsValid) {
        setVedtakPending(true);
        await kontrollerFerdigbehandling({
          behandlingID,
          vedtakstype: formValues.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
          behandlingsresultattype: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
          skalRegisteropplysningerOppdateres: oppdaterFoerKontroll,
        });
        setOppdaterFoerKontroll(false);
        setVedtakPending(false);
      }
    }

    kontroller();
  }, [aktivtSteg, formIsValid]);

  const vedKlikk = async () => {
    if (!validerForm()) return;

    if (formValues.forkortLovvalgsperiode) {
      await forkortLovvalgsperiode();
    }

    await publiserStegdata();

    setVedtakPending(true);

    validerBehandlingsgrunnlag()
      .then(() => {
        fattVedtak(behandlingID, lagFattVedtakEOSReqDto()).then((res) => {
          if (res.data?.data?.error) {
            setVedtakPending(false);
          }
        });
      })
      .catch(() => setVedtakPending(false));
  };

  const renderBegrunnelser = useCallback(
    () => (
      <VurderingArtikkel16VedtakBegrunnelser
        art12_1_begrunnelser={art_12_1_begrunnelser}
        art12_2_begrunnelser={art_12_2_begrunnelser}
        vilkarBegrunnelser={vilkarBegrunnelser}
      />
    ),
    [art_12_1_begrunnelser, art_12_2_begrunnelser, vilkarBegrunnelser]
  );

  const renderFritekstFelt = useCallback(
    () => (
      <Skjema.Textarea
        feltNavn="vedtaksbrevFritekst"
        label="Fritekst til vedtaksbrev"
        placeholder="Skriv inn tekst til vedtaksbrevet..."
        disabled={!redigerbart}
      />
    ),
    [formValues.vedtaksbrevFritekst, redigerbart]
  );

  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
  const visOrienteringsbrevArbeidsgiver = harValgtNorskArbeidsgiver && !erNyVurdering;
  const gjeldendePeriode = hentLovvalgsperiode(anmodningsperiodesvar, anmodningsperiode);
  const gjenopprettUforkortetPeriode = () => endreLovvalgsperiode(gjeldendePeriode.fomDato, gjeldendePeriode.tomDato);

  const finnVedtakInnhold = (svarType, stegErGyldig) => {
    switch (svarType) {
      case MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE:
        return (
          <Innvilgelse
            redigerbart={redigerbart}
            behandlingID={behandlingID}
            renderFritekstFelt={renderFritekstFelt}
            vedtaksbrevFritekst={formValues.vedtaksbrevFritekst}
            gjeldendePeriode={{
              fom: gjeldendePeriode.fomDato,
              tom: gjeldendePeriode.tomDato,
            }}
            visOrienteringsbrevArbeidsgiver={visOrienteringsbrevArbeidsgiver}
            onPeriodeForkorterUncheck={gjenopprettUforkortetPeriode}
            formValues={formValues}
            vedKlikkForhandsvis={vedKlikkForhandsvis}
            stegErGyldig={stegErGyldig}
          />
        );
      case MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE:
        return (
          <DelvisInnvilgelse
            redigerbart={redigerbart}
            behandlingID={behandlingID}
            renderFritekstFelt={renderFritekstFelt}
            vedtaksbrevFritekst={formValues.vedtaksbrevFritekst}
            gjeldendePeriode={{
              fom: gjeldendePeriode.fomDato,
              tom: gjeldendePeriode.tomDato,
            }}
            renderBegrunnelser={renderBegrunnelser}
            visOrienteringsbrevArbeidsgiver={visOrienteringsbrevArbeidsgiver}
            onPeriodeForkorterUncheck={gjenopprettUforkortetPeriode}
            formValues={formValues}
            vedKlikkForhandsvis={vedKlikkForhandsvis}
            stegErGyldig={stegErGyldig}
          />
        );
      case MKV.Koder.anmodningsperiodesvartyper.AVSLAG:
        return (
          <Avslag
            redigerbart={redigerbart}
            behandlingID={behandlingID}
            renderFritekstFelt={renderFritekstFelt}
            vedtaksbrevFritekst={formValues.vedtaksbrevFritekst}
            renderBegrunnelser={renderBegrunnelser}
            visOrienteringsbrevArbeidsgiver={visOrienteringsbrevArbeidsgiver}
          />
        );
      default:
        throw new Error(`AnmodningsperiodeSvarType ${svarType} er ugyldig`);
    }
  };

  const stegErGyldig =
    redigerbart &&
    formIsValid &&
    (!harFeilmeldinger || anmodningsperiodeSvarType === MKV.Koder.anmodningsperiodesvartyper.AVSLAG);
  const vedtakInnhold = finnVedtakInnhold(anmodningsperiodeSvarType, stegErGyldig);

  return (
    <Fragment>
      {vedtakInnhold}
      <Nav.Row>
        <Nav.Column xs="7" className="fane__fot">
          {erNyVurdering && <Skjema.Vedtakstype redigerbart={redigerbart} className="vedtakstype" />}
          {erNyVurdering && redigerbart && (
            <Nav.AlertStripeInfo>{KV.Koder.AlertstripeTekst.NY_VURDERING_MEDL_TEKST}</Nav.AlertStripeInfo>
          )}
          <Mui.StegKnapper
            bekreftKnappProps={{
              spinner: vedtakPending,
              autoDisableVedSpinner: true,
              disabled: !stegErGyldig,
              onClick: vedKlikk,
            }}
            bekreftTekst="Fatt vedtak"
            tilbakeKnappProps={{
              onClick: tilbake,
              disabled: !redigerbart,
            }}
          />
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

VurderingArtikkel16Vedtak.propTypes = {
  anmodningsperiodesvar: PT.object,
  behandlingID: PT.number.isRequired,
  behandlingstype: PT.string.isRequired,
  formIsValid: PT.bool.isRequired,
  tilbake: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  vilkarBegrunnelser: PT.arrayOf(PT.string).isRequired,
  art_12_1_begrunnelser: PT.arrayOf(PT.string).isRequired,
  art_12_2_begrunnelser: PT.arrayOf(PT.string).isRequired,
  touch: PT.func.isRequired,
  formValues: PT.object,
  harValgtNorskArbeidsgiver: PT.bool.isRequired,
  endreLovvalgsperiode: PT.func.isRequired,
  lagreLovvalgsperioder: PT.func.isRequired,
  anmodningsperiode: PT.object,
  hentLovvalgsperioder: PT.func.isRequired,
  kontrollerFerdigbehandling: PT.func.isRequired,
  harFeilmeldinger: PT.bool.isRequired,
  aktivtSteg: PT.bool,
  validerBehandlingsgrunnlag: PT.func.isRequired,
  fattVedtak: PT.func.isRequired,
  publiserStegdata: PT.func.isRequired,
};

VurderingArtikkel16Vedtak.defaultProps = {
  formValues: {},
  anmodningsperiodesvar: {},
  anmodningsperiode: {},
  aktivtSteg: false,
};

const VurderingArtikkel16VedtakForm = reduxForm({
  form: KV.Form.ARTIKKEL_16_1_VEDTAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) =>
    lagYupToReduxformErrorMapper(VurderingArtikkel16VedtakSchema, {
      context: {
        behandlingstype: props.behandlingstype,
        lovvalgsperiode: hentLovvalgsperiode(props.anmodningsperiodesvar, props.anmodningsperiode),
      },
    })(values),
})(VurderingArtikkel16Vedtak);

const mapStateToProps = (state) => {
  const anmodningsperiodesvartype = anmodningsperiodesvarSelectors.AnmodningsperiodeSvarTypeSelector(state);
  const anmodningsperiodesvarTom = anmodningsperiodesvarSelectors.EndretPeriodeTomSelector(state);
  const lovvalgsperiodeTom = lovvalgsperioderSelectors.TomDatoSelector(state);
  const anmodningsperiodesvarFom = anmodningsperiodesvarSelectors.EndretPeriodeFomSelector(state);
  const lovvalgsperiodeFom = lovvalgsperioderSelectors.FomDatoSelector(state);
  const anmodningsperiodeTom = anmodningsperioderSelectors.TomDatoSelector(state);
  const anmodningsperiodeFom = anmodningsperioderSelectors.FomDatoSelector(state);

  const erLovvalgsperiodeForkortet = () => {
    if (anmodningsperiodesvartype === MKV.Koder.anmodningsperiodesvartyper.INNVILGELSE) {
      return (
        Utils.dato.datoDiffPure(anmodningsperiodeTom, lovvalgsperiodeTom, "days") !== 0 ||
        Utils.dato.datoDiffPure(anmodningsperiodeFom, lovvalgsperiodeFom, "days") !== 0
      );
    }
    if (anmodningsperiodesvartype === MKV.Koder.anmodningsperiodesvartyper.DELVIS_INNVILGELSE) {
      return (
        Utils.dato.datoDiffPure(anmodningsperiodesvarTom, lovvalgsperiodeTom, "days") !== 0 ||
        Utils.dato.datoDiffPure(anmodningsperiodesvarFom, lovvalgsperiodeFom, "days") !== 0
      );
    }
    return false;
  };

  const forkortLovvalgsperiode = erLovvalgsperiodeForkortet();

  return {
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
    behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
    lagretFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
    lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
    anmodningsperiode: anmodningsperioderSelectors.AnmodningsperiodeSelector(state),
    anmodningsperiodesvar: anmodningsperiodesvarSelectors.AnmodningsperiodesvarSelector(state),
    vilkarBegrunnelser: vilkarSelectors.vilkarBegrunnelserSelector(state),
    art_12_1_begrunnelser: vilkarSelectors.art12_1_begrunnelserSelector(state),
    art_12_2_begrunnelser: vilkarSelectors.art12_2_begrunnelserSelector(state),
    formIsValid: isValid(KV.Form.ARTIKKEL_16_1_VEDTAK)(state),
    formValues: getFormValues(KV.Form.ARTIKKEL_16_1_VEDTAK)(state),
    initialValues: {
      forkortLovvalgsperiode,
      tomDato: forkortLovvalgsperiode
        ? Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.TomDatoSelector(state))
        : "",
      fomDato: forkortLovvalgsperiode
        ? Utils.dato.formatterDatoTilNorsk(lovvalgsperioderSelectors.FomDatoSelector(state))
        : "",
      vedtakstypebegrunnelse: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
      vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
      vedtaksbrevFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
    },
  };
};

const mapDispatchToProps = (dispatch) => ({
  endreLovvalgsperiode: (fomdato, tomdato) =>
    dispatch(lovvalgsperioderOperations.endreLovvalgsPeriode(fomdato, tomdato)),
  hentLovvalgsperioder: (behandlingID) => dispatch(lovvalgsperioderOperations.hent(behandlingID)),
  lagreLovvalgsperioder: () => dispatch(lovvalgsperioderOperations.lagre()),
  fattVedtak: (behandlingID, body) => dispatch(vedtakOperations.fatt(behandlingID, body)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VurderingArtikkel16VedtakForm);
