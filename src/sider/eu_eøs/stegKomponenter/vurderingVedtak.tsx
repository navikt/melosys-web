import { useCallback, useEffect, useState } from "react";
import { connect, ConnectedProps, useDispatch, useSelector } from "react-redux";
import { getFormValues, InjectedFormProps, isValid, reduxForm } from "redux-form";
// @ts-ignore
import * as EKV from "eessi-kodeverk";
import MKV, { MKVUtils } from "../../../melosyskodeverk";
import * as KV from "../../../kodeverk";
import * as Nav from "../../../navFrontend";
import * as Skjema from "../../../felleskomponenter/skjema";
import * as Mui from "../../../felleskomponenter/ui";
import * as Utils from "../../../utils";
import { avklartefaktaSelectors } from "../../../ducks/avklartefakta";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { vedtakOperations } from "../../../ducks/vedtak";
import { fagsakSelectors } from "../../../ducks/fagsaker";
import { flytSelectors } from "../../../ducks/flyt";
import { skalViseIngenFlyt } from "../../../url";
import Dokumentliste, {
  BrevDokumentMetadataType,
  SedDokumentMetadataType,
} from "../../../felleskomponenter/dokumentliste";
import DatoOmrade from "../../../felleskomponenter/datoOmrade";
import Mottakerinstitusjonvelger from "../../../felleskomponenter/mottakerinstitusjonvelger";
import { lagYupToReduxformErrorMapper } from "../../../yup";
import VurderingArtikkel12VedtakSchema from "./vurderingArtikkel12VedtakSchema";
import "./vurderingVedtak.css";
import { mottatteOpplysningerSelectors } from "../../../ducks/mottatteOpplysninger";
import * as Api from "../../../services/api";
import { RootState } from "AppTypes";
import { KTObject } from "@navikt/melosys-kodeverk";
import { kontrollOperations } from "../../../ducks/kontroll";
import { lovvalgsperioderSelectors } from "../../../ducks/lovvalgsperioder";
import { useFeatureToggle } from "../../../featuretoggle";
import { MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA } from "../../../featuretoggle/toggleNavn";

const { FO_883_2004_ART11_3A } = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004;
const { FO_883_2004_ART11_4_1 } = MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004;
const { EU_EOS } = MKV.Koder.sakstyper;
const { FØRSTEGANGSVEDTAK } = MKV.Koder.vedtakstyper;
const { FASTSATT_LOVVALGSLAND } = MKV.Koder.behandlinger.behandlingsresultattyper;
const {
  UTSENDT_ARBEIDSTAKER,
  UTSENDT_SELVSTENDIG,
  ARBEID_FLERE_LAND,
  ARBEID_TJENESTEPERSON_ELLER_FLY,
  BESLUTNING_LOVVALG_NORGE,
} = MKV.Koder.behandlinger.behandlingstema;
const { LA_BUC_04, LA_BUC_05 } = EKV.Koder.buctyper.legislation;

const finnLovvalgSomTerm = (lovvalgsbestemmelse?: string, tilleggBestemmelse?: string) => {
  const lovvalgsbestemmelseKT = KV.finnEnkeltKodeFraListe(lovvalgsbestemmelse, MKV.Kodekombinasjoner.alleLovvalg);

  if (lovvalgsbestemmelse === FO_883_2004_ART11_3A && tilleggBestemmelse === FO_883_2004_ART11_4_1) {
    const tilleggBestemmelseKT = KV.finnEnkeltKodeFraListe(tilleggBestemmelse, MKV.Kodekombinasjoner.alleLovvalg);
    return `${KV.objektTilTerm(tilleggBestemmelseKT)} og ${KV.objektTilTerm(lovvalgsbestemmelseKT)}`;
  }

  return KV.objektTilTerm(lovvalgsbestemmelseKT);
};

const finnSedMottakerLand = (
  arbeidsland: KTObject[],
  bostedsland: KTObject,
  lovvalgsbestemmelse: string,
  tilleggBestemmelse: string
) => {
  if (lovvalgsbestemmelse === FO_883_2004_ART11_3A && tilleggBestemmelse === FO_883_2004_ART11_4_1) {
    return bostedsland.kode;
  }
  return arbeidsland[0]?.kode;
};

