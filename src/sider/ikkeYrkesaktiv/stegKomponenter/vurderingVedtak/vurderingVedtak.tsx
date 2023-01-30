import React, { useCallback, useEffect, useState } from "react";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { RootState } from "AppTypes";
import { connect, ConnectedProps, useDispatch } from "react-redux";
import { getFormValues, reduxForm } from "redux-form";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../../melosyskodeverk";
import * as Api from "../../../../services/api";
import * as Hooks from "../../../../hooks";
import * as Mui from "../../../../felleskomponenter/ui";
import * as Nav from "../../../../navFrontend";
import * as Utils from "../../../../utils";
import * as KV from "../../../../kodeverk";
import * as Skjema from "../../../../felleskomponenter/skjema";

import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../../../ducks/mottatteOpplysninger";
import { behandlingsresultatSelectors } from "../../../../ducks/behandlingsresultat";
import { lovvalgsperioderOperations } from "../../../../ducks/lovvalgsperioder";
import { behandlingerSelectors } from "../../../../ducks/behandlinger";
import { formSelectors } from "../../../../ducks/form";

import LabelMedHjelpetekst from "../../../../felleskomponenter/labelMedHjelpetekst";
import MottakerTabell from "../../../../felleskomponenter/tabell/mottakerTabell";
import PdfLenkeListe from "../../../../felleskomponenter/pdfLenkeListe";
import { StegStatus } from "../../stegvelger";
import bem from "../../../../bemUtils";

import { lagYupToReduxformErrorMapper } from "../../../../yup";
import vurdering_vedtak from "./vurderingVedtakSchema";
import "./vurderingVedtak.css";
import { kontrollerFerdigbehandling } from "../../../../ducks/kontroll/operations";
import { feiletResponsSelectors } from "../../../../ducks/feiletRespons";

export const FRITEKST = "Fritekst";

const vurderingVedtakCls = bem("vurderingVedtak");

interface Periode {
  fom?: string | null;
  tom?: string | null;
}

