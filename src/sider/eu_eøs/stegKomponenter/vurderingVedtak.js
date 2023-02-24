import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { getFormValues, isValid, reduxForm } from "redux-form";
import PT from "prop-types";
import * as EKV from "eessi-kodeverk";

import MKV, { MKVUtils } from "../../../melosyskodeverk";

import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Mui from "../../../felleskomponenter/ui";
import * as Utils from "../../../utils";
import * as MPT from "../../../proptypes";

import { avklartefaktaSelectors } from "../../../ducks/avklartefakta";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { lovvalgsperioderSelectors } from "../../../ducks/lovvalgsperioder";
import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { vedtakOperations } from "../../../ducks/vedtak";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { flytSelectors } from "../../../ducks/flyt";

import { skalViseTomFlyt } from "../../../routing";
import { useFeatureToggle } from "../../../featuretoggle";
import PdfLenkeListe from "../../../felleskomponenter/pdfLenkeListe";
import DatoOmrade from "../../../felleskomponenter/datoOmrade";
import Mottakerinstitusjonvelger from "../../../felleskomponenter/mottakerinstitusjonvelger";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import VurderingArtikkel12VedtakSchema from "./vurderingArtikkel12VedtakSchema";
import "./vurderingVedtak.css";

const finnLovvalgSomTerm = (lovvalgsbestemmelse = {}, tilleggsbestemmelse = {}) => {
  if (
    lovvalgsbestemmelse.kode === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A &&
    tilleggsbestemmelse.kode === MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_4_1
  ) {
    return `${KV.objektTilTerm(tilleggsbestemmelse)} og ${KV.objektTilTerm(lovvalgsbestemmelse)}`;
  }

  return KV.objektTilTerm(lovvalgsbestemmelse);
};

const finnSedMottakerLand = (arbeidsland, bostedsland, lovvalgsperiode) => {
  const bostedslandKode = bostedsland.kode;

  if (
    lovvalgsperiode.lovvalgsbestemmelse ===
      MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART11_3A &&
    lovvalgsperiode.tilleggBestemmelse ===
      MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004.FO_883_2004_ART11_4_1
  ) {
    return bostedslandKode;
  }

  return arbeidsland[0]?.kode;
};

const skalViseMottakerinstitusjoner = (
  sakstype,
  sakstema,
  behandlingstema,
  behandlingstype,
  folketrygdenToggleEnabled,
  ikkeYrkesaktivFlytToggleEnabled
) => {
  return (
    sakstype === MKV.Koder.sakstyper.EU_EOS &&
    [
      MKV.Koder.behandlinger.behandlingstema.UTSENDT_ARBEIDSTAKER,
      MKV.Koder.behandlinger.behandlingstema.UTSENDT_SELVSTENDIG,
      MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND,
      MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY,
    ].includes(behandlingstema) &&
    !skalViseTomFlyt(
      sakstype,
      sakstema,
      behandlingstema,
      behandlingstype,
      folketrygdenToggleEnabled,
      ikkeYrkesaktivFlytToggleEnabled
    )
  );
};

