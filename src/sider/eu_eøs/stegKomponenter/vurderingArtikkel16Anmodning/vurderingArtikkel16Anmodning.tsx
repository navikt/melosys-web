import { ChangeEvent, Fragment, useEffect, useState } from "react";
import { connect, ConnectedProps, useDispatch, useSelector } from "react-redux";
import { getFormValues, InjectedFormProps, isValid, reduxForm } from "redux-form";
// @ts-ignore
import * as EKV from "eessi-kodeverk";
import { v4 as uuid } from "uuid";
import * as Api from "../../../../services/api";
import * as Utils from "../../../../utils";
import MKV from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Skjema from "../../../../felleskomponenter/skjema";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { anmodningsperioderSelectors } from "../../../../ducks/anmodningsperioder";
import { behandlingsperioderSelectors } from "../../../../ducks/behandlingsperioder";
import { dokumenterSelectors } from "../../../../ducks/dokumenter";
import { datoDiffMenneskelig } from "../../../../utils/dato";
import DatoOmrade from "../../../../felleskomponenter/datoOmrade";
import Dokumentliste from "../../../../felleskomponenter/dokumentliste";
import Mottakerinstitusjonvelger from "../../../../felleskomponenter/mottakerinstitusjonvelger";
import VedleggVelger from "../../../../felleskomponenter/vedleggvelger";
import VedleggTable from "../../../../felleskomponenter/vedleggTable";
import {
  konverterLovvalgsbestemmelseTilStegData,
  konverterUnntakFraBestemmelseTilStegData,
  konverterVilkarTilStegData,
  lagUnntakFraBestemmelse,
  lagVilkarbegrunnelse,
} from "../../../../felleskomponenter/stegvelger";
import { lagYupToReduxformErrorMapper } from "../../../../yup";
import VurderingArtikkel16AnmodningSchema from "./vurderingArtikkel16AnmodningSchema";
import "./vurderingArtikkel16Anmodning.css";
import { kontrollOperations } from "../../../../ducks/kontroll";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import TidligereMedlemskap from "./tidligereMedlemskap";
import { Vilkaar } from "../../../../services/modules/vilkar";
import { KTObject } from "@navikt/melosys-kodeverk";
import { RootState } from "AppTypes";
import { useIsMounted } from "../../../../hooks";
import { FysiskDokument } from "Domene";
import { useFeatureToggle } from "../../../../featuretoggle";
import { MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA } from "../../../../featuretoggle/toggleNavn";

const { KONV_EFTA_STORBRITANNIA_ART18_1 } = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia;
const { SAERLIG_GRUNN } = MKV.Koder.begrunnelser.art16_1_anmodning;
const { BRUKER, UTENLANDSK_TRYGDEMYNDIGHET } = MKV.Koder.mottakerroller;
const { ORIENTERING_ANMODNING_UNNTAK, ANMODNING_UNNTAK } = MKV.Koder.brev.produserbaredokumenter;

