import { KTObject } from "@navikt/melosys-kodeverk";
import { RootState } from "AppTypes";
import { useCallback, useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { useDispatch } from "../../../../hooks";
import { Action } from "redux";
import { getFormValues, reduxForm } from "redux-form";
import { ThunkDispatch } from "redux-thunk";

import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Hooks from "../../../../hooks";
import * as KV from "../../../../kodeverk";
import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import * as Ikoner from "../../../../resources/images";
import * as Api from "../../../../services/api";
import * as Utils from "../../../../utils";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { feiletResponsSelectors } from "../../../../ducks/feiletRespons";
import { formSelectors } from "../../../../ducks/form";
import { kontrollSelectors } from "../../../../ducks/kontroll";
import { kontrollerFerdigbehandling } from "../../../../ducks/kontroll/operations";
import { lovvalgsperioderOperations } from "../../../../ducks/lovvalgsperioder";
import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";

import bem from "../../../../bemUtils";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import { StegStatus } from "../../stegvelger";

import { useFeatureToggle } from "../../../../featuretoggle";
import { STANDARDVEDLEGG_EGET_VEDLEGG_AVTALELAND } from "../../../../featuretoggle/toggleNavn";
import Dokumentliste from "../../../../felleskomponenter/dokumentliste";
import VedleggTable from "../../../../felleskomponenter/vedleggTable";
import { BrevVedleggVisningstabellInterface } from "../../../../services/modules/dokumenter-v2";
import { lagYupToReduxformErrorMapper } from "../../../../yup";
import {
  BEGRUNNELSE_FRITEKST_HJELPETEKST,
  INNLEDNING_FRITEKST,
  NY_VURDERING_BAKGRUNN_HJELPETEKST,
  PERIODE_HJELPETEKST,
} from "./tekster";
import "./vurderingVedtak.less";
import vurdering_vedtak from "./vurderingVedtakSchema";

const { TRYGDEAVTALE_GB, TRYGDEAVTALE_US, TRYGDEAVTALE_CAN, TRYGDEAVTALE_AU } = MKV.Koder.brev.produserbaredokumenter;
const { CAN_ART6_2 } = MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_ca;
const { USA_ART5_4 } = MKV.Koder.lovvalgsbestemmelser.trygdeavtale.lovvalgsbestemmelser_trygdeavtale_us;
export const FRITEKST = "Fritekst";

const vurderingVedtakCls = bem("vurderingVedtak");

interface Periode {
  fom?: string | null;
  tom?: string | null;
}

const setNyVurderingBakgrunnFelt = (begrunnelseFraResultat: string | undefined, erNyVurdering: boolean) => {
  if (!erNyVurdering || !begrunnelseFraResultat) {
    return [null, null];
  }
  if (KV.finnEnkeltKodeFraListe(begrunnelseFraResultat, MKV.KTObjects.begrunnelser.nyvurderingbakgrunner)) {
    return [begrunnelseFraResultat, null];
  }
  return [FRITEKST, begrunnelseFraResultat];
};

const mapStateToProps = (state: RootState, ownProps: Props) => {
  const erNyVurdering =
    behandlingerSelectors.BehandlingstypeKodeSelector(state) === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
  const [initialNyVurderingBakgrunn, initialNyVurderingBakgrunnFritekst] = setNyVurderingBakgrunnFelt(
    ownProps.resultat.nyVurderingBakgrunn,
    erNyVurdering,
  );
  return {
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
    mottatteOpplysningerStatus: mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector(state),
    soknadsland: mottatteOpplysningerSelectors.SoknadslandKTSelector(state),
    lagretVedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
    familieFormValues: (formSelectors.TrygdeavtaleFamileFormSelector(state) as { values?: any }).values,
    formValues: getFormValues(KV.Form.Trygdeavtale.VEDTAK)(state),
    initialValues: {
      innledningFritekst: ownProps.resultat.innledningFritekst,
      begrunnelseFritekst: ownProps.resultat.begrunnelseFritekst,
      lovvalgsperiodeFom:
        ownProps.resultat.lovvalgsperiodeFom && Utils.dato.formatterDatoTilNorsk(ownProps.resultat.lovvalgsperiodeFom),
      lovvalgsperiodeTom:
        ownProps.resultat.lovvalgsperiodeTom && Utils.dato.formatterDatoTilNorsk(ownProps.resultat.lovvalgsperiodeTom),
      kopiTilArbeidsgiver: ![CAN_ART6_2, USA_ART5_4].includes(ownProps.resultat.bestemmelse),
      nyVurderingBakgrunn: initialNyVurderingBakgrunn,
      nyVurderingBakgrunnFritekst: initialNyVurderingBakgrunnFritekst,
    },
    formIsValid: formSelectors.TrygdeavtaleVedtakFormValidSelector(state),
    periodeIsValid: formSelectors.TrygdeavtaleVedtakFormPeriodeValidSelector(state),
    erNyVurdering,
    feilmeldinger: feiletResponsSelectors.FeilmeldingerSelector(state),
    kontrollfeil: kontrollSelectors.KontrollFeilSelector(state),
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterPeriode: (periode: Periode) => dispatch(mottatteOpplysningerOperations.oppdaterPeriode(periode)),
  hentLovvalgsperiode: (behandlingID: number) => dispatch(lovvalgsperioderOperations.hent(behandlingID)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  data: Api.Trygdeavtale.StegData;
  oppdaterFlyt: (resultat: Api.Trygdeavtale.Resultat, callback?: () => void) => void;
  tilbake: () => void;
  lagreOgFatteVedtak: (data: Api.Saksflyt.Vedtak.FattVedtakTrygdeavtaleReqDto) => void;
  redigerbart: boolean;
  resultat: Api.Trygdeavtale.Resultat;
  steg: Api.Trygdeavtale.Steg;
  formValues: {
    lovvalgsperiodeFom?: string;
    lovvalgsperiodeTom?: string;
    innledningFritekst?: string;
    begrunnelseFritekst?: string;
    kopiTilArbeidsgiver?: boolean;
    nyVurderingBakgrunn?: string;
    nyVurderingBakgrunnFritekst?: string;
  };
  aktivtSteg: boolean;
}

function VurderingVedtak({
  behandlingID,
  mottatteOpplysningerStatus,
  data: { bestemmelseValg },
  erNyVurdering,
  tilbake,
  redigerbart,
  resultat,
  steg,
  familieFormValues,
  formValues,
  periodeIsValid,
  oppdaterFlyt,
  soknadsland,
  lagreOgFatteVedtak,
  lagretVedtakstype,
  hentLovvalgsperiode,
  formIsValid,
  feilmeldinger,
  kontrollfeil,
  aktivtSteg,
}: Props & PropsFromRedux) {
  const [muligeMottakere, setMuligeMottakere] = useState(Api.DokumenterV2.tomHentMuligeMottakereResDto());
  const [visTomEndringFelt, setVisTomEndringFelt] = useState(false);
  const [vedtakPending, setVedtakPending] = useState(false);
  const [harOppfrisketLovvalgsperiode, setHarOppfrisketLovvalgsperiode] = useState(false);
  const [brevVedlegg, setBrevVedlegg] = useState<BrevVedleggVisningstabellInterface>({
    saksvedlegg: [],
    standardvedlegg: [],
  });
  const isMounted = Hooks.useIsMounted();
  const dispatch = useDispatch();
  let oppdaterFørKontroll = true;

  const skalViseKopiTilArbeidsgiverCheckbox = ![CAN_ART6_2, USA_ART5_4].includes(resultat.bestemmelse);

  const erStandardvedleggEgetVedleggAvtalelandEnabled = useFeatureToggle(STANDARDVEDLEGG_EGET_VEDLEGG_AVTALELAND);

  const getNyVurderingBakgrunn = () =>
    formValues?.nyVurderingBakgrunn === FRITEKST
      ? formValues?.nyVurderingBakgrunnFritekst
      : formValues?.nyVurderingBakgrunn;

  const filterKopiMottakere = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    if ([MKV.Koder.mottakerroller.ARBEIDSGIVER, MKV.Koder.mottakerroller.FULLMEKTIG].includes(muligMottaker?.rolle)) {
      return formValues?.kopiTilArbeidsgiver;
    }
    return true;
  };

  const getKopiMottakere = () => {
    return [
      ...muligeMottakere.kopiMottakere
        .filter(filterKopiMottakere)
        .map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker),
      ...muligeMottakere.fasteMottakere.map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker),
    ];
  };

  const getVedtakstype = () => {
    if (lagretVedtakstype) return lagretVedtakstype;
    if (erNyVurdering) return MKV.Koder.vedtakstyper.ENDRINGSVEDTAK;
    return MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK;
  };

  const lagFattVedtakTrygdeavtaleReqDto = (): Api.Saksflyt.Vedtak.FattVedtakTrygdeavtaleReqDto => ({
    behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
    innledningFritekst: formValues?.innledningFritekst || null,
    begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
    ektefelleFritekst: familieFormValues?.ektefelle?.fritekst || null,
    barnFritekst: familieFormValues?.barn?.fritekst || null,
    vedtakstype: getVedtakstype(),
    kopiMottakere: getKopiMottakere(),
    nyVurderingBakgrunn: getNyVurderingBakgrunn(),
  });

  async function kontroller(data: any) {
    if (data.mottatteOpplysningerStatus === "OK" && data.aktivtSteg && redigerbart) {
      setVedtakPending(true);
      const request = {
        behandlingID,
        vedtakstype: getVedtakstype(),
        behandlingsresultattype: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
        skalRegisteropplysningerOppdateres: oppdaterFørKontroll,
      };
      oppdaterFørKontroll = false;
      await dispatch(kontrollerFerdigbehandling(request));
      setVedtakPending(false);
    }
  }

  const debouncedKontrollerBehandling = useCallback(Utils._debounce(kontroller, 500), [kontrollerFerdigbehandling]);

  useEffect(() => {
    debouncedKontrollerBehandling({ aktivtSteg, mottatteOpplysningerStatus });
    return () => debouncedKontrollerBehandling.cancel();
  }, [aktivtSteg, resultat.lovvalgsperiodeTom, mottatteOpplysningerStatus]);

  const hentProduserbartDokument = (): string => {
    switch (soknadsland[0]?.kode) {
      case MKV.Koder.land_iso2.GB:
        return TRYGDEAVTALE_GB;
      case MKV.Koder.land_iso2.US:
        return TRYGDEAVTALE_US;
      case MKV.Koder.land_iso2.CA:
        return TRYGDEAVTALE_CAN;
      case MKV.Koder.land_iso2.AU:
        return TRYGDEAVTALE_AU;
      default:
        return "";
    }
  };

  const hentStandardvedleggForBrev = async () => {
    Api.DokumenterV2.hentStandardvedleggForBrev(hentProduserbartDokument()).then((res) => {
      setBrevVedlegg({
        saksvedlegg: [],
        standardvedlegg: res,
      });
    });
  };

  const hentMuligeMottakereOgStandardvedlegg = async () => {
    Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
      produserbartdokument: hentProduserbartDokument(),
      orgnr: null,
    }).then((res) => {
      setMuligeMottakere(res);
    });

    hentStandardvedleggForBrev();
  };

  const debouncedHentMuligeMottakereOgStandardvedlegg = useCallback(
    Utils._debounce(hentMuligeMottakereOgStandardvedlegg, 300),
    [],
  );
  const debouncedOppdaterFlyten = useCallback(
    Utils._debounce((trygdeavtaleresultat: Api.Trygdeavtale.Resultat) => oppdaterFlyt(trygdeavtaleresultat), 2000),
    [],
  );

  useEffect(() => {
    if (steg.status === StegStatus.FERDIG) {
      debouncedHentMuligeMottakereOgStandardvedlegg();
    }
    return () => debouncedHentMuligeMottakereOgStandardvedlegg.cancel();
  }, [steg.status, resultat.bestemmelse, resultat.virksomhet]);

  useEffect(() => {
    if (redigerbart && formValues && aktivtSteg) {
      debouncedOppdaterFlyten({
        ...resultat,
        innledningFritekst: formValues.innledningFritekst,
        begrunnelseFritekst: formValues.begrunnelseFritekst,
        nyVurderingBakgrunn: getNyVurderingBakgrunn(),
      });
    }
    return () => debouncedOppdaterFlyten.cancel();
  }, [
    formValues?.innledningFritekst,
    formValues?.begrunnelseFritekst,
    formValues?.nyVurderingBakgrunn,
    formValues?.nyVurderingBakgrunnFritekst,
  ]);

  // Refresher verdien av lovvalgsperiode i redux da denne lagres gjennom kall fra melosys-trygdeavtale til melosys-api
  useEffect(() => {
    if (!harOppfrisketLovvalgsperiode && aktivtSteg) {
      hentLovvalgsperiode(behandlingID).then(() => {
        setHarOppfrisketLovvalgsperiode(true);
      });
    }
  }, [aktivtSteg]);

  const handleLagreTomEndring = async () => {
    if (redigerbart && formValues) {
      oppdaterFlyt(
        {
          ...resultat,
          lovvalgsperiodeFom: Utils.dato.formatterDatoTilISO(formValues.lovvalgsperiodeFom, null),
          lovvalgsperiodeTom: Utils.dato.formatterDatoTilISO(formValues.lovvalgsperiodeTom, null),
        },
        () => hentLovvalgsperiode(behandlingID),
      );
      setVisTomEndringFelt(false);
    }
  };

  const mapMottaker = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return {
      mottakerNavn: muligMottaker.mottakerNavn,
      dokumentNavn: muligMottaker.dokumentNavn,
      dokumentData: {
        produserbardokument: hentProduserbartDokument(),
        mottaker: muligMottaker.rolle,
        kopiMottakere: getKopiMottakere(),
        innledningFritekst: formValues?.innledningFritekst || null,
        begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
        orgNr: muligMottaker?.orgnr || null,
        institusjonID: muligMottaker?.institusjonID || null,
        ektefelleFritekst: familieFormValues?.ektefelle?.fritekst || null,
        barnFritekst: familieFormValues?.barn?.fritekst || null,
        nyVurderingBakgrunn: getNyVurderingBakgrunn(),
      },
    };
  };

  const mapDokumenter = (mottakere: Api.DokumenterV2.HentMuligeMottakereResDto) => {
    if (!mottakere) return [];

    return [
      mapMottaker(mottakere.hovedMottaker),
      ...mottakere.kopiMottakere.filter(filterKopiMottakere).map(mapMottaker),
      ...mottakere.fasteMottakere.map(mapMottaker),
    ];
  };

  const fattVedtak = async () => {
    setVedtakPending(true);

    await lagreOgFatteVedtak(lagFattVedtakTrygdeavtaleReqDto());

    if (isMounted.current) {
      setVedtakPending(false);
    }
  };

  const skalViseStandardvedleggEgetVedlegg =
    erStandardvedleggEgetVedleggAvtalelandEnabled &&
    [TRYGDEAVTALE_GB, TRYGDEAVTALE_US, TRYGDEAVTALE_CAN, TRYGDEAVTALE_AU].includes(hentProduserbartDokument());

  const stegErGyldig =
    steg.status === StegStatus.FERDIG &&
    formIsValid &&
    redigerbart &&
    Utils._isEmpty(feilmeldinger) &&
    Utils._isEmpty(kontrollfeil);

  return (
    <div className={vurderingVedtakCls.block}>
      <Nav.Heading level="1" className="stegvelgertittel">
        Omfattet av norsk trygdelovgivning - trygdeavtale
      </Nav.Heading>

      <Nav.Row className={vurderingVedtakCls.element("infolinje")}>
        <Nav.Column xs="4">
          <Nav.BodyLong weight="semibold" size="small" className={vurderingVedtakCls.element("info")}>
            {Utils.streng.storeForbokstaver(
              KV.finnTermFraListe(bestemmelseValg, resultat.bestemmelse)?.split(" - ")[1],
            )}
          </Nav.BodyLong>
          <Nav.BodyLong size="small" className={vurderingVedtakCls.element("info")}>
            {KV.finnTermFraListe(bestemmelseValg, resultat.bestemmelse)?.split(" - ")[0]}
          </Nav.BodyLong>
        </Nav.Column>

        <Nav.Column xs="5">
          <Nav.BodyLong as="div" weight="semibold" size="small" className={vurderingVedtakCls.element("info")}>
            <LabelMedHjelpetekst label="Periode" hjelpetekst={PERIODE_HJELPETEKST} />
          </Nav.BodyLong>
          <Nav.BodyLong size="small" className={vurderingVedtakCls.element("datofelt_wrapper")}>
            <span className={vurderingVedtakCls.element("datofelt_fom")}>
              {`${formValues?.lovvalgsperiodeFom ? formValues?.lovvalgsperiodeFom : ""} -`}&nbsp;
            </span>
            {visTomEndringFelt ? (
              <span className={vurderingVedtakCls.element("datofelt")}>
                <Skjema.Datovelger label="" feltNavn="lovvalgsperiodeTom" disabled={!redigerbart} />
                <Nav.Button
                  variant="primary"
                  disabled={!redigerbart || !periodeIsValid}
                  onClick={handleLagreTomEndring}
                >
                  Lagre
                </Nav.Button>
              </span>
            ) : (
              <span>{Utils.dato.formatterDatoTilNorsk(formValues?.lovvalgsperiodeTom)}</span>
            )}
            {!visTomEndringFelt && (
              <Nav.Button
                icon={<Ikoner.BlyantActive />}
                variant="tertiary"
                onClick={() => setVisTomEndringFelt(true)}
                disabled={!redigerbart}
              >
                Endre
              </Nav.Button>
            )}
          </Nav.BodyLong>
        </Nav.Column>

        <Nav.Column xs="3">
          <Nav.BodyLong weight="semibold" size="small" className={vurderingVedtakCls.element("info")}>
            Familiemedlemmer
          </Nav.BodyLong>
          <Nav.BodyLong size="small" className={vurderingVedtakCls.element("info")}>
            {resultat.ektefelle || !Utils._isEmpty(resultat.barn) ? "Ja" : "-"}
          </Nav.BodyLong>
        </Nav.Column>
      </Nav.Row>

      {erNyVurdering && (
        <>
          <Nav.Row>
            <Nav.Column xs="6">
              <Skjema.Select
                label={
                  <LabelMedHjelpetekst
                    label="Oppgi grunn for nytt vedtak (Obligatorisk)"
                    hjelpetekst={NY_VURDERING_BAKGRUNN_HJELPETEKST}
                  />
                }
                feltNavn="nyVurderingBakgrunn"
                readonly={!redigerbart}
                emptyFieldDisabled={!!formValues?.nyVurderingBakgrunn}
              >
                {MKV.KTObjects.begrunnelser.nyvurderingbakgrunner?.map((bakgrunn: KTObject) => (
                  <option key={bakgrunn.kode} value={bakgrunn.kode} label={bakgrunn.term || ""} />
                ))}
                <option key={FRITEKST} value={FRITEKST} label={FRITEKST} />
              </Skjema.Select>
            </Nav.Column>
          </Nav.Row>
          {formValues?.nyVurderingBakgrunn === FRITEKST && (
            <Skjema.HTMLEditor
              feltNavn="nyVurderingBakgrunnFritekst"
              className={vurderingVedtakCls.elementWithModifier("nyvurdering", "fritekst")}
              disabled={!redigerbart}
            />
          )}
        </>
      )}

      <Nav.BodyLong
        as="div"
        weight="semibold"
        size="small"
        className={vurderingVedtakCls.element("fritekst_overskrift")}
      >
        <LabelMedHjelpetekst label="Fritekst til innledning" hjelpetekst={INNLEDNING_FRITEKST} />
      </Nav.BodyLong>
      <Skjema.HTMLEditor
        feltNavn="innledningFritekst"
        className={vurderingVedtakCls.element("fritekst_editor")}
        disabled={!redigerbart}
      />

      <Nav.BodyLong as="div" size="small" className={vurderingVedtakCls.element("fritekst_overskrift")}>
        <LabelMedHjelpetekst label="Fritekst til begrunnelse" hjelpetekst={BEGRUNNELSE_FRITEKST_HJELPETEKST} />
      </Nav.BodyLong>
      <Skjema.HTMLEditor
        feltNavn="begrunnelseFritekst"
        className={vurderingVedtakCls.element("fritekst_editor")}
        disabled={!redigerbart}
      />

      {stegErGyldig && skalViseKopiTilArbeidsgiverCheckbox && (
        <Skjema.Checkbox
          feltNavn="kopiTilArbeidsgiver"
          label="Send kopi til arbeidsgiver/virksomhet"
          className={vurderingVedtakCls.element("kopiCheckbox")}
          disabled={!redigerbart}
        />
      )}

      {stegErGyldig && <Dokumentliste behandlingID={behandlingID} dokumenter={mapDokumenter(muligeMottakere)} />}
      {stegErGyldig && skalViseStandardvedleggEgetVedlegg && (
        <VedleggTable
          valgteVedlegg={brevVedlegg}
          setValgteVedlegg={() => {
            /* Readonly */
          }}
          label="Vedlegg"
          redigerbart={false /* Readonly. Ikke vis slett-knapp. */}
        />
      )}

      {redigerbart && erNyVurdering && (
        <Nav.Alert variant="info" className={vurderingVedtakCls.element("alertstripe")}>
          {KV.Koder.AlertstripeTekst.NY_VURDERING_MEDL_TEKST}
        </Nav.Alert>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: fattVedtak,
          disabled: !stegErGyldig,
          loading: vedtakPending,
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
}

const VurderingVedtakForm = reduxForm<object, PropsFromRedux & Props>({
  form: KV.Form.Trygdeavtale.VEDTAK,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) =>
    lagYupToReduxformErrorMapper(vurdering_vedtak, {
      context: {
        erNyVurdering: props.erNyVurdering,
      },
    })(values),
})(VurderingVedtak);

export default connector(VurderingVedtakForm);
