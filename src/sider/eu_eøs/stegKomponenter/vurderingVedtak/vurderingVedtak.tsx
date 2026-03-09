import { useCallback, useEffect, useState } from "react";
import { connect, ConnectedProps, useSelector } from "react-redux";
import { useDispatch } from "../../../../hooks";
import { getFormValues, InjectedFormProps, isValid, reduxForm } from "redux-form";
// @ts-expect-error generisk beskrivelse
import * as EKV from "eessi-kodeverk";
import MKV, { MKVUtils } from "../../../../melosyskodeverk";
import * as KV from "../../../../kodeverk";
import * as Nav from "../../../../navFrontend";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Utils from "../../../../utils";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { vedtakOperations } from "../../../../ducks/vedtak";
import { fagsakSelectors } from "../../../../ducks/fagsaker";
import { flytSelectors } from "../../../../ducks/flyt";
import { skalViseIngenFlyt } from "../../../../url";
import Dokumentliste, {
  BrevDokumentMetadataType,
  SedDokumentMetadataType,
} from "../../../../felleskomponenter/dokumentliste";
import Mottakerinstitusjonvelger from "../../../../felleskomponenter/mottakerinstitusjonvelger";
import { lagYupToReduxformErrorMapper } from "../../../../yup";
import VurderingVedtakSchema from "./vurderingVedtakSchema";
import "./vurderingVedtak.less";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import * as Api from "../../../../services/api";
import { RootState } from "AppTypes";
import { KTObject } from "@navikt/melosys-kodeverk";
import { kontrollOperations } from "../../../../ducks/kontroll";
import { lovvalgsperioderSelectors } from "../../../../ducks/lovvalgsperioder";
import EnkeltDato from "../../../../felleskomponenter/enkeltDato";
import { VurderingYrkesaktivitetTyper, VurderingYrkesgruppeTyper } from "../../../../kodeverk/koder";
import { useFeatureToggle } from "../../../../featuretoggle";
import { MELOSYS_PENSJONIST, MELOSYS_PENSJONIST_EØS } from "../../../../featuretoggle/toggleNavn";

const { FO_883_2004_ART11_3A } = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004;
const { FO_883_2004_ART11_4_1 } = MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_883_2004;
const { KONV_EFTA_STORBRITANNIA_ART13_3A } = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia;
const { KONV_EFTA_STORBRITANNIA_ART13_4_1 } =
  MKV.Koder.lovvalgsbestemmelser.tilleggsbestemmelser_konv_efta_storbritannia;
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

const finnSedMottakerLand = (
  arbeidsland: KTObject[],
  bostedsland: KTObject,
  lovvalgsbestemmelse: string,
  tilleggBestemmelse: string,
) => {
  if (lovvalgsbestemmelse === FO_883_2004_ART11_3A && tilleggBestemmelse === FO_883_2004_ART11_4_1) {
    return bostedsland.kode;
  }
  if (
    lovvalgsbestemmelse === KONV_EFTA_STORBRITANNIA_ART13_3A &&
    tilleggBestemmelse === KONV_EFTA_STORBRITANNIA_ART13_4_1
  ) {
    return bostedsland.kode;
  }
  return arbeidsland[0]?.kode;
};

const skalViseSendOrienteringsbrev = (
  sakstype: string,
  behandlingstema: string,
  erArtikkel11_4: boolean,
  erSelvstendigNaeringsdrivende: boolean,
) =>
  !erArtikkel11_4 &&
  sakstype === EU_EOS &&
  [UTSENDT_ARBEIDSTAKER, ARBEID_TJENESTEPERSON_ELLER_FLY].includes(behandlingstema) &&
  !erSelvstendigNaeringsdrivende;

