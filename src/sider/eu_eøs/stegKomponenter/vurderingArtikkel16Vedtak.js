import React, { Fragment, useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { getFormValues, isValid, reduxForm } from "redux-form";
import PT from "prop-types";
import MKV from "../../../melosyskodeverk";

import * as Nav from "../../../navFrontend";
import * as MPT from "../../../proptypes";
import * as KV from "../../../kodeverk";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Mui from "../../../felleskomponenter/ui";
import * as Utils from "../../../utils";

import Begrunnelser from "../../../felleskomponenter/begrunnelser";
import PdfLenkeListe from "../../../felleskomponenter/pdfLenkeListe";
import DatoOmrade from "../../../felleskomponenter/datoOmrade/datoOmrade";

import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { anmodningsperiodesvarSelectors } from "../../../ducks/anmodningsperiodesvar";
import { anmodningsperioderSelectors } from "../../../ducks/anmodningsperioder";
import { vilkarSelectors } from "../../../ducks/vilkar";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../../ducks/lovvalgsperioder";
import { vedtakOperations } from "../../../ducks/vedtak";
import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import VurderingArtikkel16VedtakSchema from "./vurderingArtikkel16VedtakSchema";

import "./vurderingArtikkel16Vedtak.css";

export const VurderingArtikkel16VedtakBegrunnelser = ({
  art12_1_begrunnelser,
  art12_2_begrunnelser,
  vilkarBegrunnelser,
}) => {
  const muligeVirksomhetBegrunnelser = [
    ...MKV.KTObjects.begrunnelser.art12_2_normalt_virksomhet,
    ...MKV.KTObjects.begrunnelser.art12_1_vesentlig_virksomhet,
    ...MKV.KTObjects.begrunnelser.art12_1_forutgaaende_medl,
    ...MKV.KTObjects.begrunnelser.bosted,
  ];

  return (
    <Fragment>
      {art12_1_begrunnelser.length > 0 && (
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for artikkel 12 nr. 1."
          valgteBegrunnelser={[...art12_1_begrunnelser, ...vilkarBegrunnelser]}
          muligeBegrunnelser={[...MKV.KTObjects.begrunnelser.art12_1_begrunnelser, ...muligeVirksomhetBegrunnelser]}
        />
      )}
      {art12_2_begrunnelser.length > 0 && (
        <Begrunnelser
          label="Søkeren fyller ikke kriteriene for artikkel 12 nr. 2."
          valgteBegrunnelser={[...art12_2_begrunnelser, ...vilkarBegrunnelser]}
          muligeBegrunnelser={[...MKV.KTObjects.begrunnelser.art12_2_begrunnelser, ...muligeVirksomhetBegrunnelser]}
        />
      )}
      <Begrunnelser
        label="Søkeren fyller ikke kriteriene for artikkel 16 nr. 1."
        fritekst="Utenlandske trygdemyndigheter har avslått anmodningen om unntak"
      />
    </Fragment>
  );
};

VurderingArtikkel16VedtakBegrunnelser.propTypes = {
  art12_1_begrunnelser: PT.arrayOf(PT.string).isRequired,
  art12_2_begrunnelser: PT.arrayOf(PT.string).isRequired,
  vilkarBegrunnelser: PT.arrayOf(PT.string).isRequired,
};

export const Innvilgelse = ({
  redigerbart,
  behandlingID,
  gjeldendePeriode,
  renderFritekstFelt,
  vedtaksbrevFritekst,
  visOrienteringsbrevArbeidsgiver,
  onPeriodeForkorterUncheck,
  formValues,
  vedKlikkForhandsvis,
  stegErGyldig,
}) => {
  const pdfDokumenter = [
    {
      navn: "Forhåndsvis vedtaksbrev og A1",
      data: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
        mottaker: MKV.Koder.mottakerroller.BRUKER,
        fritekst: vedtaksbrevFritekst,
      },
    },
  ];

  if (visOrienteringsbrevArbeidsgiver) {
    pdfDokumenter.push({
      navn: "Brev til arbeidsgiver",
      data: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_ARBEIDSGIVER,
        mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
      },
    });
  }

  return (
    <Fragment>
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        Omfattet av norsk trygdelovgivning etter Fo 883/2004 Artikkel 16 nr. 1.
      </Nav.Typo.Innholdstittel>
      <Nav.Row>
        <Nav.Column xs="7">
          <DatoOmrade periode={gjeldendePeriode} label="Lovvalgsperiode" />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          <Skjema.PeriodeForkorter
            redigerbart={redigerbart}
            fomRedigerbar
            checkboxClassName="forkortLovvalgsperiode"
            checkboxLabel="Lovvalget innvilges for en kortere periode"
            checkboxFeltnavn="forkortLovvalgsperiode"
            onUncheck={onPeriodeForkorterUncheck}
            forkortPeriode={formValues.forkortLovvalgsperiode}
            fomLabel="Startdato"
            fomFeltNavn="fomDato"
            fom={Utils.dato.norskStringTilDate(formValues.fomDato)}
            tomLabel="Sluttdato"
            tomFeltNavn="tomDato"
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">{renderFritekstFelt()}</Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          {stegErGyldig && (
            <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} vedKlikk={vedKlikkForhandsvis} />
          )}
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

Innvilgelse.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  gjeldendePeriode: MPT.Periode.isRequired,
  vedtaksbrevFritekst: PT.string,
  renderFritekstFelt: PT.func.isRequired,
  visOrienteringsbrevArbeidsgiver: PT.bool.isRequired,
  onPeriodeForkorterUncheck: PT.func.isRequired,
  formValues: PT.object.isRequired,
  vedKlikkForhandsvis: PT.func.isRequired,
  stegErGyldig: PT.bool.isRequired,
};

