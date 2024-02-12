import { useCallback, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import MKV from "../../../../../melosyskodeverk";
import * as Api from "../../../../../services/api";
import * as Forms from "../../../../../felleskomponenter/forms";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Nav from "../../../../../navFrontend";
import * as Utils from "../../../../../utils";
import * as KV from "../../../../../kodeverk";

import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { medlemskapsperioderSelectors } from "../../../../../ducks/medlemskapsperioder";
import { mottatteOpplysningerSelectors } from "../../../../../ducks/mottatteOpplysninger";
import { behandlingsresultatSelectors } from "../../../../../ducks/behandlingsresultat";
import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { landkoderSelectors } from "../../../../../ducks/landkoder";
import { kontrollOperations, kontrollSelectors } from "../../../../../ducks/kontroll";
import { vedtakOperations } from "../../../../../ducks/vedtak";
import { formSelectors } from "../../../../../ducks/form";
import LabelMedHjelpetekst from "../../../../../felleskomponenter/labelMedHjelpetekst";
import Dokumentliste from "../../../../../felleskomponenter/dokumentliste";

import vurdering_vedtak from "./vurderingVedtakSchema";
import "./vurderingVedtak.css";
import { KTObject } from "@navikt/melosys-kodeverk";
import { feiletResponsSelectors } from "../../../../../ducks/feiletRespons";
import { NY_VURDERING_BAKGRUNN_HJELPETEKST } from "../../../../ikkeYrkesaktiv/stegKomponenter/vurderingvedtak/tekster";
import { FRITEKST_VALG } from "../../../../../kodeverk/koder";
import { Table } from "@navikt/ds-react";
import { menypanelOperations, menypanelSelectors } from "../../../../../ducks/menypanel";

const { NY_VURDERING, MANGLENDE_INNBETALING_TRYGDEAVGIFT } = MKV.Koder.behandlinger.behandlingstyper;
const { IKKE_YRKESAKTIV } = MKV.Koder.behandlinger.behandlingstema;
const { OPPHØRT } = MKV.Koder.innvilgelsesResultat;
const { OPPHØRSVEDTAK, FØRSTEGANGSVEDTAK, ENDRINGSVEDTAK } = MKV.Koder.vedtakstyper;
const { INNVILGELSE_FOLKETRYGDLOVEN, VEDTAK_OPPHOERT_MEDLEMSKAP } = MKV.Koder.brev.produserbaredokumenter;
const { MEDLEM_I_FOLKETRYGDEN, DELVIS_OPPHØRT } = MKV.Koder.behandlinger.behandlingsresultattyper;
const { PLIKTIG } = MKV.Koder.medlemskapstyper;

const innledningFritekstHjelpetekst =
  "Teksten du skriver her vil vises etter informasjonen om vedtakets periode og resultat. Eksempel: \n\n" +
  '"Du er medlem i folketrygden fra 1. september 2022 til 31. desember 2024. Medlemskapet omfatter trygdedekning i folketrygdens helse- og pensjonsdel."\n\n' +
  "Friteksten kommer her.";
const begrunnelseFritekstHjelpetekst =
  "Teksten du skriver her vil vises etter standard begrunnelse for bestemmelsen.  Eksempel: \n\n" +
  '"Du har opplyst at du arbeider for Equinor ASA i Brasil. Vi har lagt til grunn at du er ansatt i en virksomhet med hovedsete i Norge."\n\n' +
  "Friteksten kommer her.";
const trygdeavgiftFritekstHjelpetekst =
  "Teksten du skriver her vil vises etter standard informasjon om trygdeavgiften. Eksempel: \n\n" +
  '"Ved kalenderårets slutt vil vi be om endelige inntektsopplysninger. Ut fra disse opplysningene vil vi beregne endelig trygdeavgift for året."\n\n' +
  "Friteksten kommer her.";

const komponentDispatch = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  kontrollerFerdigbehandling: (data: Api.Kontroll.FerdigbehandlingKontrollData) =>
    dispatch(kontrollOperations.kontrollerFerdigbehandling(data)),
  fattVedtak: (behandlingID: number, body: Api.Saksflyt.Vedtak.FattVedtakFTRLReqDto) =>
    dispatch(vedtakOperations.fatt(behandlingID, body)),
});

interface FormValuesProps {
  innledningFritekst?: string;
  begrunnelseFritekst?: string;
  trygdeavgiftFritekst?: string;
}

interface Props {
  tilbake: () => void;
  aktivtSteg: boolean;
}