const skalViseMottakerinstitusjoner = (
  sakstype: string,
  sakstema: string,
  behandlingstema: string,
  behandlingstype: string,
  erPensjonistToggleEnabled?: boolean,
  erPensjonistToggleEnabled_EØS?: boolean,
) => {
  return (
    sakstype === EU_EOS &&
    [UTSENDT_ARBEIDSTAKER, UTSENDT_SELVSTENDIG, ARBEID_FLERE_LAND, ARBEID_TJENESTEPERSON_ELLER_FLY].includes(
      behandlingstema,
    ) &&
    !skalViseIngenFlyt(
      sakstype,
      sakstema,
      behandlingstema,
      behandlingstype,
      erPensjonistToggleEnabled,
      erPensjonistToggleEnabled_EØS,
    )
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
  lovvalgsperiode: lovvalgsperioderSelectors.LovvalgsperiodeSelector(state),
  behandlingstype: behandlingerSelectors.BehandlingstypeKodeSelector(state),
  formValues: getFormValues(KV.Form.ARTIKKEL_12_VEDTAK)(state) as FormValuesProps,
  initialValues: {
    vedtakstypebegrunnelse: behandlingsresultatSelectors.BegrunnelseKoderSelector(state)[0],
    vedtaksbrevFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
    kopiTilArbeidsgiver: false,
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
  erArtikkel11_4: boolean;
  pdfDokumenter: (BrevDokumentMetadataType | SedDokumentMetadataType)[];
  harFeilmeldinger: boolean;
  aktivtSteg?: boolean;
  validerMottatteOpplysninger: () => Promise<void>;
};

function VurderingVedtak({
  redigerbart,
  tilbake,
  behandlingstype,
  touch,
  form,
  formValues,
  pdfDokumenter,
  harFeilmeldinger,
  aktivtSteg = false,
  validerMottatteOpplysninger,
  lovvalgsperiode,
  erArtikkel11_4,
}: VurderingVedtakProps & InjectedFormProps<FormValuesProps, VurderingVedtakProps>) {
  const dispatch = useDispatch();
  const [vedtakPending, setVedtakPending] = useState(false);
  const [erBucAapen, setErBucAapen] = useState(true);
  let oppdaterFørKontroll = true;

  const arbeidsland = useSelector(avklartefaktaSelectors.ArbeidslandKTSelector);
  const bostedsland = useSelector(avklartefaktaSelectors.BostedslandSelector);
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const erSelvstendigNaeringsdrivende =
    useSelector(avklartefaktaSelectors.YrkesaktivitetSelector) ===
    VurderingYrkesaktivitetTyper.SELVSTENDIG_NAERINGSDRIVENDE;
  const erSokkelSkip =
    useSelector(avklartefaktaSelectors.YrkesgruppeSelector) === VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP;
  const sakstype = useSelector(fagsakSelectors.SakstypeKodeSelector);
  const sakstema = useSelector(fagsakSelectors.SakstemaKodeSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const formIsValid = useSelector(isValid(KV.Form.ARTIKKEL_12_VEDTAK));
  const erArtikkel114Eller134 = useSelector(flytSelectors.ErIArtikkel114Eller134FlytSelector);
  const mottatteOpplysningerStatus = useSelector(
    mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector,
  ) as string;
  const erPensjonistToggleEnabled = useFeatureToggle(MELOSYS_PENSJONIST);
  const erPensjonistEØSToggleEnabled = useFeatureToggle(MELOSYS_PENSJONIST_EØS);
  const visMottakerinstitusjoner = skalViseMottakerinstitusjoner(
    sakstype,
    sakstema,
    behandlingstema,
    behandlingstype,
    erPensjonistToggleEnabled,
    erPensjonistEØSToggleEnabled,
  );

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
    // Cancel any pending debounced kontroll to prevent concurrent HTTP requests
    // that race with vedtak/fatt on SaksopplysningKilde entities
    debouncedKontrollerBehandling.cancel?.();

    if (!validerForm()) return;

    setVedtakPending(true);

    validerMottatteOpplysninger()
      .then(() => {
        const vedtakRequest = {
          behandlingsresultatTypeKode: FASTSATT_LOVVALGSLAND,
          vedtakstype: formValues.vedtakstype || FØRSTEGANGSVEDTAK,
          fritekst: formValues.vedtaksbrevFritekst,
          begrunnelseFritekst: formValues.vedtaksbrevFritekst,
          fritekstSed: formValues.fritekstSed,
          kopiTilArbeidsgiver: formValues.kopiTilArbeidsgiver,
          mottakerinstitusjoner: visMottakerinstitusjoner ? [formValues.mottakerinstitusjon] : [],
          nyVurderingBakgrunn: formValues.vedtakstypebegrunnelse,
        };
        dispatch(vedtakOperations.fatt(behandlingID, vedtakRequest)).then((res) => {
          if (res.data?.data?.error) {
            setVedtakPending(false);
          }
        });
      })
      .catch(() => setVedtakPending(false));
  };

  const { fomDato, tomDato, lovvalgsbestemmelse, tilleggBestemmelse } = lovvalgsperiode;
  const erArtikkel113 = lovvalgsbestemmelse === FO_883_2004_ART11_3A;

  const sedMottakerLand = finnSedMottakerLand(arbeidsland, bostedsland || {}, lovvalgsbestemmelse, tilleggBestemmelse);
  const flereSoknadslandEnnTillatt = arbeidsland.length > 1 && !MKVUtils.kanHaFlereSoknadsland(behandlingstema);
  const stegErGyldig = redigerbart && formIsValid && !harFeilmeldinger && !flereSoknadslandEnnTillatt;
  const bucLukketOgLovvalgNorge = !erBucAapen && behandlingstema === BESLUTNING_LOVVALG_NORGE;
  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

  const lovvalgsbestemmelseKT = MKVUtils.lovvalgsbestemmelseTilObjekt(lovvalgsbestemmelse);
  const tilleggBestemmelseKT = MKVUtils.lovvalgsbestemmelseTilObjekt(tilleggBestemmelse);
  const maksAntallTegn = MKVUtils.erStorbritanniaKonvBestemmelse(lovvalgsbestemmelse) ? 500 - 38 : 500;
  const mapDokumenter = (dokumenter: BrevDokumentMetadataType[]) => {
    return dokumenter.map((dokument: BrevDokumentMetadataType) => {
      if (dokument.dokumentData !== undefined) {
        dokument.dokumentData.nyVurderingBakgrunn = formValues?.vedtakstypebegrunnelse;
        dokument.dokumentData.begrunnelseFritekst = formValues?.vedtaksbrevFritekst;
      }
      return dokument;
    });
  };
  const skalViseFritekstSed = !(bucLukketOgLovvalgNorge || (erSokkelSkip && erArtikkel113));

  return (
    <div className="vedtak">
      <Nav.Heading level="1" className="stegvelgertittel">
        Omfattet av norsk trygdelovgivning
      </Nav.Heading>
      <div>
        <Nav.Row>
          <Nav.Column xs="4">
            <Nav.BodyLong weight="semibold" size="small">
              Lovvalgsperiode
            </Nav.BodyLong>
            <EnkeltDato dato={fomDato} />
            &nbsp;-&nbsp;
            <EnkeltDato dato={tomDato} />
          </Nav.Column>
          <Nav.Column xs="4">
            <Nav.BodyLong weight="semibold" size="small">
              Lovvalgsbestemmelse
            </Nav.BodyLong>
            {lovvalgsbestemmelseKT?.term}
          </Nav.Column>
          <Nav.Column xs="4">
            <Nav.BodyLong weight="semibold" size="small">
              Tilleggsbestemmelse
            </Nav.BodyLong>
            {tilleggBestemmelseKT?.term}
          </Nav.Column>
        </Nav.Row>
        {erNyVurdering && <Skjema.Vedtakstype className="vedtaksType" redigerbart={redigerbart} />}
        <Nav.Row className="fritekst">
          <Nav.Column xs="7">
            <Skjema.Textarea
              feltNavn="vedtaksbrevFritekst"
              label="Fritekstfelt til begrunnelse"
              maxLength={10000}
              readOnly={!redigerbart}
            />
          </Nav.Column>
        </Nav.Row>
        {skalViseFritekstSed && (
          <Nav.Row className="fritekstSed">
            <Nav.Column xs="7">
              <Skjema.Textarea
                label="Ytterligere informasjon til SED (valgfri)"
                feltNavn="fritekstSed"
                readOnly={!redigerbart}
                maxLength={maksAntallTegn}
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
                bucType={erArtikkel114Eller134 ? LA_BUC_05 : LA_BUC_04}
              />
            </Nav.Column>
          </Nav.Row>
        )}
        {redigerbart &&
          skalViseSendOrienteringsbrev(sakstype, behandlingstema, erArtikkel11_4, erSelvstendigNaeringsdrivende) && (
            <Skjema.Checkbox feltNavn="kopiTilArbeidsgiver" label="Send orienteringsbrev til arbeidsgiver/virksomhet" />
          )}
        <Nav.Row>
          <Nav.Column xs="7">
            {stegErGyldig && (
              <Dokumentliste
                behandlingID={behandlingID}
                dokumenter={
                  bucLukketOgLovvalgNorge
                    ? mapDokumenter(pdfDokumenter.filter((dok) => !("sedType" in dok)) as BrevDokumentMetadataType[])
                    : mapDokumenter(pdfDokumenter as BrevDokumentMetadataType[])
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
}

const VurderingVedtakForm = reduxForm<FormValuesProps, VurderingVedtakProps>({
  form: KV.Form.ARTIKKEL_12_VEDTAK,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) =>
    lagYupToReduxformErrorMapper(VurderingVedtakSchema, {
      context: {
        behandlingstype: props.behandlingstype,
        bestemmelse: props.lovvalgsperiode?.lovvalgsbestemmelse,
      },
    })(values),
})(VurderingVedtak);

export default connector(VurderingVedtakForm);