Innvilgelse.defaultProps = {
  vedtaksbrevFritekst: undefined,
};

export const DelvisInnvilgelse = ({
  redigerbart,
  behandlingID,
  gjeldendePeriode,
  vedtaksbrevFritekst,
  renderFritekstFelt,
  renderBegrunnelser,
  visOrienteringsbrevArbeidsgiver,
  onPeriodeForkorterUncheck,
  formValues,
  vedKlikkForhandsvis,
  stegErGyldig,
}) => {
  const pdfDokumenter = [
    {
      navn: "Forhåndsvis vedtaksbrev og A1",
      data: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_YRKESAKTIV,
        mottaker: MKV.Koder.mottakerroller.BRUKER,
        fritekst: vedtaksbrevFritekst,
      },
    },
  ];

  if (visOrienteringsbrevArbeidsgiver) {
    pdfDokumenter.push({
      navn: "Brev til arbeidsgiver",
      data: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.INNVILGELSE_ARBEIDSGIVER,
        mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
      },
    });
  }

  return (
    <Fragment>
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        Delvis innvilgelse - omfattet av norsk trygdelovgivning etter Fo 883/2004 Artikkel 16 nr. 1. i deler av
        søknadsperioden
      </Nav.Typo.Innholdstittel>
      <Nav.Row>
        <Nav.Column xs="7">
          <DatoOmrade periode={gjeldendePeriode} label="Lovvalgsperiode" />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          <Skjema.PeriodeForkorter
            redigerbart={redigerbart}
            fomRedigerbar
            checkboxClassName="forkortLovvalgsperiode"
            checkboxLabel="Lovvalget innvilges for en kortere periode"
            checkboxFeltnavn="forkortLovvalgsperiode"
            onUncheck={onPeriodeForkorterUncheck}
            forkortPeriode={formValues.forkortLovvalgsperiode}
            fomLabel="Startdato"
            fomFeltNavn="fomDato"
            fom={Utils.dato.norskStringTilDate(formValues.fomDato)}
            tomLabel="Sluttdato"
            tomFeltNavn="tomDato"
          />
        </Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">{renderBegrunnelser()}</Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">{renderFritekstFelt()}</Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          {stegErGyldig && (
            <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} vedKlikk={vedKlikkForhandsvis} />
          )}
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

DelvisInnvilgelse.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  gjeldendePeriode: MPT.Periode.isRequired,
  vedtaksbrevFritekst: PT.string,
  renderFritekstFelt: PT.func.isRequired,
  renderBegrunnelser: PT.func.isRequired,
  visOrienteringsbrevArbeidsgiver: PT.bool.isRequired,
  onPeriodeForkorterUncheck: PT.func.isRequired,
  formValues: PT.object.isRequired,
  vedKlikkForhandsvis: PT.func.isRequired,
  stegErGyldig: PT.bool.isRequired,
};

DelvisInnvilgelse.defaultProps = {
  vedtaksbrevFritekst: undefined,
};

export const Avslag = ({
  redigerbart,
  behandlingID,
  vedtaksbrevFritekst,
  renderFritekstFelt,
  renderBegrunnelser,
  visOrienteringsbrevArbeidsgiver,
}) => {
  const pdfDokumenter = [
    {
      navn: "Forhåndsvis vedtaksbrev",
      data: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.AVSLAG_YRKESAKTIV,
        mottaker: MKV.Koder.mottakerroller.BRUKER,
        fritekst: vedtaksbrevFritekst,
      },
    },
  ];

  if (visOrienteringsbrevArbeidsgiver) {
    pdfDokumenter.push({
      navn: "Brev til arbeidsgiver",
      data: {
        produserbardokument: MKV.Koder.brev.produserbaredokumenter.AVSLAG_ARBEIDSGIVER,
        mottaker: MKV.Koder.mottakerroller.ARBEIDSGIVER,
      },
    });
  }

  return (
    <Fragment>
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Avslag</Nav.Typo.Innholdstittel>
      <Nav.Row>
        <Nav.Column xs="7">{renderBegrunnelser()}</Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">{renderFritekstFelt()}</Nav.Column>
      </Nav.Row>
      <Nav.Row>
        <Nav.Column xs="7">
          {redigerbart && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
        </Nav.Column>
      </Nav.Row>
    </Fragment>
  );
};

Avslag.propTypes = {
  redigerbart: PT.bool.isRequired,
  behandlingID: PT.number.isRequired,
  vedtaksbrevFritekst: PT.string,
  renderFritekstFelt: PT.func.isRequired,
  renderBegrunnelser: PT.func.isRequired,
  visOrienteringsbrevArbeidsgiver: PT.bool.isRequired,
};

Avslag.defaultProps = {
  vedtaksbrevFritekst: undefined,
};

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
  validerMottatteOpplysninger,
  fattVedtak,
  mottatteOpplysningerStatus,
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
      if (redigerbart && mottatteOpplysningerStatus === "OK" && aktivtSteg && formIsValid) {
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
  }, [aktivtSteg, formIsValid, mottatteOpplysningerStatus]);

  const vedKlikk = async () => {
    if (!validerForm()) return;

    if (formValues.forkortLovvalgsperiode) {
      await forkortLovvalgsperiode();
    }

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
  validerMottatteOpplysninger: PT.func.isRequired,
  fattVedtak: PT.func.isRequired,
  mottatteOpplysningerStatus: PT.string.isRequired,
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
      mottatteOpplysningerStatus: mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector(state),
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