const mapStateToProps = (state: RootState) => ({
  formIsValid: isValid(KV.Form.ARTIKKEL_16_ANMODNING)(state),
  formValues: getFormValues(KV.Form.ARTIKKEL_16_ANMODNING)(state) as FormValuesProps,
  initialValues: {
    tidligeremedlemskap: behandlingsperioderSelectors.tidligereMedlemskap(state),
    mottakerinstitusjon: "",
    kreverMottakerinstitusjon: false,
    fritekstSed: null,
  },
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface FormValuesProps {
  tidligeremedlemskap: string[];
  mottakerinstitusjon: string;
  kreverMottakerinstitusjon: boolean;
  fritekstSed: string | null;
}

interface Props {
  tilstand: {
    unntaksvilkår: Vilkaar;
    muligeBegrunnelseValg: KTObject[];
    erIDirekteTilArtikkel16Flyt: boolean;
    harAvklaring: boolean;
  };
  bekreftOgFortsett: () => void;
  tilbake: () => void;
  oppdaterData: (objekt: any) => void;
  slettData: (objekt?: any) => void;
  redigerbart: boolean;
  lagreVilkarHandler: () => void;
  oppdaterOgLagreBehandlinger: () => Promise<void>;
  lagreAnmodningsperioderHandler: () => Promise<void>;
  byggAnmodningsperioderHandler: () => Promise<void>;
  lagreOgBestillAnmodningsperioder: (bestillAnmodningsperioderBody: any) => Promise<void>;
}

const VurderingArtikkel16Anmodning = ({
  oppdaterData,
  tilstand: { unntaksvilkår, muligeBegrunnelseValg, erIDirekteTilArtikkel16Flyt },
  slettData,
  formValues,
  oppdaterOgLagreBehandlinger,
  lagreOgBestillAnmodningsperioder,
  byggAnmodningsperioderHandler,
  lagreAnmodningsperioderHandler,
  lagreVilkarHandler,
  touch,
  formIsValid,
  redigerbart,
  form,
  tilbake,
}: Props & PropsFromRedux & InjectedFormProps<FormValuesProps, Props & PropsFromRedux>) => {
  const konvensjonStorbritanniaToggleEnabled = useFeatureToggle(MELOSYS_KONVENSJON_EFTA_LAND_OG_STORBRITANNIA);
  const dispatch = useDispatch();
  const isMounted = useIsMounted();
  const [lovvalgFeilmelding, setLovvalgFeilmelding] = useState<string | undefined>(undefined);
  const [begrunnelseFeilmelding, setBegrunnelseFeilmelding] = useState<string | undefined>(undefined);
  const [fritekstFeilmelding, setFritekstFeilmelding] = useState<string | undefined>(undefined);
  const [fritekstSEDFeilmelding, setFritekstSEDFeilmelding] = useState<string | undefined>(undefined);
  const [sendBrevFeilmelding, setSendBrevFeilmelding] = useState<string | undefined>(undefined);
  const [valgteVedlegg, setValgteVedlegg] = useState<FysiskDokument[]>([]);
  const [harFeil, setHarFeil] = useState(false);
  const [anmodningPending, setAnmodningPending] = useState(false);
  const [sjekkerAdresse, setSjekkerAdresse] = useState(false);

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const anmodningsperiode = useSelector(anmodningsperioderSelectors.AnmodningsperiodeSelector);
  const arbeidsland = useSelector(avklartefaktaSelectors.ArbeidslandKTSelector);
  const medlemskap = useSelector(behandlingerSelectors.MedlemskapSelector);
  const unntakFraBestemmelse = useSelector(anmodningsperioderSelectors.UnntakFraBestemmelseSelector);
  const valgteVirksomheter = useSelector(avklartefaktaSelectors.AvklarteVirksomheterSelector);
  const fysiskeDokumenter = useSelector(dokumenterSelectors.AlleFysiskeDokumentSelector);
  const mottatteOpplysningerStatus = useSelector(mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector);
  const lovvalgsbestemmelse = useSelector(anmodningsperioderSelectors.LovvalgsbestemmelseSelector);
  const feltNavnFraBestemmelse =
    lovvalgsbestemmelse === KONV_EFTA_STORBRITANNIA_ART18_1 ? "art18_1_anmodning" : "art16_1_anmodning";

  useEffect(() => {
    if (konvensjonStorbritanniaToggleEnabled) {
      oppdaterData(konverterVilkarTilStegData(feltNavnFraBestemmelse, unntaksvilkår));
      oppdaterData(konverterLovvalgsbestemmelseTilStegData(lovvalgsbestemmelse));
    } else {
      oppdaterData(konverterVilkarTilStegData("art16_1_anmodning", unntaksvilkår));
      oppdaterData(
        konverterLovvalgsbestemmelseTilStegData(
          MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART16_1
        )
      );
    }

    if (unntakFraBestemmelse) {
      oppdaterData(konverterUnntakFraBestemmelseTilStegData(unntakFraBestemmelse));
    }

    return () => {
      slettData();
    };
  }, []);

  const kontroller = () => {
    setSjekkerAdresse(true);
    Api.Kontroll.kontrollerAdresse({ behandlingID })
      .then((res) => {
        if (!Utils._isEmpty(res.kontrollfeilList)) {
          setHarFeil(true);
          dispatch(kontrollOperations.oppdaterKontrollFeil({ kontrollfeilList: res.kontrollfeilList }));
        } else {
          setHarFeil(false);
          dispatch(kontrollOperations.resetKontrollFeil());
        }
        setSendBrevFeilmelding(undefined);
        setSjekkerAdresse(false);
      })
      .catch(() => {
        setHarFeil(true);
        setSendBrevFeilmelding(
          "En teknisk feil skjedde da adresser skulle sjekkes. Prøv igjen eller kontakt brukerstøtte hvis problemet vedvarer."
        );
        setSjekkerAdresse(false);
      });
  };

  useEffect(() => {
    if (mottatteOpplysningerStatus === "OK" && !sjekkerAdresse) {
      kontroller();
    }
  }, [mottatteOpplysningerStatus]);

  const handleEndretUnntakFraBestemmelse = async (event: ChangeEvent<HTMLSelectElement>) => {
    oppdaterData(lagUnntakFraBestemmelse(event.target.value));
    await byggAnmodningsperioderHandler();
    await lagreAnmodningsperioderHandler();
    setLovvalgFeilmelding(undefined);
  };

  const handleEndretBegrunnelseFritekst = (event: ChangeEvent<HTMLInputElement>) => {
    setFritekstFeilmelding(undefined);
    const { id, value } = event.target;
    oppdaterData(lagVilkarbegrunnelse(id, null, value));
  };

  const handleEndretBegrunnelseFritekstEngelsk = (event: ChangeEvent<HTMLInputElement>) => {
    setFritekstSEDFeilmelding(undefined);
    const { id, value } = event.target;
    oppdaterData(lagVilkarbegrunnelse(id, null, null, value));
  };

  const handleEndretBegrunnelse = async (event: ChangeEvent<HTMLSelectElement>) => {
    setBegrunnelseFeilmelding(undefined);
    const begrunnelse = event.target.value;
    oppdaterData(lagVilkarbegrunnelse(feltNavnFraBestemmelse, begrunnelse ? [begrunnelse] : []));
    lagreVilkarHandler();
  };

  const validerArbeidsgivere = () => {
    if (valgteVirksomheter.length === 1) {
      setSendBrevFeilmelding(undefined);
      return true;
    }
    setSendBrevFeilmelding(MKV.Terms.begrunnelser.kontroll_begrunnelser.IKKE_KUN_EN_VIRKSOMHET);
    return false;
  };

  const validerUnntakFraBestemmelse = () => {
    const valid = unntakFraBestemmelse;
    if (!valid) setLovvalgFeilmelding("Velg lovvalg");
    return valid;
  };

  const validerBegrunnelser = () => {
    const valid = unntaksvilkår.begrunnelseKoder.length !== 0;
    if (!valid) setBegrunnelseFeilmelding("Velg begrunnelser");
    return valid;
  };

  const validerFritekst = () => {
    const begrunnelseFritekstBrevValid = unntaksvilkår.begrunnelseFritekst;
    if (!begrunnelseFritekstBrevValid) setFritekstFeilmelding("Fyll inn fritekst");

    const begrunnelseFritekstEngelskValid = unntaksvilkår.begrunnelseFritekstEngelsk;
    if (!begrunnelseFritekstEngelskValid) setFritekstSEDFeilmelding("Fyll inn fritekst");

    return begrunnelseFritekstBrevValid && begrunnelseFritekstEngelskValid;
  };

  const validerSteg = () => {
    const arbeidsgivereValid = validerArbeidsgivere();
    const lovvalgValid = validerUnntakFraBestemmelse();
    const begrunnelserValid = validerBegrunnelser();
    const fritekstValid = unntaksvilkår.begrunnelseKoder.includes(SAERLIG_GRUNN) ? validerFritekst() : true;
    touch("mottakerinstitusjon");

    return arbeidsgivereValid && lovvalgValid && begrunnelserValid && fritekstValid && formIsValid;
  };

  const lagreBehandlingerOgBestillAnmodningsperioder = async () => {
    await oppdaterOgLagreBehandlinger();
    const body = {
      mottakerinstitusjon: formValues.mottakerinstitusjon || null,
      fritekstSed: formValues.fritekstSed,
      vedlegg: valgteVedlegg.map(({ journalpostID, dokumentID }) => ({ journalpostID, dokumentID })),
    };
    return lagreOgBestillAnmodningsperioder(body);
  };

  const validerStegOgLagreBehandling = async () => {
    if (validerSteg()) {
      setAnmodningPending(true);
      await byggAnmodningsperioderHandler();
      setLovvalgFeilmelding(undefined);

      await lagreBehandlingerOgBestillAnmodningsperioder();

      // Anmodning-operation navigerer til forside, og komponenten kan derfor være unmountet.
      if (isMounted) {
        setAnmodningPending(false);
      }
    }
  };

  const hentUnntaksbestemmelser = (): KTObject[] => {
    if (konvensjonStorbritanniaToggleEnabled && lovvalgsbestemmelse === KONV_EFTA_STORBRITANNIA_ART18_1) {
      return MKV.Kodekombinasjoner.unntaksbestemmelserStorbritanniaKonv;
    }
    return MKV.Kodekombinasjoner.unntaksbestemmelser;
  };

  const landSomTekstListe = arbeidsland.map((enkeltLandObjekt: KTObject) => enkeltLandObjekt.term).join(", ");

  const pdfDokumenter = formValues?.kreverMottakerinstitusjon
    ? [
        { dokumentData: { produserbardokument: ORIENTERING_ANMODNING_UNNTAK, mottaker: BRUKER } },
        { sedType: EKV.Koder.sedtyper.A001, sedData: { fritekst: formValues?.fritekstSed } },
      ]
    : [
        { dokumentData: { produserbardokument: ORIENTERING_ANMODNING_UNNTAK, mottaker: BRUKER } },
        {
          dokumentData: {
            produserbardokument: ANMODNING_UNNTAK,
            mottaker: UTENLANDSK_TRYGDEMYNDIGHET,
            ytterligereInformasjon: formValues?.fritekstSed,
          },
        },
      ];

  const begrunnelseFritekstBrevLabel = (
    <Fragment>
      <Nav.Typo.Element>Begrunnelse til orienteringsbrev til bruker</Nav.Typo.Element>
      <Nav.Typo.Normaltekst>
        Begrunnelsen kommer ut i vedtaksbrevet som en setning som starter med «Vi har bedt trygdemyndighetene i [land]
        om en avtale for deg, fordi», og slutter med teksten du har tilføyd.
      </Nav.Typo.Normaltekst>
    </Fragment>
  );

  return (
    <div>
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        {konvensjonStorbritanniaToggleEnabled
          ? "Vurder anmodning om unntak"
          : "Anmodning om unntak etter artikkel 16.1"}
      </Nav.Typo.Innholdstittel>
      <div className="artikkel16">
        {erIDirekteTilArtikkel16Flyt && !konvensjonStorbritanniaToggleEnabled && (
          <Nav.Row className="vilAnmode">
            <Nav.Column xs="6">
              <Nav.RadioGroup legend="" hideLegend defaultValue name="vilAnmode" disabled={!redigerbart}>
                <Nav.AkselRadio value>Ja, jeg vil anmode om unntak</Nav.AkselRadio>
                <Nav.AkselRadio value={false} disabled>
                  Nei, jeg vil avslå
                </Nav.AkselRadio>
              </Nav.RadioGroup>
            </Nav.Column>
          </Nav.Row>
        )}

        <Nav.Row className="artikkel16__ekstratopp">
          <Nav.Column xs="6">
            <Nav.Typo.Element>Det lands lovgivning det søkes unntak fra</Nav.Typo.Element>
            <Nav.Typo.Normaltekst>{landSomTekstListe}</Nav.Typo.Normaltekst>
          </Nav.Column>
          <Nav.Column xs="6">
            <Nav.Typo.Element>Antall måneder</Nav.Typo.Element>
            <Nav.Typo.Normaltekst>
              {datoDiffMenneskelig(anmodningsperiode.fomDato, anmodningsperiode.tomDato)}
            </Nav.Typo.Normaltekst>
            <DatoOmrade periode={{ fom: anmodningsperiode.fomDato, tom: anmodningsperiode.tomDato }} />
          </Nav.Column>
        </Nav.Row>

        <Nav.Row>
          <Nav.Column xs="7">
            <Nav.Select
              feil={lovvalgFeilmelding}
              onChange={handleEndretUnntakFraBestemmelse}
              value={unntakFraBestemmelse || ""}
              disabled={!redigerbart}
              label={<Nav.Typo.Element>Artikkelen det søkes unntak fra</Nav.Typo.Element>}
            >
              <option key={uuid()} value="" label="Velg..." disabled={!!unntakFraBestemmelse} />
              {hentUnntaksbestemmelser().map((kodeObjekt) => (
                <option key={uuid()} value={kodeObjekt.kode} label={kodeObjekt.term ?? ""} />
              ))}
            </Nav.Select>
          </Nav.Column>
        </Nav.Row>

        <Nav.Row>
          <Nav.Column xs="7">
            <Nav.Select
              feil={begrunnelseFeilmelding}
              onChange={handleEndretBegrunnelse}
              value={unntaksvilkår.begrunnelseKoder ? unntaksvilkår.begrunnelseKoder[0] : ""}
              disabled={!redigerbart}
              label={<Nav.Typo.Element>Legg til begrunnelse</Nav.Typo.Element>}
            >
              <option
                key={uuid()}
                value=""
                label="Velg..."
                disabled={!Utils._isEmpty(unntaksvilkår.begrunnelseKoder)}
              />
              {muligeBegrunnelseValg.map((kodeObjekt) => (
                <option key={uuid()} value={kodeObjekt.kode} label={kodeObjekt.term ?? ""} />
              ))}
            </Nav.Select>
          </Nav.Column>
        </Nav.Row>

        {unntaksvilkår.begrunnelseKoder?.includes(SAERLIG_GRUNN) && (
          <Nav.Row>
            <Nav.Column xs="7">
              <Nav.Textarea
                id={feltNavnFraBestemmelse}
                label={begrunnelseFritekstBrevLabel}
                placeholder="Skriv begrunnelsen her."
                disabled={!redigerbart}
                onBlur={lagreVilkarHandler}
                onChange={handleEndretBegrunnelseFritekst}
                value={unntaksvilkår.begrunnelseFritekst ?? ""}
                feil={fritekstFeilmelding}
                maxLength={1500}
                bredde="fullbredde"
              />
              {redigerbart && (
                <Nav.Textarea
                  id={feltNavnFraBestemmelse}
                  label={<Nav.Typo.Element>Begrunnelse til SED A001</Nav.Typo.Element>}
                  placeholder="Skriv begrunnelsen her."
                  onBlur={lagreVilkarHandler}
                  onChange={handleEndretBegrunnelseFritekstEngelsk}
                  value={unntaksvilkår.begrunnelseFritekstEngelsk ?? ""}
                  feil={fritekstSEDFeilmelding}
                  maxLength={255}
                  bredde="fullbredde"
                />
              )}
            </Nav.Column>
          </Nav.Row>
        )}

        {(!konvensjonStorbritanniaToggleEnabled || !Utils._isEmpty(medlemskap?.perioderMed)) && (
          <>
            <Nav.Typo.Element className="tidligereMedlemskap_label">{`Velg direkte forutgående perioder i ${landSomTekstListe}`}</Nav.Typo.Element>
            <TidligereMedlemskap
              oppdaterOgLagreBehandlinger={oppdaterOgLagreBehandlinger}
              redigerbart={redigerbart}
              medlemskap={medlemskap}
            />
          </>
        )}

        {redigerbart && (
          <Nav.Row className="fritekstSed">
            <Nav.Column xs="7">
              <Skjema.Textarea
                label={<Nav.Typo.Element>Ytterligere informasjon til SED (valgfri)</Nav.Typo.Element>}
                feltNavn="fritekstSed"
                disabled={!redigerbart}
                visTellerFra={500}
                maxLength={500}
              />
            </Nav.Column>
          </Nav.Row>
        )}

        <Nav.Row className="mottakerinstitusjoner">
          <Nav.Column xs="7">
            <Mottakerinstitusjonvelger
              form={form}
              redigerbart={redigerbart}
              landkode={arbeidsland[0].kode}
              bucType={EKV.Koder.buctyper.legislation.LA_BUC_01}
            />
          </Nav.Column>
        </Nav.Row>

        {redigerbart && (
          <>
            <Nav.Row>
              <Nav.Column xs="10">
                <Dokumentliste behandlingID={behandlingID} dokumenter={pdfDokumenter} validateOnClick={validerSteg} />
              </Nav.Column>
            </Nav.Row>

            <Nav.Row>
              <Nav.Column xs="6">
                <VedleggTable
                  valgteVedlegg={valgteVedlegg}
                  label="Vedlegg til SED"
                  setValgteVedlegg={setValgteVedlegg}
                  redigerbart={redigerbart}
                />
                <VedleggVelger
                  valgteVedlegg={valgteVedlegg}
                  onChange={setValgteVedlegg}
                  dokumenter={fysiskeDokumenter}
                  redigerbart={redigerbart}
                />
              </Nav.Column>
            </Nav.Row>
          </>
        )}

        {sendBrevFeilmelding && (
          <Nav.Alert variant={harFeil ? "error" : "warning"} className="varsel">
            {sendBrevFeilmelding}
          </Nav.Alert>
        )}

        <Nav.Row className="artikkel16__ekstratopp">
          <Mui.StegKnapper
            bekreftTekst="Send brevene"
            bekreftKnappProps={{
              loading: anmodningPending,
              disabled: !redigerbart || harFeil,
              onClick: validerStegOgLagreBehandling,
            }}
            tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
          />
        </Nav.Row>
      </div>
    </div>
  );
};

const VurderingArtikkel16AnmodningForm = reduxForm<FormValuesProps, PropsFromRedux & Props>({
  form: KV.Form.ARTIKKEL_16_ANMODNING,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values) => lagYupToReduxformErrorMapper(VurderingArtikkel16AnmodningSchema)(values),
})(VurderingArtikkel16Anmodning);

export default connector(VurderingArtikkel16AnmodningForm);