const skalViseSendOrienteringsbrev = (sakstype: string, behandlingstema: string) =>
  sakstype === EU_EOS && [UTSENDT_ARBEIDSTAKER, ARBEID_TJENESTEPERSON_ELLER_FLY].includes(behandlingstema);

const skalViseMottakerinstitusjoner = (
  sakstype: string,
  sakstema: string,
  behandlingstema: string,
  behandlingstype: string
) => {
  return (
    sakstype === EU_EOS &&
    [UTSENDT_ARBEIDSTAKER, UTSENDT_SELVSTENDIG, ARBEID_FLERE_LAND, ARBEID_TJENESTEPERSON_ELLER_FLY].includes(
      behandlingstema
    ) &&
    !skalViseIngenFlyt(sakstype, sakstema, behandlingstema, behandlingstype)
  );
};

interface FormValuesProps {
  vedtakstype?: string;
  vedtakstypebegrunnelse: string;
  vedtaksbrevFritekst: string;
  kopiTilArbeidsgiver: boolean;
  mottakerinstitusjon: string;
  kreverMottakerinstitusjon: boolean;
  fritekstSed: string | null | undefined;
}

const mapStateToProps = (state: RootState) => ({
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  formValues: getFormValues(KV.Form.ARTIKKEL_12_VEDTAK)(state) as FormValuesProps,
  initialValues: {
    vedtakstypebegrunnelse: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
    vedtaksbrevFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
    kopiTilArbeidsgiver: true,
    mottakerinstitusjon: "",
    kreverMottakerinstitusjon: false,
    fritekstSed: null,
  },
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type VurderingVedtakProps = PropsFromRedux & {
  tilbake: () => void;
  redigerbart: boolean;
  visAntallManederUtland?: boolean;
  pdfDokumenter: (BrevDokumentMetadataType | SedDokumentMetadataType)[];
  harFeilmeldinger: boolean;
  aktivtSteg?: boolean;
  validerMottatteOpplysninger: () => Promise<void>;
};

const VurderingVedtak = ({
  redigerbart,
  tilbake,
  behandlingstype,
  touch,
  form,
  formValues,
  visAntallManederUtland = true,
  pdfDokumenter,
  harFeilmeldinger,
  aktivtSteg = false,
  validerMottatteOpplysninger,
}: VurderingVedtakProps & InjectedFormProps<FormValuesProps, VurderingVedtakProps>) => {
  const dispatch = useDispatch();
  const [vedtakPending, setVedtakPending] = useState(false);
  const [erBucAapen, setErBucAapen] = useState(true);
  const konvensjonStorbritanniaToggleEnabled = useFeatureToggle(MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA);
  let oppdaterFørKontroll = true;

  const lovvalgsperioder = useSelector(lovvalgsperioderSelectors.LovvalgsperioderSelector);
  const arbeidsland = useSelector(avklartefaktaSelectors.ArbeidslandKTSelector);
  const bostedsland = useSelector(avklartefaktaSelectors.BostedslandSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const sakstema = useSelector(fagsakSelectors.SakstemaKodeSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const formIsValid = useSelector(isValid(KV.Form.ARTIKKEL_12_VEDTAK));
  const erArtikkel11_4 = useSelector(flytSelectors.ErIArtikkel11_4Selector);
  const mottatteOpplysningerStatus = useSelector(mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector);

  const visMottakerinstitusjoner = skalViseMottakerinstitusjoner(sakstype, sakstema, behandlingstema, behandlingstype);

  useEffect(() => {
    if (behandlingstema === BESLUTNING_LOVVALG_NORGE) {
      Api.Kontroll.erBucAapen(behandlingID).then((res) => {
        setErBucAapen(res);
      });
    }
  }, []);

  async function kontroller(data: {
    aktivtSteg: boolean;
    formValues: FormValuesProps;
    mottatteOpplysningerStatus: string;
  }) {
    if (redigerbart && data.mottatteOpplysningerStatus === "OK" && data.aktivtSteg) {
      setVedtakPending(true);
      const request = {
        behandlingID,
        vedtakstype: data.formValues.vedtakstype || FØRSTEGANGSVEDTAK,
        behandlingsresultattype: FASTSATT_LOVVALGSLAND,
        kontrollerSomSkalIgnoreres: data.formValues.kopiTilArbeidsgiver
          ? []
          : [MKV.Koder.begrunnelser.kontroll_begrunnelser.OPPHØRT_ARBEIDSGIVER],
        skalRegisteropplysningerOppdateres: oppdaterFørKontroll,
      };
      oppdaterFørKontroll = false;
      await dispatch(kontrollOperations.kontrollerFerdigbehandling(request));
      setVedtakPending(false);
    }
  }

  const debouncedKontrollerBehandling = useCallback(Utils._debounce(kontroller, 500), []);

  useEffect(() => {
    debouncedKontrollerBehandling({ aktivtSteg, formValues, mottatteOpplysningerStatus });
  }, [redigerbart, formIsValid, aktivtSteg, formValues?.kopiTilArbeidsgiver, mottatteOpplysningerStatus]);

  const validerForm = () => {
    touch("tomDato");
    touch("vedtakstype");
    touch("vedtakstypebegrunnelse");
    touch("mottakerinstitusjon");
    touch("fritekstSed");
    return formIsValid;
  };

  const onSubmit = async () => {
    if (!validerForm()) return;

    setVedtakPending(true);

    validerMottatteOpplysninger()
      .then(() => {
        const vedtakRequest = {
          behandlingsresultatTypeKode: FASTSATT_LOVVALGSLAND,
          vedtakstype: formValues.vedtakstype || FØRSTEGANGSVEDTAK,
          fritekst: formValues.vedtaksbrevFritekst,
          fritekstSed: formValues.fritekstSed,
          kopiTilArbeidsgiver: formValues.kopiTilArbeidsgiver,
          mottakerinstitusjoner: visMottakerinstitusjoner ? [formValues.mottakerinstitusjon] : [],
          nyVurderingBakgrunn: formValues.vedtakstypebegrunnelse,
        };
        // @ts-ignore
        dispatch(vedtakOperations.fatt(behandlingID, vedtakRequest)).then((res) => {
          if (res.data?.data?.error) {
            setVedtakPending(false);
          }
        });
      })
      .catch(() => setVedtakPending(false));
  };

  const { fomDato, tomDato, lovvalgsbestemmelse, tilleggBestemmelse } = lovvalgsperioder[0] || {};

  const sedMottakerLand = finnSedMottakerLand(arbeidsland, bostedsland || {}, lovvalgsbestemmelse, tilleggBestemmelse);
  const flereSoknadslandEnnTillatt = arbeidsland.length > 1 && !MKVUtils.kanHaFlereSoknadsland(behandlingstema);
  const stegErGyldig = redigerbart && formIsValid && !harFeilmeldinger && !flereSoknadslandEnnTillatt;
  const bucLukketOgLovvalgNorge = !erBucAapen && behandlingstema === BESLUTNING_LOVVALG_NORGE;
  const bucType = erArtikkel11_4 ? LA_BUC_05 : LA_BUC_04;
  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

  return (
    <div className="vedtak">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        {konvensjonStorbritanniaToggleEnabled
          ? "Omfattet av norsk trygdelovgivning"
          : `Omfattet av norsk trygdelovgivning etter ${finnLovvalgSomTerm(lovvalgsbestemmelse, tilleggBestemmelse)}`}
      </Nav.Typo.Innholdstittel>
      <div>
        <Nav.Row className="lovvalgsperiode">
          <Nav.Column xs="6">
            <DatoOmrade periode={{ fom: fomDato, tom: tomDato }} label="Lovvalgsperiode" />
          </Nav.Column>
        </Nav.Row>
        {visAntallManederUtland && (
          <Nav.Row className="vedtak__oppsummering">
            <Nav.Column xs="6">
              <Nav.Typo.Element>Antall måneder i utlandet</Nav.Typo.Element>
              <Nav.Typo.Normaltekst>{Utils.dato.datoDiffMenneskelig(fomDato, tomDato)}</Nav.Typo.Normaltekst>
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
                    ? pdfDokumenter.filter((dok) => "sedType" in dok && dok.sedType !== EKV.Koder.sedtyper.A012)
                    : pdfDokumenter
                }
              />
            )}
          </Nav.Column>
        </Nav.Row>
        {flereSoknadslandEnnTillatt && (
          <Nav.Alert variant="error">Det er kun tillatt med ett arbeidsland i vedtaket.</Nav.Alert>
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

const VurderingVedtakForm = reduxForm<FormValuesProps, VurderingVedtakProps>({
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

export default connector(VurderingVedtakForm);
