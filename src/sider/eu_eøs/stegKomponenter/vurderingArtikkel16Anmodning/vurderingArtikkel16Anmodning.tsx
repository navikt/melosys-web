import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { connect, ConnectedProps, useSelector } from "react-redux";
import { getFormValues, InjectedFormProps, isValid, reduxForm } from "redux-form";
// @ts-expect-error generisk beskrivelse
import * as EKV from "eessi-kodeverk";
import { KTObject } from "@navikt/melosys-kodeverk";
import { RootState } from "AppTypes";
import { anmodningsperioderSelectors } from "../../../../ducks/anmodningsperioder";
import { avklartefaktaSelectors } from "../../../../ducks/avklartefakta";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { behandlingsperioderSelectors } from "../../../../ducks/behandlingsperioder";
import { dokumenterSelectors } from "../../../../ducks/dokumenter";
import { kontrollOperations, kontrollSelectors } from "../../../../ducks/kontroll";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import Dokumentliste from "../../../../felleskomponenter/dokumentliste";
import EnkeltDato from "../../../../felleskomponenter/enkeltDato";
import Mottakerinstitusjonvelger from "../../../../felleskomponenter/mottakerinstitusjonvelger";
import * as Skjema from "../../../../felleskomponenter/skjema";
import {
  konverterLovvalgsbestemmelseTilStegData,
  konverterUnntakFraBestemmelseTilStegData,
  konverterVilkarTilStegData,
  lagUnntakFraBestemmelse,
  lagVilkarbegrunnelse,
} from "../../../../felleskomponenter/stegvelger";
import * as Mui from "../../../../felleskomponenter/ui";
import VedleggTable from "../../../../felleskomponenter/vedleggTable";
import VedleggVelger from "../../../../felleskomponenter/vedleggvelger";
import { useFeatureToggle } from "../../../../featuretoggle";
import { MELOSYS_CDM_4_4 } from "../../../../featuretoggle/toggleNavn";
import { useIsMounted, useDispatch } from "../../../../hooks";
import * as KV from "../../../../kodeverk";
import MKV, { MKVUtils } from "../../../../melosyskodeverk";
import * as Nav from "../../../../navFrontend";
import {
  BrevVedleggInterface,
  BrevVedleggVisningstabellInterface,
  TilgjengeligStandardvedlegg,
} from "../../../../services/modules/dokumenter-v2";
import { Vilkaar } from "../../../../services/modules/vilkar";
import * as Utils from "../../../../utils";
import { datoDiffMenneskelig } from "../../../../utils/dato";
import { lagYupToReduxformErrorMapper } from "../../../../yup";
import TidligereMedlemskap from "./tidligereMedlemskap";
import "./vurderingArtikkel16Anmodning.less";
import VurderingArtikkel16AnmodningSchema from "./vurderingArtikkel16AnmodningSchema";

const { KONV_EFTA_STORBRITANNIA_ART18_1 } = MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_konv_efta_storbritannia;
const { SAERLIG_GRUNN } = MKV.Koder.begrunnelser.anmodning_begrunnelser;
const { BRUKER, UTENLANDSK_TRYGDEMYNDIGHET } = MKV.Koder.mottakerroller;
const { ORIENTERING_ANMODNING_UNNTAK, ANMODNING_UNNTAK } = MKV.Koder.brev.produserbaredokumenter;