const VurderingVedtak = ({
  lovvalgsperioder,
  arbeidsland,
  bostedsland,
  redigerbart,
  behandlingID,
  tilbake,
  sakstype,
  sakstema,
  behandlingstema,
  behandlingstype,
  touch,
  formIsValid,
  formValues,
  form,
  visAntallManederUtland,
  pdfDokumenter,
  erArtikkel11_4,
  kontrollerFerdigbehandling,
  harFeilmeldinger,
  aktivtSteg,
  validerMottatteOpplysninger,
}) => {
  const [vedtakPending, setVedtakPending] = useState(false);
  const [oppdaterFoerKontroll, setOppdaterFoerKontroll] = useState(true);
  const folketrygdenToggleEnabled = useFeatureToggle("melosys.folketrygden.mvp") === "enabled";
  const ikkeYrkesaktivFlytToggleEnabled = useFeatureToggle("melosys.ikkeYrkesaktivForenkletFlyt") === "enabled";
  const dispatch = useDispatch();

  const lovvalget = lovvalgsperioder[0] || {};

  const { fomDato, tomDato, lovvalgsbestemmelse, tilleggBestemmelse } = lovvalget;

  const antallManederMenneskelig = Utils.dato.datoDiffMenneskelig(fomDato, tomDato);
  const lovvalgSomKodeTerm = KV.finnEnkeltKodeFraListe(lovvalgsbestemmelse, MKV.Kodekombinasjoner.alleLovvalg);
  const tilleggBestemmelseSomKodeTerm = KV.finnEnkeltKodeFraListe(
    tilleggBestemmelse,
    MKV.Kodekombinasjoner.alleLovvalg
  );
  const lovvalgSomTerm = finnLovvalgSomTerm(lovvalgSomKodeTerm, tilleggBestemmelseSomKodeTerm);
  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
  const visMottakerinstitusjoner = skalViseMottakerinstitusjoner(
    sakstype,
    sakstema,
    behandlingstema,
    behandlingstype,
    folketrygdenToggleEnabled,
    ikkeYrkesaktivFlytToggleEnabled
  );
  const bucType = erArtikkel11_4 ? EKV.Koder.buctyper.legislation.LA_BUC_05 : EKV.Koder.buctyper.legislation.LA_BUC_04;

  const validerForm = () => {
    touch("tomDato");
    touch("vedtakstype");
    touch("vedtakstypebegrunnelse");
    touch("mottakerinstitusjon");
    touch("fritekstSed");
    return formIsValid;
  };

  const lagFattVedtakEOSReqDto = () => {
    return {
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
      vedtakstype: formValues.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      fritekst: formValues.vedtaksbrevFritekst,
      fritekstSed: formValues.fritekstSed,
      kopiTilArbeidsgiver: formValues.kopiTilArbeidsgiver,
      mottakerinstitusjoner: visMottakerinstitusjoner ? [formValues.mottakerinstitusjon] : [],
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
          kontrollerSomSkalIgnoreres: formValues.kopiTilArbeidsgiver ? [] : ["OPPHØRT_ARBEIDSGIVER"],
          skalRegisteropplysningerOppdateres: oppdaterFoerKontroll,
        });
        setOppdaterFoerKontroll(false);
        setVedtakPending(false);
      }
    }

    kontroller();
  }, [aktivtSteg, formIsValid, formValues?.kopiTilArbeidsgiver]);

  const onSubmit = async () => {
    if (!validerForm()) return;

    setVedtakPending(true);

    validerMottatteOpplysninger()
      .then(() => {
        dispatch(vedtakOperations.fatt(behandlingID, lagFattVedtakEOSReqDto())).then((res) => {
          if (res.data?.data?.error) {
            setVedtakPending(false);
          }
        });
      })
      .catch(() => setVedtakPending(false));
  };

  const sedMottakerLand = finnSedMottakerLand(arbeidsland, bostedsland || {}, lovvalget);
  const flereSoknadslandEnnTillatt = arbeidsland.length > 1 && !MKVUtils.kanHaFlereSoknadsland(behandlingstema);

  const stegErGyldig = redigerbart && formIsValid && !harFeilmeldinger && !flereSoknadslandEnnTillatt;

  return (
    <div className="vedtak">
      <Nav.Typo.Undertittel>Omfattet av norsk trygdelovgivning etter {lovvalgSomTerm}</Nav.Typo.Undertittel>
      <div>
        <Nav.Row className="lovvalgsperiode">
          <Nav.Column xs="6">
            <DatoOmrade periode={{ fom: lovvalget.fomDato, tom: lovvalget.tomDato }} label="Lovvalgsperiode" />
          </Nav.Column>
        </Nav.Row>
        {visAntallManederUtland && (
          <Nav.Row className="vedtak__oppsummering">
            <Nav.Column xs="6">
              <Nav.Typo.Element type="element">Antall måneder i utlandet</Nav.Typo.Element>
              <Nav.Typo.Normaltekst>{antallManederMenneskelig}</Nav.Typo.Normaltekst>
            </Nav.Column>
          </Nav.Row>
        )}
        {erNyVurdering && <Skjema.Vedtakstype redigerbart={redigerbart} />}
        <Nav.Row className="fritekst">
          <Nav.Column xs="7">
            <Skjema.Textarea
              feltNavn="vedtaksbrevFritekst"
              label="Fritekst til vedtaksbrev"
              placeholder="Skriv inn tekst til vedtaksbrevet..."
              disabled={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
        {redigerbart && (
          <Nav.Row className="fritekstSed">
            <Nav.Column xs="7">
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
        {redigerbart && (
          <Skjema.Checkbox feltNavn="kopiTilArbeidsgiver" label="Send kopi til arbeidsgiver/virksomhet" />
        )}
        {visMottakerinstitusjoner && sedMottakerLand && (
          <Nav.Row className="mottakerinstitusjoner">
            <Nav.Column xs="7">
              <Mottakerinstitusjonvelger
                form={form}
                redigerbart={redigerbart}
                landkode={sedMottakerLand}
                bucType={bucType}
              />
            </Nav.Column>
          </Nav.Row>
        )}
        <Nav.Row>
          <Nav.Column xs="6">
            {stegErGyldig && <PdfLenkeListe behandlingID={behandlingID} dokumenter={pdfDokumenter} />}
          </Nav.Column>
        </Nav.Row>
        {flereSoknadslandEnnTillatt && (
          <Nav.AlertStripe type="feil">Det er kun tillat med ett arbeidsland i vedtaket.</Nav.AlertStripe>
        )}
        {erNyVurdering && redigerbart && (
          <Nav.AlertStripeInfo>{KV.Koder.AlertstripeTekst.NY_VURDERING_MEDL_TEKST}</Nav.AlertStripeInfo>
        )}
        <Nav.Row>
          <Nav.Column xs="6" className="fane__fot">
            <Mui.StegKnapper
              bekreftKnappProps={{
                spinner: vedtakPending,
                autoDisableVedSpinner: true,
                disabled: !stegErGyldig,
                onClick: onSubmit,
              }}
              bekreftTekst="Fatt vedtak"
              tilbakeKnappProps={{
                onClick: tilbake,
                disabled: !redigerbart,
              }}
            />
          </Nav.Column>
        </Nav.Row>
      </div>
    </div>
  );
};

VurderingVedtak.propTypes = {
  tilbake: PT.func.isRequired,
  lovvalgsperioder: PT.array.isRequired,
  arbeidsland: PT.arrayOf(MPT.Kodeverk).isRequired,
  bostedsland: MPT.Kodeverk,
  behandlingID: PT.number.isRequired,
  redigerbart: PT.bool.isRequired,
  lovvalgsland: PT.string,
  sakstype: PT.string.isRequired,
  sakstema: PT.string.isRequired,
  behandlingstema: PT.string.isRequired,
  behandlingstype: PT.string.isRequired,
  formIsValid: PT.bool.isRequired,
  formValues: PT.object,
  touch: PT.func.isRequired,
  form: PT.string.isRequired,
  visAntallManederUtland: PT.bool,
  pdfDokumenter: MPT.DokumentMetadataListe.isRequired,
  erArtikkel11_4: PT.bool.isRequired,
  kontrollerFerdigbehandling: PT.func.isRequired,
  harFeilmeldinger: PT.bool.isRequired,
  aktivtSteg: PT.bool,
  validerMottatteOpplysninger: PT.func.isRequired,
};

VurderingVedtak.defaultProps = {
  lovvalgsland: "",
  formValues: {},
  visAntallManederUtland: true,
  bostedsland: {},
  aktivtSteg: false,
};

const mapStateToProps = (state) => ({
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  arbeidsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  bostedsland: avklartefaktaSelectors.BostedslandSelector(state),
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  sakstype: fagsakSelectors.SakstypeKodeSelector(state),
  sakstema: fagsakSelectors.SakstemaKodeSelector(state),
  behandlingstema: behandlingerSelectors.BehandlingstemaKodeSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  lovvalgsland: lovvalgsperioderSelectors.LovvalgslandSelector(state),
  formIsValid: isValid(KV.Form.ARTIKKEL_12_VEDTAK)(state),
  formValues: getFormValues(KV.Form.ARTIKKEL_12_VEDTAK)(state),
  erArtikkel11_4: flytSelectors.ErIArtikkel11_4Selector(state),
  initialValues: {
    vedtakstypebegrunnelse: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
    vedtaksbrevFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
    kopiTilArbeidsgiver: true,
    mottakerinstitusjon: "",
    kreverMottakerinstitusjon: false,
    fritekstSed: null,
  },
});

const VurderingVedtakForm = reduxForm({
  form: KV.Form.ARTIKKEL_12_VEDTAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) =>
    lagYupToReduxformErrorMapper(VurderingArtikkel12VedtakSchema, {
      context: {
        behandlingstype: props.behandlingstype,
      },
    })(values),
})(VurderingVedtak);

export default connect(mapStateToProps)(VurderingVedtakForm);