const mapStateToProps = (state: RootState) => {
  const erNyVurdering =
    behandlingerSelectors.BehandlingstypeKodeSelector(state) === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;

  return {
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
    mottatteOpplysningerStatus: mottatteOpplysningerSelectors.MottatteOpplysningerStatusSelector(state),
    soknadsland: mottatteOpplysningerSelectors.SoknadslandKTSelector(state),
    vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
    familieFormValues: formSelectors.TrygdeavtaleFamileFormSelector(state).values,
    formValues: getFormValues(KV.Form.Trygdeavtale.VEDTAK)(state),
    formIsValid: formSelectors.TrygdeavtaleVedtakFormValidSelector(state),
    periodeIsValid: formSelectors.TrygdeavtaleVedtakFormPeriodeValidSelector(state),
    erNyVurdering,
    feilmeldinger: feiletResponsSelectors.FeilmeldingerSelector(state),
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterPeriode: (periode: Periode) => dispatch(mottatteOpplysningerOperations.oppdaterPeriode(periode)),
  hentLovvalgsperiode: (behandlingID: string) => dispatch(lovvalgsperioderOperations.hent(behandlingID)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  data: Api.IkkeYrkesaktiv.StegData;
  oppdaterFlyt: (resultat: Api.IkkeYrkesaktiv.Resultat, callback?: () => void) => void;
  tilbake: () => void;
  lagreOgFatteVedtak: (data: Api.Saksflyt.Vedtak.FattVedtakTrygdeavtaleReqDto) => void;
  redigerbart: boolean;
  resultat: Api.IkkeYrkesaktiv.Resultat;
  steg: Api.IkkeYrkesaktiv.EnkeltSteg;
  formValues: {
    lovvalgsperiodeFom?: string;
    innledningFritekst?: string;
    begrunnelseFritekst?: string;
    kopiTilArbeidsgiver?: boolean;
    nyVurderingBakgrunn?: string;
    nyVurderingBakgrunnFritekst?: string;
  };
  aktivtSteg: boolean;
}

const VurderingVedtak = ({
  behandlingID,
  mottatteOpplysningerStatus,
  erNyVurdering,
  tilbake,
  redigerbart,
  resultat,
  steg,
  familieFormValues,
  formValues,
  oppdaterFlyt,
  lagreOgFatteVedtak,
  vedtakstype,
  formIsValid,
  feilmeldinger,
  aktivtSteg,
}: Props & PropsFromRedux) => {
  const innledningFritekst =
    "Teksten du skriver her vil vises etter informasjonen om vedtakets periode og resultat.\n\n " +
    "Eksempel:\n " +
    '"Du er omfattet av norsk trygdelovgivning og medlem i folketrygden fra 1. september 2022 til 31. desember 2024."\n\n ' +
    "Friteksten kommer her";
  const begrunnelseFritekstHjelpetekst =
    "Teksten du skriver her vil vises etter standard begrunnelse for bestemmelsen.\n\n " +
    "Eksempel:\n " +
    '"Vi har lagt til grunn at du er ansatt av og lønnet av en norsk arbeidsgiver, og sendt ut for å jobbe i Storbritannia i inntil tre år."\n\n ' +
    "Friteksten kommer her";
  const nyVurderingBakgrunnHjelpetekst =
    "Velg en innledningstekst til vedtaket. Teksten kommer først i vedtaket og skal forklare hvorfor vi har gjort nytt vedtak. Hvis ingen av standardtekstene passer, velger du fritekst og skriver egen innledning til vedtaket.";
  const [muligeMottakere, setMuligeMottakere] = useState(Api.DokumenterV2.tomHentMuligeMottakereResDto());
  const [vedtakPending, setVedtakPending] = useState(false);
  const [oppdaterFoerKontroll, setOppdaterFoerKontroll] = useState(true);
  const isMounted = Hooks.useIsMounted();
  const dispatch = useDispatch();

  const getNyVurderingBakgrunn = () =>
    formValues?.nyVurderingBakgrunn === FRITEKST
      ? formValues?.nyVurderingBakgrunnFritekst
      : formValues?.nyVurderingBakgrunn;

  const filterKopiMottakere = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    if ([KV.Koder.MottakerRolle.ARBEIDSGIVER, KV.Koder.MottakerRolle.REPRESENTANT].includes(muligMottaker?.rolle)) {
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

  const lagFattVedtakTrygdeavtaleReqDto = (): Api.Saksflyt.Vedtak.FattVedtakTrygdeavtaleReqDto => ({
    behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
    innledningFritekst: formValues?.innledningFritekst || null,
    begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
    ektefelleFritekst: familieFormValues?.ektefelle?.fritekst || null,
    barnFritekst: familieFormValues?.barn?.fritekst || null,
    vedtakstype: erNyVurdering
      ? MKV.Koder.vedtakstyper.ENDRINGSVEDTAK
      : vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
    kopiMottakere: getKopiMottakere(),
    nyVurderingBakgrunn: getNyVurderingBakgrunn(),
  });

  useEffect(() => {
    async function kontroller() {
      if (mottatteOpplysningerStatus === "OK" && aktivtSteg && redigerbart) {
        setVedtakPending(true);
        await dispatch(
          kontrollerFerdigbehandling({
            behandlingID,
            vedtakstype: erNyVurdering
              ? MKV.Koder.vedtakstyper.ENDRINGSVEDTAK
              : vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
            behandlingsresultattype: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
            skalRegisteropplysningerOppdateres: oppdaterFoerKontroll,
          })
        );
        setOppdaterFoerKontroll(false);
        setVedtakPending(false);
      }
    }

    kontroller();
  }, [aktivtSteg, mottatteOpplysningerStatus]);

  const hentMuligeMottakere = async () => {
    const res = await Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
      produserbartdokument: "",
      orgnr: null,
    });
    setMuligeMottakere(res);
  };
  const debouncedHentMuligeMottakere = useCallback(Utils._debounce(hentMuligeMottakere, 300), []);
  const debouncedOppdaterFlyten = useCallback(
    Utils._debounce((trygdeavtaleresultat: Api.IkkeYrkesaktiv.Resultat) => oppdaterFlyt(trygdeavtaleresultat), 2000),
    []
  );

  useEffect(() => {
    if (steg.status === StegStatus.FERDIG) {
      debouncedHentMuligeMottakere();
    } else {
      debouncedHentMuligeMottakere.cancel();
    }
  }, [steg.status]);

  useEffect(() => {
    if (redigerbart && formValues && aktivtSteg) {
      debouncedOppdaterFlyten({
        ...resultat,
        innledningFritekst: formValues.innledningFritekst,
        begrunnelseFritekst: formValues.begrunnelseFritekst,
        nyVurderingBakgrunn: getNyVurderingBakgrunn(),
      });
    } else {
      debouncedOppdaterFlyten.cancel();
    }
  }, [
    formValues?.innledningFritekst,
    formValues?.begrunnelseFritekst,
    formValues?.nyVurderingBakgrunn,
    formValues?.nyVurderingBakgrunnFritekst,
  ]);

  const lagDokumenterData = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return [
      {
        sendesTilDokumenterV2: true,
        navn: muligMottaker.dokumentNavn,
        data: {
          produserbardokument: "",
          mottaker: muligMottaker.rolle,
          kopiMottakere: getKopiMottakere(),
          innledningFritekst: formValues?.innledningFritekst || null,
          begrunnelseFritekst: formValues?.begrunnelseFritekst || null,
          orgNr: muligMottaker?.orgnr || null,
          institusjonId: muligMottaker?.institusjonId || null,
          ektefelleFritekst: familieFormValues?.ektefelle?.fritekst || null,
          barnFritekst: familieFormValues?.barn?.fritekst || null,
          nyVurderingBakgrunn: getNyVurderingBakgrunn(),
        },
      },
    ];
  };

  const mapMottakerRad = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return [
      {
        verdi: (
          <PdfLenkeListe
            behandlingID={behandlingID}
            dokumenter={lagDokumenterData(muligMottaker)}
            vedKlikk={() => true}
            className={vurderingVedtakCls.element("forhåndsvisning")}
          />
        ),
      },
      { verdi: muligMottaker.mottakerNavn },
    ];
  };

  const mapMottakerRader = (mottakere: Api.DokumenterV2.HentMuligeMottakereResDto) => {
    return [
      mapMottakerRad(mottakere.hovedMottaker),
      ...mottakere.kopiMottakere.filter(filterKopiMottakere).map((muligMottaker) => mapMottakerRad(muligMottaker)),
      ...mottakere.fasteMottakere.map((muligMottaker) => mapMottakerRad(muligMottaker)),
    ];
  };

  const fattVedtak = async () => {
    setVedtakPending(true);

    await lagreOgFatteVedtak(lagFattVedtakTrygdeavtaleReqDto());

    if (isMounted.current) {
      setVedtakPending(false);
    }
  };

  const stegErGyldig = steg.status === StegStatus.FERDIG && formIsValid && redigerbart && Utils._isEmpty(feilmeldinger);

  return (
    <div className={vurderingVedtakCls.block}>
      <Nav.Typo.Undertittel className={vurderingVedtakCls.element("undertittel")}>
        Omfattet av norsk trygdelovgivning - trygdeavtale
      </Nav.Typo.Undertittel>

      <Nav.Row className={vurderingVedtakCls.element("infolinje")}>test</Nav.Row>

      {erNyVurdering && (
        <>
          <Nav.Fieldset
            className={vurderingVedtakCls.element("nyvurdering")}
            legend={
              <LabelMedHjelpetekst
                label="Oppgi grunn for nytt vedtak (Obligatorisk)"
                hjelpetekst={nyVurderingBakgrunnHjelpetekst}
                hjelpetekstClassName="vurderingVedtak__hjelpetekst"
              />
            }
          >
            <Nav.Row>
              <Nav.Column xs="6">
                <Skjema.Select
                  label=""
                  feltNavn="nyVurderingBakgrunn"
                  disabled={!redigerbart}
                  emptyFieldText="Velg"
                  emptyFieldDisabled={!!formValues?.nyVurderingBakgrunn}
                >
                  {MKV.KTObjects.begrunnelser.nyvurderingbakgrunner?.map((bakgrunn: KTObject) => (
                    <option key={bakgrunn.kode} value={bakgrunn.kode} label={bakgrunn.term || ""} />
                  ))}
                  <option key={FRITEKST} value={FRITEKST} label={FRITEKST} />
                </Skjema.Select>
              </Nav.Column>
            </Nav.Row>
          </Nav.Fieldset>
          {formValues?.nyVurderingBakgrunn === FRITEKST && (
            <Skjema.HTMLEditor
              feltNavn="nyVurderingBakgrunnFritekst"
              className={vurderingVedtakCls.elementWithModifier("nyvurdering", "fritekst")}
              placeholder={redigerbart ? "Skriv inn grunn for nytt vedtak..." : ""}
              disabled={!redigerbart}
            />
          )}
        </>
      )}

      <Nav.Typo.Element className={vurderingVedtakCls.element("fritekst_overskrift")} tag="h3">
        <LabelMedHjelpetekst
          label="Fritekst til innledning"
          hjelpetekst={innledningFritekst}
          hjelpetekstClassName="vurderingVedtak__hjelpetekst"
        />
      </Nav.Typo.Element>
      <Skjema.HTMLEditor
        feltNavn="innledningFritekst"
        className={vurderingVedtakCls.element("fritekst_editor")}
        placeholder={redigerbart ? "Skriv inn tilleggsinformasjon til innledning..." : ""}
        disabled={!redigerbart}
      />

      <Nav.Typo.Element className={vurderingVedtakCls.element("fritekst_overskrift")} tag="h3">
        <LabelMedHjelpetekst
          label="Fritekst til begrunnelse"
          hjelpetekst={begrunnelseFritekstHjelpetekst}
          hjelpetekstClassName="vurderingVedtak__hjelpetekst"
        />
      </Nav.Typo.Element>
      <Skjema.HTMLEditor
        feltNavn="begrunnelseFritekst"
        className={vurderingVedtakCls.element("fritekst_editor")}
        placeholder={redigerbart ? "Skriv inn tilleggsinformasjon til begrunnelse..." : ""}
        disabled={!redigerbart}
      />

      {redigerbart && (
        <Skjema.Checkbox
          feltNavn="kopiTilArbeidsgiver"
          label="Send kopi til arbeidsgiver/virksomhet"
          className={vurderingVedtakCls.element("kopiCheckbox")}
          disabled={!redigerbart}
        />
      )}

      {stegErGyldig && (
        <MottakerTabell
          rader={muligeMottakere ? mapMottakerRader(muligeMottakere) : []}
          kolonner={[
            { verdi: "Dokumenter", bredde: "60%" },
            { verdi: "Mottaker", bredde: "40%" },
          ]}
        />
      )}

      {redigerbart && erNyVurdering && (
        <Nav.AlertStripeInfo className={vurderingVedtakCls.element("alertstripe")}>
          {KV.Koder.AlertstripeTekst.NY_VURDERING_MEDL_TEKST}
        </Nav.AlertStripeInfo>
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: fattVedtak,
          disabled: !stegErGyldig,
          autoDisableVedSpinner: true,
          spinner: vedtakPending,
        }}
        bekreftTekst="Fatt vedtak"
        tilbakeKnappProps={{ onClick: tilbake, disabled: !redigerbart }}
      />
    </div>
  );
};

const VurderingVedtakForm = reduxForm<{}, PropsFromRedux & Props>({
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