const mapStateToProps = (state: RootState) => ({
  lovvalgsbestemmelse: anmodningsperioderSelectors.LovvalgsbestemmelseSelector(state),
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
  begrunnelseFritekst: string | null;
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
  aktivtSteg: boolean;
  lagreVilkarHandler: () => void;
  lagreAnmodningsperioderHandler: () => Promise<void>;
  byggAnmodningsperioderHandler: () => Promise<void>;
  lagreOgBestillAnmodningsperioder: (bestillAnmodningsperioderBody: any) => Promise<void>;
}

export function VurderingArtikkel16Anmodning({
  oppdaterData,
  tilstand: { unntaksvilkår, muligeBegrunnelseValg },
  slettData,
  formValues,
  lagreOgBestillAnmodningsperioder,
  byggAnmodningsperioderHandler,
  lagreAnmodningsperioderHandler,
  lagreVilkarHandler,
  touch,
  formIsValid,
  redigerbart,
  form,
  tilbake,
  aktivtSteg,
  lovvalgsbestemmelse,
}: Props & PropsFromRedux & InjectedFormProps<FormValuesProps, Props & PropsFromRedux>) {
  const dispatch = useDispatch();
  const isMounted = useIsMounted();
  const isCdm44Enabled = useFeatureToggle(MELOSYS_CDM_4_4);
  const [erFjernarbeidTWFA, setErFjernarbeidTWFA] = useState(false);
  const [lovvalgFeilmelding, setLovvalgFeilmelding] = useState<string | undefined>(undefined);
  const [begrunnelseFeilmelding, setBegrunnelseFeilmelding] = useState<string | undefined>(undefined);
  const [fritekstFeilmelding, setFritekstFeilmelding] = useState<string | undefined>(undefined);
  const [fritekstSEDFeilmelding, setFritekstSEDFeilmelding] = useState<string | undefined>(undefined);
  const [valgteVedlegg, setValgteVedlegg] = useState<BrevVedleggInterface>({
    saksvedlegg: [],
    standardvedlegg: null,
  });
  const [pending, setPending] = useState(false);

  const tilgjengeligeStandardvedlegg: TilgjengeligStandardvedlegg[] = []; // TODO: Skal implementeres i MELOSYS-7071

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const anmodningsperiode = useSelector(anmodningsperioderSelectors.AnmodningsperiodeSelector);
  const kontrollFeil = useSelector(kontrollSelectors.KontrollFeilSelector);
  const arbeidsland = useSelector(avklartefaktaSelectors.ArbeidslandKTSelector);
  const medlemskap = useSelector(behandlingerSelectors.MedlemskapSelector);
  const unntakFraBestemmelse = useSelector(anmodningsperioderSelectors.UnntakFraBestemmelseSelector);
  const fysiskeDokumenter = useSelector(dokumenterSelectors.AlleFysiskeDokumentSelector);
  const mottatteOpplysningerStatus = useSelector(
    mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector,
  ) as string;
  const feltNavnFraBestemmelse =
    lovvalgsbestemmelse === KONV_EFTA_STORBRITANNIA_ART18_1 ? "art18_1_anmodning" : "art16_1_anmodning";

  useEffect(() => {
    oppdaterData(konverterVilkarTilStegData(feltNavnFraBestemmelse, unntaksvilkår));
    oppdaterData(konverterLovvalgsbestemmelseTilStegData(lovvalgsbestemmelse));

    if (unntakFraBestemmelse) {
      oppdaterData(konverterUnntakFraBestemmelseTilStegData(unntakFraBestemmelse));
    }

    return () => {
      slettData();
      dispatch(kontrollOperations.resetKontrollFeil());
    };
  }, []);

  const kontrollerBehandling = async (data: { aktivtSteg: boolean; mottatteOpplysningerStatus: string }) => {
    if (redigerbart && data.mottatteOpplysningerStatus === "OK" && data.aktivtSteg) {
      setPending(true);
      await dispatch(kontrollOperations.kontrollerAnmodningOmUnntak({ behandlingID }));
      setPending(false);
    }
  };
  const debouncedKontrollerBehandling = useCallback(Utils._debounce(kontrollerBehandling, 500), []);

  useEffect(() => {
    debouncedKontrollerBehandling({ aktivtSteg, mottatteOpplysningerStatus });
  }, [aktivtSteg, mottatteOpplysningerStatus]);

  const handleEndretUnntakFraBestemmelse = async (event: ChangeEvent<HTMLSelectElement>) => {
    oppdaterData(lagUnntakFraBestemmelse(event.target.value));
    await byggAnmodningsperioderHandler();
    await lagreAnmodningsperioderHandler();
    setLovvalgFeilmelding(undefined);
    setErFjernarbeidTWFA(false);
  };

  const handleEndretBegrunnelseFritekst = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setFritekstFeilmelding(undefined);
    const { id, value } = event.target;
    oppdaterData(lagVilkarbegrunnelse(id, null, value));
  };

  const handleEndretBegrunnelseFritekstEngelsk = (event: ChangeEvent<HTMLTextAreaElement>) => {
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

  const setValgtSaksvedlegg = (valgtSaksvedlegg: BrevVedleggVisningstabellInterface) => {
    setValgteVedlegg({
      saksvedlegg: valgtSaksvedlegg.saksvedlegg,
      standardvedlegg: null,
    });
  };

  const erFriteksterGyldig = () => {
    if (!unntaksvilkår.begrunnelseKoder.includes(SAERLIG_GRUNN)) return true;

    const begrunnelseFritekstBrevValid = Boolean(unntaksvilkår.begrunnelseFritekst);
    if (!begrunnelseFritekstBrevValid) setFritekstFeilmelding("Fyll inn fritekst");

    const begrunnelseFritekstEngelskValid = Boolean(unntaksvilkår.begrunnelseFritekstEngelsk);
    if (!begrunnelseFritekstEngelskValid) setFritekstSEDFeilmelding("Fyll inn fritekst");

    return begrunnelseFritekstBrevValid && begrunnelseFritekstEngelskValid;
  };

  const erStegGyldig = () => {
    const unntakFraBestemmelseErGyldig = Boolean(unntakFraBestemmelse);
    if (!unntakFraBestemmelseErGyldig) setLovvalgFeilmelding("Velg lovvalg");

    const begrunnelserErGyldig = unntaksvilkår.begrunnelseKoder.length !== 0;
    if (!begrunnelserErGyldig) setBegrunnelseFeilmelding("Velg begrunnelser");

    touch("mottakerinstitusjon");

    return unntakFraBestemmelseErGyldig && begrunnelserErGyldig && erFriteksterGyldig() && formIsValid;
  };

  const validerStegOgLagreBehandling = async () => {
    if (erStegGyldig()) {
      setPending(true);
      await byggAnmodningsperioderHandler();
      setLovvalgFeilmelding(undefined);

      const body = {
        mottakerinstitusjon: formValues.mottakerinstitusjon || null,
        fritekstSed: formValues.fritekstSed,
        begrunnelseFritekst: unntaksvilkår.begrunnelseFritekst,
        erFjernarbeidTWFA: isCdm44Enabled && erFjernarbeidTWFA ? true : null,
        vedlegg: valgteVedlegg.saksvedlegg.map(({ journalpostID, dokumentID }) => ({ journalpostID, dokumentID })),
      };

      await lagreOgBestillAnmodningsperioder(body);

      // Anmodning-operation navigerer til forside, og komponenten kan derfor være unmountet.
      if (isMounted) {
        setPending(false);
      }
    }
  };

  const hentUnntaksbestemmelser = (): KTObject[] => {
    if (lovvalgsbestemmelse === KONV_EFTA_STORBRITANNIA_ART18_1) {
      return MKV.Kodekombinasjoner.unntaksbestemmelserStorbritanniaKonv;
    }
    return MKV.Kodekombinasjoner.unntaksbestemmelser;
  };

  const landSomTekstListe = arbeidsland.map((enkeltLandObjekt: KTObject) => enkeltLandObjekt.term).join(", ");

  const pdfDokumenter = formValues?.kreverMottakerinstitusjon
    ? [
        {
          dokumentData: {
            produserbardokument: ORIENTERING_ANMODNING_UNNTAK,
            mottaker: BRUKER,
            fritekst: unntaksvilkår.begrunnelseFritekst,
          },
        },
        {
          sedType: EKV.Koder.sedtyper.A001,
          sedData: {
            fritekst: formValues?.fritekstSed,
            erFjernarbeidTWFA: isCdm44Enabled && erFjernarbeidTWFA ? true : undefined,
          },
        },
      ]
    : [
        {
          dokumentData: {
            produserbardokument: ORIENTERING_ANMODNING_UNNTAK,
            mottaker: BRUKER,
            fritekst: unntaksvilkår.begrunnelseFritekst,
          },
        },
        {
          dokumentData: {
            produserbardokument: ANMODNING_UNNTAK,
            mottaker: UTENLANDSK_TRYGDEMYNDIGHET,
            ytterligereInformasjon: formValues?.fritekstSed,
          },
        },
      ];

  // TODO: Erstattes med en enkel labeltekst når storbritannia toggle fjernes
  const begrunnelseFritekstBrevLabel = (
    <Nav.BodyLong weight="semibold" size="small">
      Begrunnelse til orienteringsbrev til bruker
    </Nav.BodyLong>
  );

  const maksAntallTegn = MKVUtils.erStorbritanniaKonvBestemmelse(lovvalgsbestemmelse) ? 500 - 38 : 500;

  return (
    <div className="vurderingArtikkel16Anmodning">
      <Nav.Heading level="1" className="stegvelgertittel">
        Anmodning om unntak
      </Nav.Heading>
      <div className="artikkel16__innhold">
        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.BodyLong weight="semibold" size="small">
              Det lands lovgivning det søkes unntak fra
            </Nav.BodyLong>
            <Nav.BodyLong size="small">{landSomTekstListe}</Nav.BodyLong>
          </Nav.Column>
        </Nav.Row>

        <Nav.Row>
          <Nav.Column xs="12">
            <Nav.BodyLong weight="semibold" size="small">
              Søknadsperiode
            </Nav.BodyLong>
          </Nav.Column>
          <Nav.Column xs="12" className="soknadsperiode__inhold">
            <EnkeltDato dato={anmodningsperiode.fomDato} />
            &nbsp;-&nbsp;
            <EnkeltDato dato={anmodningsperiode.tomDato} />
            <Nav.BodyLong size="small">
              {datoDiffMenneskelig(anmodningsperiode.fomDato, anmodningsperiode.tomDato)}
            </Nav.BodyLong>
          </Nav.Column>
        </Nav.Row>

        <Nav.Row>
          <Nav.Column xs="7">
            <Nav.Select
              error={lovvalgFeilmelding}
              onChange={handleEndretUnntakFraBestemmelse}
              value={unntakFraBestemmelse || ""}
              readOnly={!redigerbart}
              label={
                <Nav.BodyLong weight="semibold" size="small">
                  Artikkelen det søkes unntak fra
                </Nav.BodyLong>
              }
            >
              <option key={Utils._uuid()} value="" label="Velg..." disabled={!!unntakFraBestemmelse} />
              {hentUnntaksbestemmelser().map((kodeObjekt) => (
                <option key={Utils._uuid()} value={kodeObjekt.kode} label={kodeObjekt.term ?? ""} />
              ))}
            </Nav.Select>
          </Nav.Column>
        </Nav.Row>

        {isCdm44Enabled &&
          redigerbart &&
          unntakFraBestemmelse === MKV.Koder.lovvalgsbestemmelser.lovvalgbestemmelser_883_2004.FO_883_2004_ART13_1A && (
            <Nav.Row>
              <Nav.Column xs="7">
                <Nav.Checkbox checked={erFjernarbeidTWFA} onChange={(e) => setErFjernarbeidTWFA(e.target.checked)}>
                  Rammeavtale om fjernarbeid (TWFA)
                </Nav.Checkbox>
              </Nav.Column>
            </Nav.Row>
          )}

        <Nav.Row>
          <Nav.Column xs="7">
            <Nav.Select
              error={begrunnelseFeilmelding}
              onChange={handleEndretBegrunnelse}
              value={unntaksvilkår.begrunnelseKoder ? unntaksvilkår.begrunnelseKoder[0] : ""}
              readOnly={!redigerbart}
              label={
                <Nav.BodyLong weight="semibold" size="small">
                  Legg til begrunnelse
                </Nav.BodyLong>
              }
            >
              <option
                key={Utils._uuid()}
                value=""
                label="Velg..."
                disabled={!Utils._isEmpty(unntaksvilkår.begrunnelseKoder)}
              />
              {muligeBegrunnelseValg.map((kodeObjekt) => (
                <option key={Utils._uuid()} value={kodeObjekt.kode} label={kodeObjekt.term ?? ""} />
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
                readOnly={!redigerbart}
                onBlur={lagreVilkarHandler}
                onChange={handleEndretBegrunnelseFritekst}
                value={unntaksvilkår.begrunnelseFritekst ?? ""}
                error={fritekstFeilmelding}
                maxLength={1500}
              />
              {redigerbart && (
                <Nav.Textarea
                  id={feltNavnFraBestemmelse}
                  label={
                    <Nav.BodyLong weight="semibold" size="small">
                      Begrunnelse til SED A001
                    </Nav.BodyLong>
                  }
                  placeholder="Skriv begrunnelsen her."
                  onBlur={lagreVilkarHandler}
                  onChange={handleEndretBegrunnelseFritekstEngelsk}
                  value={unntaksvilkår.begrunnelseFritekstEngelsk ?? ""}
                  error={fritekstSEDFeilmelding}
                  maxLength={255}
                />
              )}
            </Nav.Column>
          </Nav.Row>
        )}

        {!Utils._isEmpty(medlemskap?.perioderMed) && (
          <TidligereMedlemskap redigerbart={redigerbart} medlemskap={medlemskap} land={landSomTekstListe} />
        )}

        {redigerbart && (
          <Nav.Row className="fritekstSed">
            <Nav.Column xs="7">
              <Skjema.Textarea
                label={
                  <Nav.BodyLong weight="semibold" size="small">
                    Ytterligere informasjon til SED (valgfri)
                  </Nav.BodyLong>
                }
                feltNavn="fritekstSed"
                readOnly={!redigerbart}
                maxLength={maksAntallTegn}
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
                <Dokumentliste behandlingID={behandlingID} dokumenter={pdfDokumenter} validateOnClick={erStegGyldig} />
              </Nav.Column>
            </Nav.Row>

            <Nav.Row>
              <Nav.Column xs="10">
                <VedleggTable
                  valgteVedlegg={{
                    saksvedlegg: valgteVedlegg.saksvedlegg,
                    standardvedlegg: [],
                  }}
                  label="Vedlegg til SED"
                  setValgteVedlegg={setValgtSaksvedlegg}
                  redigerbart={redigerbart}
                />
                <VedleggVelger
                  valgteVedlegg={valgteVedlegg}
                  onChange={setValgtSaksvedlegg}
                  dokumenter={fysiskeDokumenter}
                  redigerbart={redigerbart}
                  standardvedlegg={tilgjengeligeStandardvedlegg}
                />
              </Nav.Column>
            </Nav.Row>
          </>
        )}

        <Nav.Row>
          <Mui.StegKnapper
            bekreftTekst="Send brevene"
            bekreftKnappProps={{
              loading: pending,
              disabled: !redigerbart || !Utils._isEmpty(kontrollFeil),
              onClick: validerStegOgLagreBehandling,
            }}
            tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
          />
        </Nav.Row>
      </div>
    </div>
  );
}

const VurderingArtikkel16AnmodningForm = reduxForm<FormValuesProps, PropsFromRedux & Props>({
  form: KV.Form.ARTIKKEL_16_ANMODNING,
  enableReinitialize: true,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: (values, props) =>
    lagYupToReduxformErrorMapper(VurderingArtikkel16AnmodningSchema, {
      context: { bestemmelse: props.lovvalgsbestemmelse },
    })(values),
})(VurderingArtikkel16Anmodning);

export default connector(VurderingArtikkel16AnmodningForm);
