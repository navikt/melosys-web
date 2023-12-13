import { useCallback, useEffect, useState } from "react";
import { RootState } from "AppTypes";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import MKV from "../../../../melosyskodeverk";
import * as Api from "../../../../services/api";
import * as Forms from "../../../../felleskomponenter/forms";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";
import * as KV from "../../../../kodeverk";

import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { medlemskapsperioderSelectors } from "../../../../ducks/medlemskapsperioder";
import { folketrygdenkodeverkSelectors } from "../../../../ducks/folketrygdenkodeverk";
import { mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { redigerbartSelectors } from "../../../../ducks/redigerbart";
import { landkoderSelectors } from "../../../../ducks/landkoder";
import { kontrollOperations, kontrollSelectors } from "../../../../ducks/kontroll";
import { vedtakOperations } from "../../../../ducks/vedtak";
import { formSelectors } from "../../../../ducks/form";
import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";

import vurdering_vedtak from "./vurderingVedtakSchema";
import "./vurderingVedtak.css";
import { KTObject } from "@navikt/melosys-kodeverk";
import { feiletResponsSelectors } from "../../../../ducks/feiletRespons";
import { NY_VURDERING_BAKGRUNN_HJELPETEKST } from "../../../ikkeYrkesaktiv/stegKomponenter/vurderingVedtak/tekster";
import { FRITEKST_VALG } from "../../../../kodeverk/koder";
import { Table } from "@navikt/ds-react";
import { menypanelOperations, menypanelSelectors } from "../../../../ducks/menypanel";
import Dokumentliste from "../../../../felleskomponenter/dokumentliste";

const { INNVILGELSE_FOLKETRYGDLOVEN } = MKV.Koder.brev.produserbaredokumenter;

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

// TODO: Erstattes med tabell fra Aksel i MELOSYS-6082 (Ideelt sett 1 standardkomponent på tvers av melosys)
export const VurderingVedtak = ({ tilbake, aktivtSteg }: Props) => {
  const erNyVurderingBakgrunnValgFritekst = (nyVurderingBakgrunnValg?: string): boolean => {
    return !MKV.KTObjects.begrunnelser.nyvurderingbakgrunner?.some((bakgrunn: KTObject) => {
      return bakgrunn.kode === nyVurderingBakgrunnValg;
    });
  };

  const behandlingID = useSelector(behandlingerSelectors.BehandlingIDSelector);
  const medlemskapsperioder = useSelector(medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector);
  const innvilgelsesResultater = useSelector(folketrygdenkodeverkSelectors.InnvilgelsesResultatSelector);
  const soknadsland = useSelector(mottatteOpplysningerSelectors.SoknadslandkoderSelector);
  const mottatteOpplysningerFeilmeldinger = useSelector(formSelectors.SoknadErrorsSelector);
  const vedtakstype = useSelector(behandlingsresultatSelectors.VedtakstypeSelector);
  const redigerbart = useSelector(redigerbartSelectors.RedigerbartSelector);
  const alleLandkoder = useSelector(landkoderSelectors.LandkoderSelector);
  const mottatteOpplysningerStatus = useSelector(mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector);
  const behandlingstype = useSelector(behandlingerSelectors.BehandlingstypeKodeSelector);
  const lagretNyVurderingBakgrunn = useSelector(behandlingsresultatSelectors.NyVurderingBakgrunnSelector);
  const erFullmektigEndret = useSelector(menypanelSelectors.MenypanelErFullmektigEndretSelector);

  const erNyVurdering = behandlingstype === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
  const initialNyVurderingBakgrunnValg =
    lagretNyVurderingBakgrunn && erNyVurderingBakgrunnValgFritekst(lagretNyVurderingBakgrunn)
      ? FRITEKST_VALG
      : lagretNyVurderingBakgrunn || undefined;
  const initialNyVurderingBakgrunnFritekst =
    initialNyVurderingBakgrunnValg === FRITEKST_VALG ? lagretNyVurderingBakgrunn : "";
  const feilmeldinger = useSelector(feiletResponsSelectors.FeilmeldingerSelector);
  const kontrollfeil = useSelector(kontrollSelectors.KontrollfeilSelector);
  const dispatch = useDispatch();
  const { kontrollerFerdigbehandling, fattVedtak } = komponentDispatch(dispatch);

  const {
    watch,
    control,
    formState: { isValid: formIsValid },
    setValue,
  } = useForm({
    resolver: yupResolver(vurdering_vedtak),
    context: {
      erNyVurdering,
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
  const [oppdaterFørKontroll, setOppdaterFørKontroll] = useState(true);
  const [vedtakPending, setVedtakPending] = useState(false);
  const stegErGyldig = redigerbart && formIsValid && Utils._isEmpty(feilmeldinger) && Utils._isEmpty(kontrollfeil);

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

  const mottatteOpplysningerErGyldig = () => Utils._isEmpty(mottatteOpplysningerFeilmeldinger);

  const hentMuligeMottakere = async () => {
    const res = await Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
      produserbartdokument: INNVILGELSE_FOLKETRYGDLOVEN,
      orgnr: null,
    });
    setMuligeMottakere(res);
  };

  useEffect(() => {
    hentMuligeMottakere();
    return () => debouncedOppdaterFritekster.cancel();
  }, []);

  useEffect(() => {
    if (aktivtSteg) {
      Api.Trygdeavgift.hentTrygdeavgiftMottaker(behandlingID).then((dto) => {
        setTrygdeavgiftMottaker(dto.trygdeavgiftMottaker);
      });
    }
  }, [aktivtSteg]);

  useEffect(() => {
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

  function mapPeriodeRader(perioder: Api.MedlemAvFolketrygden.Medlemskapsperioder.Medlemskapsperiode[] | undefined) {
    const sortertePerioder = perioder ? [...perioder].sort(Utils.dato.sorterEtterISOFomDato) : [];
    return sortertePerioder.map((medlemskapsperiode) => {
      return {
        periode: `${Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.fomDato)} - ${Utils.dato.formatterDatoTilNorsk(
          medlemskapsperiode.tomDato
        )}`,
        dekning: KV.finnTermFraListe(MKV.KTObjects.trygdedekninger, medlemskapsperiode.trygdedekning),
        resultat: KV.finnTermFraListe(innvilgelsesResultater, medlemskapsperiode.innvilgelsesResultat),
      };
    });
  }

  const mapMottakerRad = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return {
      dokumentData: {
        produserbardokument: INNVILGELSE_FOLKETRYGDLOVEN,
        mottaker: muligMottaker.rolle,
        innledningFritekst: formValues?.innledningFritekst || null,
        begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
        trygdeavgiftFritekst: formValues?.trygdeavgiftFritekst || null,
        nyVurderingBakgrunn:
          formValues?.nyVurderingBakgrunnValg === FRITEKST_VALG
            ? formValues?.nyVurderingBakgrunnFritekst
            : formValues?.nyVurderingBakgrunnValg,
        orgNr: muligMottaker?.orgnr || null,
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

  const lagFattVedtakFTRLReqDto = () => {
    return {
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.MEDLEM_I_FOLKETRYGDEN,
      innledningFritekst: formValues?.innledningFritekst || null,
      begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
      trygdeavgiftFritekst: formValues?.trygdeavgiftFritekst || null,
      vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      kopiMottakere: muligeMottakere.kopiMottakere.map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker),
      nyVurderingBakgrunn:
        formValues?.nyVurderingBakgrunnValg === FRITEKST_VALG
          ? formValues?.nyVurderingBakgrunnFritekst
          : formValues?.nyVurderingBakgrunnValg,
    };
  };

  async function kontroller(data: any) {
    if (data.aktivtSteg && redigerbart && data.mottatteOpplysningerStatus === "OK") {
      setVedtakPending(true);
      const request = {
        behandlingID,
        vedtakstype: data.formValues.vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
        behandlingsresultattype: MKV.Koder.behandlinger.behandlingsresultattyper.MEDLEM_I_FOLKETRYGDEN,
        skalRegisteropplysningerOppdateres: oppdaterFørKontroll,
      };
      setOppdaterFørKontroll(false);
      await kontrollerFerdigbehandling(request);
      setVedtakPending(false);
    }
  }
  const debouncedKontrollerBehandling = useCallback(Utils._debounce(kontroller, 250), [kontrollerFerdigbehandling]);

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

  if (!aktivtSteg) return null;

  return (
    <div className="vurderingVedtak">
      <Nav.Typo.Innholdstittel className="stegvelgertittel">Frivillig medlemskap etter § 2-8</Nav.Typo.Innholdstittel>

      <Table size="small" className="melosys__table">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
            <Table.HeaderCell scope="col">Dekning</Table.HeaderCell>
            <Table.HeaderCell scope="col">Resultat</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {mapPeriodeRader(medlemskapsperioder).map((medlemskapsperiode) => {
            return (
              <Table.Row key={Utils._uuid()}>
                <Table.DataCell>{medlemskapsperiode.periode}</Table.DataCell>
                <Table.DataCell>{medlemskapsperiode.dekning}</Table.DataCell>
                <Table.DataCell>{medlemskapsperiode.resultat}</Table.DataCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>

      <Nav.Row className="margin_bottom">
        <Nav.Column xs="5">
          <Nav.Typo.Element className="info">Arbeidsland</Nav.Typo.Element>
          <Nav.Typo.Normaltekst className="info">
            {alleLandkoder ? KV.finnTermFraListe(alleLandkoder, soknadsland[0]) : "Finner ikke arbeidsland"}
          </Nav.Typo.Normaltekst>
        </Nav.Column>
      </Nav.Row>

      {trygdeavgiftMottaker ? (
        <Nav.Row className="trygdeavgift__row">
          <Nav.Column xs="12">
            <Nav.Typo.Normaltekst className="info">{trygdeavgiftMottaker.term}</Nav.Typo.Normaltekst>
          </Nav.Column>
        </Nav.Row>
      ) : null}

      {fakturamottaker ? (
        <Nav.Row className="margin_bottom">
          <Nav.Column xs="12" className="fakturamottaker">
            <Nav.Typo.Normaltekst className="info">Faktura sendes til:</Nav.Typo.Normaltekst>
            &nbsp;
            <Nav.Typo.Normaltekst className="bold">{fakturamottaker}</Nav.Typo.Normaltekst>
          </Nav.Column>
        </Nav.Row>
      ) : null}

      {erNyVurdering && (
        <div className="nyVurderingBakgrunn--container">
          <Nav.Fieldset
            className="nyVurderingBakgrunn"
            legend={
              <LabelMedHjelpetekst
                label="Oppgi grunn for nytt vedtak (Obligatorisk)"
                hjelpetekst={NY_VURDERING_BAKGRUNN_HJELPETEKST}
                hjelpetekstClassName="nyVurderingBakgrunn__hjelpetekst"
              />
            }
          >
            <Nav.Row>
              <Nav.Column xs="6">
                <Forms.Select
                  name="nyVurderingBakgrunnValg"
                  disabled={!redigerbart}
                  emptyFieldDisabled={!!formValues?.nyVurderingBakgrunnValg}
                  control={control}
                  onChange={oppdaterNyVurderingBakgrunnValg}
                >
                  {MKV.KTObjects.begrunnelser.nyvurderingbakgrunner?.map((bakgrunn: KTObject) => (
                    <option key={bakgrunn.kode} value={bakgrunn.kode} label={bakgrunn.term || ""} />
                  ))}
                  <option key={FRITEKST_VALG} value={FRITEKST_VALG} label={FRITEKST_VALG} />
                </Forms.Select>
              </Nav.Column>
            </Nav.Row>
          </Nav.Fieldset>
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