export const VurderingVedtak = ({ tilbake, aktivtSteg }: Props) => {
  const dispatch = useDispatch();
  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector) as any;
  const medlemskapsperioder = useSelector(medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector);
  const soknadsland = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
  const mottatteOpplysningerFeilmeldinger = useSelector(formSelectors.SoknadErrorsSelector);
  const lagretVedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const alleLandkoder = useSelector(landkoderSelectors.LandkoderSelector);
  const mottatteOpplysningerStatus = useSelector(mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector);
  const behandlingstype = useSelector(behandlingerSelectors.BehandlingstypeKodeSelector);
  const behandlingstema = useSelector(behandlingerSelectors.BehandlingstemaKodeSelector);
  const lagretNyVurderingBakgrunn = useSelector(behandlingsresultatSelectors.NyVurderingBakgrunnSelector);
  const erFullmektigEndret = useSelector(menypanelSelectors.MenypanelErFullmektigEndretSelector);
  const feilmeldinger = useSelector(feiletResponsSelectors.FeilmeldingerSelector);
  const kontrollfeil = useSelector(kontrollSelectors.KontrollFeilSelector);
  const { kontrollerFerdigbehandling, fattVedtak } = komponentDispatch(dispatch);

  const erNyVurdering = behandlingstype === NY_VURDERING;
  const erManglendeInnbetalingTrygdeavgift = behandlingstype === MANGLENDE_INNBETALING_TRYGDEAVGIFT;
  const erDelvisOpphør = medlemskapsperioder.some((periode) => periode.innvilgelsesResultat === OPPHØRT);
  const erIkkeYrkesaktiv = behandlingstema === IKKE_YRKESAKTIV;
  const medlemskapsTypeErPliktig = medlemskapsperioder.some((periode) => periode.medlemskapstype === PLIKTIG);

  const erNyVurderingBakgrunnValgFritekst = (nyVurderingBakgrunnValg?: string): boolean => {
    return !MKV.KTObjects.begrunnelser.nyvurderingbakgrunner?.some((bakgrunn: KTObject) => {
      return bakgrunn.kode === nyVurderingBakgrunnValg;
    });
  };
  const initialNyVurderingBakgrunnValg =
    lagretNyVurderingBakgrunn && erNyVurderingBakgrunnValgFritekst(lagretNyVurderingBakgrunn)
      ? FRITEKST_VALG
      : lagretNyVurderingBakgrunn || undefined;
  const initialNyVurderingBakgrunnFritekst =
    initialNyVurderingBakgrunnValg === FRITEKST_VALG ? lagretNyVurderingBakgrunn : "";

  const {
    watch,
    control,
    formState: { isValid: formIsValid },
    setValue,
  } = useForm({
    resolver: yupResolver(vurdering_vedtak),
    context: {
      erNyVurdering,
      erManglendeInnbetalingTrygdeavgift,
      erDelvisOpphør,
    },
    defaultValues: {
      begrunnelseFritekst: useSelector(behandlingsresultatSelectors.BegrunnelseFritekstSelector) || "",
      innledningFritekst: useSelector(behandlingsresultatSelectors.InnledningFritekstSelector) || "",
      trygdeavgiftFritekst: useSelector(behandlingsresultatSelectors.TrygdeavgiftFritekstSelector) || "",
      nyVurderingBakgrunnValg: initialNyVurderingBakgrunnValg,
      nyVurderingBakgrunnFritekst: initialNyVurderingBakgrunnFritekst,
    } as FieldValues,
  });
  const formValues = watch();

  const [muligeMottakere, setMuligeMottakere] = useState(Api.DokumenterV2.tomHentMuligeMottakereResDto());
  const [trygdeavgiftMottaker, setTrygdeavgiftMottaker] = useState<KTObject | undefined>(undefined);
  const [fakturamottaker, setFakturamottaker] = useState<string | undefined>(undefined);
  const [vedtakPending, setVedtakPending] = useState(false);
  const stegErGyldig = redigerbart && formIsValid && Utils._isEmpty(feilmeldinger) && Utils._isEmpty(kontrollfeil);

  const mottatteOpplysningerErGyldig = () => Utils._isEmpty(mottatteOpplysningerFeilmeldinger);
  let oppdaterFørKontroll = true;

  const oppdaterNyVurderingBakgrunn = (nyVurderingBakgrunn?: string) => {
    Api.Behandlinger.resultat.oppdaterNyVurderingBakgrunn(behandlingID, nyVurderingBakgrunn);
  };
  const debouncedOppdaterNyVurderingBakgrunn = useCallback(Utils._debounce(oppdaterNyVurderingBakgrunn, 500), []);

  const oppdaterNyVurderingBakgrunnValg = (nyVurderingBakgrunnValg: string) => {
    if (!erNyVurdering) {
      return;
    }
    if (nyVurderingBakgrunnValg === FRITEKST_VALG) {
      debouncedOppdaterNyVurderingBakgrunn(undefined);
    } else {
      debouncedOppdaterNyVurderingBakgrunn(nyVurderingBakgrunnValg);
    }
    setValue("nyVurderingBakgrunnFritekst", "");
  };

  useEffect(() => {
    return () => debouncedOppdaterFritekster.cancel();
  }, []);

  const hentMuligeMottakere = async () => {
    const res = await Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
      produserbartdokument: erDelvisOpphør ? VEDTAK_OPPHOERT_MEDLEMSKAP : INNVILGELSE_FOLKETRYGDLOVEN,
      orgnr: null,
    });
    setMuligeMottakere(res);
  };

  useEffect(() => {
    hentMuligeMottakere();
  }, [erDelvisOpphør]);

  useEffect(() => {
    if (aktivtSteg) {
      Api.Trygdeavgift.hentTrygdeavgiftMottaker(behandlingID).then((dto) => {
        setTrygdeavgiftMottaker(dto.trygdeavgiftMottaker);
      });
    }
  }, [aktivtSteg]);

  useEffect(() => {
    if (erFullmektigEndret) {
      hentMuligeMottakere();
    }
    if (aktivtSteg && (erFullmektigEndret || !fakturamottaker)) {
      Api.Trygdeavgift.hentFakturamottaker(behandlingID).then((mottaker) => {
        setFakturamottaker(mottaker.navn);
      });

      if (erFullmektigEndret) {
        dispatch(menypanelOperations.setErFullmektigEndret(false));
      }
    }
  }, [aktivtSteg, erFullmektigEndret]);

  const oppdaterFritekster = (values: FormValuesProps) => {
    if (values && redigerbart && !vedtakPending) {
      Api.Behandlinger.resultat.oppdaterFritekster(behandlingID, {
        innledningFritekst: values.innledningFritekst,
        begrunnelseFritekst: values.begrunnelseFritekst,
        trygdeavgiftFritekst: values.trygdeavgiftFritekst,
      });
    }
  };
  const debouncedOppdaterFritekster = useCallback(Utils._debounce(oppdaterFritekster, 1000), []);

  useEffect(() => {
    debouncedOppdaterFritekster(formValues);
  }, [formValues?.innledningFritekst, formValues?.begrunnelseFritekst, formValues?.trygdeavgiftFritekst]);

  const getOpphørsdato = () =>
    [...medlemskapsperioder]
      .sort(Utils.dato.sorterEtterISOFomDato)
      .find((periode) => periode.innvilgelsesResultat === OPPHØRT)?.fomDato;

  const getVedtakstype = () => {
    if (lagretVedtakstype) return lagretVedtakstype;
    if (erManglendeInnbetalingTrygdeavgift) return erDelvisOpphør ? OPPHØRSVEDTAK : ENDRINGSVEDTAK;
    if (erNyVurdering) return ENDRINGSVEDTAK;
    return FØRSTEGANGSVEDTAK;
  };

  const lagFattVedtakFTRLReqDto = (): Api.Saksflyt.Vedtak.FattVedtakFTRLReqDto => {
    return {
      behandlingsresultatTypeKode: erDelvisOpphør ? DELVIS_OPPHØRT : MEDLEM_I_FOLKETRYGDEN,
      innledningFritekst: formValues?.innledningFritekst || null,
      begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
      trygdeavgiftFritekst: formValues?.trygdeavgiftFritekst || null,
      vedtakstype: getVedtakstype(),
      kopiMottakere: muligeMottakere.kopiMottakere.map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker),
      nyVurderingBakgrunn:
        formValues?.nyVurderingBakgrunnValg === FRITEKST_VALG
          ? formValues?.nyVurderingBakgrunnFritekst
          : formValues?.nyVurderingBakgrunnValg,
      opphoerDato: erDelvisOpphør ? getOpphørsdato() : null,
    };
  };

  async function kontroller(data: any) {
    if (data.aktivtSteg && redigerbart && data.mottatteOpplysningerStatus === "OK") {
      setVedtakPending(true);
      const request = {
        behandlingID,
        vedtakstype: getVedtakstype(),
        behandlingsresultattype: erDelvisOpphør ? DELVIS_OPPHØRT : MEDLEM_I_FOLKETRYGDEN,
        skalRegisteropplysningerOppdateres: oppdaterFørKontroll,
      };
      oppdaterFørKontroll = false;
      await kontrollerFerdigbehandling(request);
      setVedtakPending(false);
    }
  }
  const debouncedKontrollerBehandling = useCallback(Utils._debounce(kontroller, 500), [kontrollerFerdigbehandling]);

  useEffect(() => {
    debouncedKontrollerBehandling({ aktivtSteg, mottatteOpplysningerStatus, formValues });
  }, [aktivtSteg, redigerbart, mottatteOpplysningerStatus]);

  const onSubmit = async () => {
    setVedtakPending(true);
    if (mottatteOpplysningerErGyldig()) {
      fattVedtak(behandlingID, lagFattVedtakFTRLReqDto()).then((res) => {
        if (res.data?.data?.error) {
          setVedtakPending(false);
        }
      });
    } else {
      setVedtakPending(false);
    }
  };

  if (!aktivtSteg) return null;

  const mapPeriodeRader = (perioder: Api.MedlemAvFolketrygden.Medlemskapsperioder.Medlemskapsperiode[]) =>
    [...perioder].sort(Utils.dato.sorterEtterISOFomDato).map((it) => {
      return {
        periode: `${Utils.dato.formatterDatoTilNorsk(it.fomDato)} - ${Utils.dato.formatterDatoTilNorsk(it.tomDato)}`,
        bestemmelse: KV.finnTermFraListe(MKV.KTObjects.folketrygdloven_kap2_bestemmelser, it.bestemmelse),
        dekning: KV.finnTermFraListe(MKV.KTObjects.trygdedekninger, it.trygdedekning),
        resultat: KV.finnTermFraListe(MKV.KTObjects.innvilgelsesResultat, it.innvilgelsesResultat),
      };
    });

  const mapMottakerRad = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return {
      dokumentData: {
        produserbardokument: erDelvisOpphør ? VEDTAK_OPPHOERT_MEDLEMSKAP : INNVILGELSE_FOLKETRYGDLOVEN,
        mottaker: muligMottaker.rolle,
        innledningFritekst: formValues?.innledningFritekst || null,
        begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
        trygdeavgiftFritekst: formValues?.trygdeavgiftFritekst || null,
        nyVurderingBakgrunn:
          formValues?.nyVurderingBakgrunnValg === FRITEKST_VALG
            ? formValues?.nyVurderingBakgrunnFritekst
            : formValues?.nyVurderingBakgrunnValg,
        orgNr: muligMottaker?.orgnr || null,
        opphoerDato: erDelvisOpphør ? getOpphørsdato() : null,
      },
      mottakerNavn: muligMottaker.mottakerNavn,
    };
  };

  const mapMottakerRader = (mottakere: Api.DokumenterV2.HentMuligeMottakereResDto) => {
    return [
      mapMottakerRad(mottakere.hovedMottaker),
      ...mottakere.kopiMottakere.map((muligMottaker) => mapMottakerRad(muligMottaker)),
      ...mottakere.fasteMottakere.map((muligMottaker) => mapMottakerRad(muligMottaker)),
    ];
  };

  return (
    <div className="vurderingVedtak">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">
        {medlemskapsTypeErPliktig
          ? "Pliktig medlemskap etter folketrygdloven"
          : "Frivillig medlemskap etter folketrygdloven"}
      </Nav.Typo.Innholdstittel>

      <Table size="small" className="melosys__table">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
            <Table.HeaderCell scope="col">Bestemmelse</Table.HeaderCell>
            <Table.HeaderCell scope="col">Dekning</Table.HeaderCell>
            <Table.HeaderCell scope="col">Resultat</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {mapPeriodeRader(medlemskapsperioder).map((medlemskapsperiode) => {
            return (
              <Table.Row key={Utils._uuid()}>
                <Table.DataCell>{medlemskapsperiode.periode}</Table.DataCell>
                <Table.DataCell>{medlemskapsperiode.bestemmelse}</Table.DataCell>
                <Table.DataCell>{medlemskapsperiode.dekning}</Table.DataCell>
                <Table.DataCell>{medlemskapsperiode.resultat}</Table.DataCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>

      <Nav.Row className="arbeidsland">
        <Nav.Column xs="5">
          <Nav.Typo.Element className="info">Arbeidsland</Nav.Typo.Element>
          <Nav.Typo.Normaltekst className="info">
            {alleLandkoder ? KV.finnTermFraListe(alleLandkoder, soknadsland[0]) : "Finner ikke arbeidsland"}
          </Nav.Typo.Normaltekst>
        </Nav.Column>
      </Nav.Row>

      {trygdeavgiftMottaker ? (
        <Nav.Row className="trygdeavgift">
          <Nav.Column xs="12">
            <Nav.Typo.Normaltekst className="info">{trygdeavgiftMottaker.term}</Nav.Typo.Normaltekst>
          </Nav.Column>
        </Nav.Row>
      ) : null}

      {fakturamottaker ? (
        <Nav.Row>
          <Nav.Column xs="12" className="fakturamottaker">
            <Nav.Typo.Normaltekst className="info">Faktura sendes til:</Nav.Typo.Normaltekst>
            &nbsp;
            <Nav.Typo.Normaltekst className="bold">{fakturamottaker}</Nav.Typo.Normaltekst>
          </Nav.Column>
        </Nav.Row>
      ) : null}

      {(erNyVurdering || (erManglendeInnbetalingTrygdeavgift && !erDelvisOpphør)) && (
        <div className="nyVurderingBakgrunn">
          <Nav.Row>
            <Nav.Column xs="6">
              <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
                <LabelMedHjelpetekst
                  label="Oppgi grunn for nytt vedtak (Obligatorisk)"
                  hjelpetekst={NY_VURDERING_BAKGRUNN_HJELPETEKST}
                  hjelpetekstClassName="nyVurderingBakgrunn__hjelpetekst"
                />
              </Nav.Typo.Element>
              <Forms.Select
                name="nyVurderingBakgrunnValg"
                disabled={!redigerbart}
                emptyFieldDisabled={!!formValues?.nyVurderingBakgrunnValg}
                control={control}
                onChange={oppdaterNyVurderingBakgrunnValg}
                className="nyVurderingBakgrunn_select"
              >
                {MKV.KTObjects.begrunnelser.nyvurderingbakgrunner?.map((bakgrunn: KTObject) => (
                  <option key={bakgrunn.kode} value={bakgrunn.kode} label={bakgrunn.term || ""} />
                ))}
                <option key={FRITEKST_VALG} value={FRITEKST_VALG} label={FRITEKST_VALG} />
              </Forms.Select>
            </Nav.Column>
          </Nav.Row>
          {formValues.nyVurderingBakgrunnValg === FRITEKST_VALG && (
            <Nav.Row className="nyVurderingBakgrunnFritekstRad">
              <Forms.HtmlEditor
                name="nyVurderingBakgrunnFritekst"
                control={control}
                onChange={debouncedOppdaterNyVurderingBakgrunn}
                className="nyVurderingBakgrunn--fritekst_editor"
                disabled={!redigerbart}
              />
            </Nav.Row>
          )}
        </div>
      )}
      {!erDelvisOpphør && (
        <>
          <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
            <LabelMedHjelpetekst
              label="Fritekst til innledning"
              hjelpetekst={innledningFritekstHjelpetekst}
              hjelpetekstClassName="hjelpetekst"
            />
          </Nav.Typo.Element>
          <Forms.HtmlEditor
            name="innledningFritekst"
            control={control}
            className="fritekst_editor"
            disabled={!redigerbart}
          />
        </>
      )}

      <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
        <LabelMedHjelpetekst
          label="Fritekst til begrunnelse"
          hjelpetekst={begrunnelseFritekstHjelpetekst}
          hjelpetekstClassName="hjelpetekst"
        />
      </Nav.Typo.Element>
      <Forms.HtmlEditor
        name="begrunnelseFritekst"
        control={control}
        className="fritekst_editor"
        disabled={!redigerbart}
      />

      {!erIkkeYrkesaktiv && !erDelvisOpphør && (
        <>
          <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
            <LabelMedHjelpetekst
              label="Fritekst til avsnitt om trygdeavgift"
              hjelpetekst={trygdeavgiftFritekstHjelpetekst}
              hjelpetekstClassName="hjelpetekst"
            />
          </Nav.Typo.Element>
          <Forms.HtmlEditor
            name="trygdeavgiftFritekst"
            control={control}
            className="fritekst_editor"
            disabled={!redigerbart}
          />
        </>
      )}

      {stegErGyldig && muligeMottakere && (
        <Dokumentliste behandlingID={behandlingID} dokumenter={mapMottakerRader(muligeMottakere)} />
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: onSubmit,
          disabled: !stegErGyldig || !formIsValid,
          autoDisableVedSpinner: true,
          spinner: vedtakPending,
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};
