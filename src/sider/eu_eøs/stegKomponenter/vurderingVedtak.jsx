import { useCallback, useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
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

import { skalViseIngenFlyt } from "../../../url";
import Dokumentliste from "../../../felleskomponenter/dokumentliste";
import DatoOmrade from "../../../felleskomponenter/datoOmrade";
import Mottakerinstitusjonvelger from "../../../felleskomponenter/mottakerinstitusjonvelger";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import VurderingArtikkel12VedtakSchema from "./vurderingArtikkel12VedtakSchema";
import "./vurderingVedtak.css";
import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import * as Api from "../../../services/api";

const { FO_883_2004_ART11_3A } = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004;
const { FO_883_2004_ART11_4_1 } = MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004;
const { EU_EOS } = MKV.Koder.sakstyper;
const { FØRSTEGANGSVEDTAK } = MKV.Koder.vedtakstyper;
const {
  UTSENDT_ARBEIDSTAKER,
  UTSENDT_SELVSTENDIG,
  ARBEID_FLERE_LAND,
  ARBEID_TJENESTEPERSON_ELLER_FLY,
  BESLUTNING_LOVVALG_NORGE,
} = MKV.Koder.behandlinger.behandlingstema;

const finnLovvalgSomTerm = (lovvalgsbestemmelse = {}, tilleggsbestemmelse = {}) => {
  if (lovvalgsbestemmelse.kode === FO_883_2004_ART11_3A && tilleggsbestemmelse.kode === FO_883_2004_ART11_4_1) {
    return `${KV.objektTilTerm(tilleggsbestemmelse)} og ${KV.objektTilTerm(lovvalgsbestemmelse)}`;
  }
  return KV.objektTilTerm(lovvalgsbestemmelse);
};

const finnSedMottakerLand = (arbeidsland, bostedsland, lovvalgsperiode) => {
  const bostedslandKode = bostedsland.kode;

  if (
    lovvalgsperiode.lovvalgsbestemmelse === FO_883_2004_ART11_3A &&
    lovvalgsperiode.tilleggBestemmelse === FO_883_2004_ART11_4_1
  ) {
    return bostedslandKode;
  }

  return arbeidsland[0]?.kode;
};

const skalViseSendOrienteringsbrev = (sakstype, behandlingstema) =>
  sakstype === EU_EOS && [UTSENDT_ARBEIDSTAKER, ARBEID_TJENESTEPERSON_ELLER_FLY].includes(behandlingstema);

const skalViseMottakerinstitusjoner = (sakstype, sakstema, behandlingstema, behandlingstype) => {
  return (
    sakstype === EU_EOS &&
    [UTSENDT_ARBEIDSTAKER, UTSENDT_SELVSTENDIG, ARBEID_FLERE_LAND, ARBEID_TJENESTEPERSON_ELLER_FLY].includes(
      behandlingstema
    ) &&
    !skalViseIngenFlyt(sakstype, sakstema, behandlingstema, behandlingstype)
  );
};

const mapStateToProps = (state) => ({
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  initialValues: {
    vedtakstypebegrunnelse: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
    vedtaksbrevFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
    kopiTilArbeidsgiver: true,
    mottakerinstitusjon: "",
    kreverMottakerinstitusjon: false,
    fritekstSed: null,
  },
});

VurderingVedtak.propTypes = {
  tilbake: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  touch: PT.func.isRequired,
  form: PT.string.isRequired,
  visAntallManederUtland: PT.bool,
  pdfDokumenter: MPT.DokumentMetadataListe.isRequired,
  kontrollerFerdigbehandling: PT.func.isRequired,
  harFeilmeldinger: PT.bool.isRequired,
  aktivtSteg: PT.bool,
  validerMottatteOpplysninger: PT.func.isRequired,
};

VurderingVedtak.defaultProps = {
  visAntallManederUtland: true,
  aktivtSteg: false,
};

const VurderingVedtak = ({
  redigerbart,
  tilbake,
  behandlingstype,
  touch,
  form,
  visAntallManederUtland,
  pdfDokumenter,
  kontrollerFerdigbehandling,
  harFeilmeldinger,
  aktivtSteg,
  validerMottatteOpplysninger,
}) => {
  const dispatch = useDispatch();
  const [vedtakPending, setVedtakPending] = useState(false);
  const [erBucAapen, setErBucAapen] = useState(true);

  const lovvalgsperioder = useSelector(lovvalgsperioderSelectors.LovvalgsperioderSelector);
  const arbeidsland = useSelector(avklartefaktaSelectors.ArbeidslandKTSelector);
  const bostedsland = useSelector(avklartefaktaSelectors.BostedslandSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const sakstema = useSelector(fagsakSelectors.SakstemaKodeSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const formIsValid = useSelector(isValid(KV.Form.ARTIKKEL_12_VEDTAK));
  const formValues = useSelector(getFormValues(KV.Form.ARTIKKEL_12_VEDTAK));
  const erArtikkel11_4 = useSelector(flytSelectors.ErIArtikkel11_4Selector);
  const mottatteOpplysningerStatus = useSelector(mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector);
  let oppdaterFørKontroll = true;

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
  const visMottakerinstitusjoner = skalViseMottakerinstitusjoner(sakstype, sakstema, behandlingstema, behandlingstype);
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
      vedtakstype: formValues.vedtakstype || FØRSTEGANGSVEDTAK,
      fritekst: formValues.vedtaksbrevFritekst,
      fritekstSed: formValues.fritekstSed,
      kopiTilArbeidsgiver: formValues.kopiTilArbeidsgiver,
      mottakerinstitusjoner: visMottakerinstitusjoner ? [formValues.mottakerinstitusjon] : [],
      nyVurderingBakgrunn: formValues.vedtakstypebegrunnelse,
    };
  };

  useEffect(() => {
    if (behandlingstema === BESLUTNING_LOVVALG_NORGE) {
      Api.Kontroll.erBucAapen(behandlingID).then((res) => {
        setErBucAapen(res);
      });
    }
  }, []);

  async function kontroller(data) {
    if (redigerbart && data.mottatteOpplysningerStatus === "OK" && data.aktivtSteg) {
      setVedtakPending(true);
      const request = {
        behandlingID,
        vedtakstype: data.formValues.vedtakstype || FØRSTEGANGSVEDTAK,
        behandlingsresultattype: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
        kontrollerSomSkalIgnoreres: data.formValues.kopiTilArbeidsgiver
          ? []
          : [MKV.Koder.begrunnelser.kontroll_begrunnelser.OPPHØRT_ARBEIDSGIVER],
        skalRegisteropplysningerOppdateres: oppdaterFørKontroll,
      };
      oppdaterFørKontroll = false;
      await kontrollerFerdigbehandling(request);
      setVedtakPending(false);
    }
  }

  const debouncedKontrollerBehandling = useCallback(Utils._debounce(kontroller, 500), [kontrollerFerdigbehandling]);

  useEffect(() => {
    debouncedKontrollerBehandling({ aktivtSteg, formValues, mottatteOpplysningerStatus });
  }, [redigerbart, formIsValid, aktivtSteg, formValues?.kopiTilArbeidsgiver, mottatteOpplysningerStatus]);

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

  const bucLukketOgLovvalgNorge = !erBucAapen && behandlingstema === BESLUTNING_LOVVALG_NORGE;

  return (
    <div className="vedtak">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        Omfattet av norsk trygdelovgivning etter {lovvalgSomTerm}
      </Nav.Typo.Innholdstittel>
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
        {redigerbart && !bucLukketOgLovvalgNorge && (
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
        {redigerbart && skalViseSendOrienteringsbrev(sakstype, behandlingstema) && (
          <Skjema.Checkbox feltNavn="kopiTilArbeidsgiver" label="Send orienteringsbrev til arbeidsgiver/virksomhet" />
        )}
        <Nav.Row>
          <Nav.Column xs="7">
            {stegErGyldig && (
              <Dokumentliste
                behandlingID={behandlingID}
                dokumenter={
                  bucLukketOgLovvalgNorge
                    ? pdfDokumenter.filter((dok) => dok.sedType !== EKV.Koder.sedtyper.A012)
                    : pdfDokumenter
                }
              />
            )}
          </Nav.Column>
        </Nav.Row>
        {flereSoknadslandEnnTillatt && (
          <Nav.Alert variant="error">Det er kun tillat med ett arbeidsland i vedtaket.</Nav.Alert>
        )}
        {erNyVurdering && redigerbart && (
          <Nav.Alert variant="info">{KV.Koder.AlertstripeTekst.NY_VURDERING_MEDL_TEKST}</Nav.Alert>
        )}
        <Nav.Row>
          <Nav.Column xs="6" className="fane__fot">
            <Mui.StegKnapper
              bekreftKnappProps={{
                loading: vedtakPending,
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
