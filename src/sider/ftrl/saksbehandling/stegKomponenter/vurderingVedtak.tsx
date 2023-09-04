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
import * as Ikoner from "../../../../resources/images";

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
import PdfLenkeListe from "../../../../felleskomponenter/pdfLenkeListe";

import vurdering_vedtak from "./vurderingVedtakSchema";
import "./vurderingVedtak.css";
import { KTObject } from "@navikt/melosys-kodeverk";
import { feiletResponsSelectors } from "../../../../ducks/feiletRespons";
import useHentPersonopplysninger from "../../../../felleskomponenter/informasjonlinje/useHentpersonopplysninger";

const { INNVILGELSE_FOLKETRYGDLOVEN } = MKV.Koder.brev.produserbaredokumenter;

const komponentState = (state: RootState) => ({
  behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
  medlemskapsperioder: medlemskapsperioderSelectors.AlleMedlemskapsperioderSelector(state),
  innvilgelsesResultater: folketrygdenkodeverkSelectors.InnvilgelsesResultatSelector(state),
  soknadsland: mottatteOpplysningerSelectors.SoknadslandkoderSelector(state),
  mottatteOpplysningerFeilmeldinger: formSelectors.SoknadErrorsSelector(state),
  vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
  initialValues: {
    begrunnelseFritekst: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state) || "",
    innledningFritekst: behandlingsresultatSelectors.InnledningFritekstSelector(state) || "",
    trygdeavgiftFritekst: behandlingsresultatSelectors.TrygdeavgiftFritekstSelector(state) || "",
  },
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  alleLandkoder: landkoderSelectors.LandkoderSelector(state),
  mottatteOpplysningerStatus: mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector(state),
});

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
  const dispatch = useDispatch();
  const feilmeldinger = useSelector(feiletResponsSelectors.FeilmeldingerSelector);
  const kontrollfeil = useSelector(kontrollSelectors.KontrollfeilSelector);
  const { kontrollerFerdigbehandling, fattVedtak } = komponentDispatch(dispatch);

  const {
    behandlingID,
    medlemskapsperioder,
    innvilgelsesResultater,
    soknadsland,
    mottatteOpplysningerFeilmeldinger,
    vedtakstype,
    initialValues,
    alleLandkoder,
    redigerbart,
    mottatteOpplysningerStatus,
  } = useSelector(komponentState);

  const personopplysninger = useHentPersonopplysninger(behandlingID, false);

  const {
    watch,
    control,
    formState: { isValid: formIsValid },
  } = useForm({
    resolver: yupResolver(vurdering_vedtak),
    defaultValues: {
      ...initialValues,
    } as FieldValues,
  });
  const formValues = watch();

  const [muligeMottakere, setMuligeMottakere] = useState(Api.DokumenterV2.tomHentMuligeMottakereResDto());
  const [trygdeavgiftMottaker, setTrygdeavgiftMottaker] = useState<KTObject | undefined>(undefined);
  const [oppdaterFoerKontroll, setOppdaterFoerKontroll] = useState(true);
  const [vedtakPending, setVedtakPending] = useState(false);
  const stegErGyldig = redigerbart && formIsValid && Utils._isEmpty(feilmeldinger) && Utils._isEmpty(kontrollfeil);

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
  }, []);

  useEffect(() => {
    if (aktivtSteg) {
      Api.Trygdeavgift.hentTrygdeavgiftMottaker(behandlingID).then((dto) => {
        setTrygdeavgiftMottaker(dto.trygdeavgiftMottaker);
      });
    }
  }, [aktivtSteg]);

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
    return debouncedOppdaterFritekster.cancel();
  }, [formValues?.innledningFritekst, formValues?.begrunnelseFritekst, formValues?.trygdeavgiftFritekst]);

  function mapPeriodeRader(perioder: Api.Medlemskapsperioder.Medlemskapsperiode[] | undefined) {
    const sortertePerioder = perioder
      ? [...perioder].sort((p1, p2) => Date.parse(p1.fomDato) - Date.parse(p2.fomDato))
      : [];
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

  const lagDokumenterData = (muligMottaker: Api.DokumenterV2.MuligMottaker, ikon?: boolean) => {
    return [
      {
        navn: ikon ? (
          <>
            <Ikoner.Forhandsvis />
            <span className="sr-only">Forhåndsvis dokument {muligMottaker.dokumentNavn}</span>
          </>
        ) : (
          muligMottaker.dokumentNavn
        ),
        data: {
          produserbardokument: INNVILGELSE_FOLKETRYGDLOVEN,
          mottaker: muligMottaker.rolle,
          innledningFritekst: formValues?.innledningFritekst || null,
          begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
          trygdeavgiftFritekst: formValues?.trygdeavgiftFritekst || null,
          orgNr: muligMottaker?.orgnr || null,
        },
      },
    ];
  };

  const mapMottakerRad = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return {
      dokument: (
        <PdfLenkeListe
          behandlingID={behandlingID}
          dokumenter={lagDokumenterData(muligMottaker)}
          vedKlikk={() => true}
          className="forhåndsvisning"
        />
      ),
      navn: muligMottaker.mottakerNavn,
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
      nyVurderingBakgrunn: null,
    };
  };

  const lagKontrollerFerdigbehandlingDto = () => {
    return {
      behandlingID,
      vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      behandlingsresultattype: MKV.Koder.behandlinger.behandlingsresultattyper.MEDLEM_I_FOLKETRYGDEN,
      skalRegisteropplysningerOppdateres: oppdaterFoerKontroll,
    };
  };

  useEffect(() => {
    async function kontroller() {
      if (aktivtSteg && redigerbart && mottatteOpplysningerStatus === "OK") {
        setVedtakPending(true);
        await kontrollerFerdigbehandling(lagKontrollerFerdigbehandlingDto());
        setOppdaterFoerKontroll(false);
        setVedtakPending(false);
      }
    }

    kontroller();
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

      <div className="melosys__table-wrapper">
        <table className="melosys__table">
          <tbody>
            <tr className="header">
              <th>Periode</th>
              <th>Dekning</th>
              <th>Resultat</th>
            </tr>
            {mapPeriodeRader(medlemskapsperioder).map((periode) => {
              return (
                <tr key={Utils._uuid()}>
                  <td>{periode.periode}</td>
                  <td>{periode.dekning}</td>
                  <td>{periode.resultat}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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

      {personopplysninger ? (
        <Nav.Row className="margin_bottom">
          <Nav.Column xs="12" className="fakturamottaker">
            <Nav.Typo.Normaltekst className="info">Faktura sendes til:</Nav.Typo.Normaltekst>
            &nbsp;
            <Nav.Typo.Normaltekst className="bold">{personopplysninger.navn}</Nav.Typo.Normaltekst>
          </Nav.Column>
        </Nav.Row>
      ) : null}

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
        <div className="melosys__table-wrapper">
          <table className="melosys__table">
            <tbody>
              <tr className="header">
                <th>Dokument</th>
                <th>Mottaker</th>
              </tr>
              {mapMottakerRader(muligeMottakere).map((mottaker) => {
                return (
                  <tr key={Utils._uuid()}>
                    <td>{mottaker.dokument}</td>
                    <td>{mottaker.navn}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
