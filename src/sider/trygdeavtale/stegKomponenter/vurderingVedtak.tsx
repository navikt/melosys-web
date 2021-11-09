import React, { useEffect, useState, useCallback } from "react";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { getFormValues, reduxForm } from "redux-form";

import MKV from "../../../melosyskodeverk";
import * as Api from "../../../services/api";
import * as Hooks from "../../../hooks";
import * as Nav from "../../../navFrontend";
import * as Utils from "../../../utils";
import * as KV from "../../../kodeverk";
import * as Ikoner from "../../../resources/images";
import * as Skjema from "../../../felleskomponenter/skjema";

import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from "../../../ducks/behandlingsgrunnlag";
import { behandlingsresultatSelectors } from "../../../ducks/behandlingsresultat";
import { behandlingerSelectors } from "../../../ducks/behandlinger";
import { formSelectors } from "../../../ducks/form";
import MottakerTabell from "../../../felleskomponenter/tabell/mottakerTabell";
import PdfLenkeListe from "../../../felleskomponenter/pdfLenkeListe";

import { lagYupToReduxformErrorMapper } from "../../../yup";
import vurdering_vedtak from "./vurderingVedtakSchema";

import "./vurderingVedtak.css";

const { INNVILGELSE_UK } = MKV.Koder.brev.produserbaredokumenter;

interface Periode {
  fom?: string | null;
  tom?: string | null;
}

const mapStateToProps = (state: RootState) => {
  const soknadsperiode = behandlingsgrunnlagSelectors.PeriodeSelector(state);
  return {
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
    soknadsland: behandlingsgrunnlagSelectors.SoknadslandKTSelector(state)[0],
    soknadsperiode,
    vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
    familieFormValues: formSelectors.TrygdeavtaleFamileFormSelector(state).values,
    formValues: getFormValues(KV.Form.Trygdeavtale.VEDTAK)(state),
    initialValues: {
      fritekstBegrunnelse: behandlingsresultatSelectors.BegrunnelseFritekstSelector(state),
      soknadsperiodeFom: Utils.dato.formatterDatoTilNorsk(soknadsperiode.fom),
      soknadsperiodeTom: Utils.dato.formatterDatoTilNorsk(soknadsperiode.tom),
    },
    formIsValid: formSelectors.TrygdeavtaleVedtakFormValidSelector(state),
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterPeriode: (periode: Periode) => dispatch(behandlingsgrunnlagOperations.oppdaterPeriode(periode)),
  lagreBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.lagre()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  data: Api.Trygdeavtale.StegData;
  hentFlytOgOppdaterAktuelleSteg: () => void;
  tilbake: () => void;
  lagreOgFatteVedtak: (data: Api.Saksflyt.Vedtak.FattVedtakTrygdeavtaleReqDto) => void;
  redigerbart: boolean;
  resultat: Api.Trygdeavtale.Resultat;
  steg: Api.Trygdeavtale.Steg;
  formValues: {
    soknadsperiodeFom?: string;
    soknadsperiodeTom?: string;
    fritekstInnledning?: string;
    fritekstBegrunnelse?: string;
    kopiTilArbeidsgiver?: boolean;
  };
}

const VurderingVedtak = ({
  behandlingID,
  data: { bestemmelseValg },
  hentFlytOgOppdaterAktuelleSteg,
  tilbake,
  redigerbart,
  resultat,
  steg,
  familieFormValues,
  formValues,
  formIsValid,
  soknadsland,
  soknadsperiode,
  oppdaterPeriode,
  lagreOgFatteVedtak,
  lagreBehandlingsgrunnlag,
  vedtakstype,
}: Props & PropsFromRedux) => {
  const periodeHjelpetekst =
    "Perioden som vises her er søknadsperiode. Hvis sluttdato for oppholdet ikke er oppgitt i søknaden, og/eller du vil endre sluttdato for vedtaket, trykk på Endre og skriv inn sluttdato.";
  const fritekstInnledningHjelpetekstTittel =
    "Teksten du skriver her vil vises etter informasjonen om vedtakets periode og resultat. Eksempel: 'Du er omfattet av norsk trygdelovgivning og medlem i folketrygden fra 1. september 2022 til 31. desember 2024.' Friteksten kommer her";
  const fritekstBegrunnelseHjelpetekstTittel =
    "Teksten du skriver her vil vises etter standard begrunnelse for bestemmelsen. Eksempel: 'Vi har lagt til grunn at du er ansatt av og lønnet av en norsk arbeidsgiver, og sendt ut for å jobbe i Storbritannia i inntil tre år. Vi har gjort vurderingen fordi du har opplyst at du jobber for er ansatt av Equinor ASA.' Friteksten kommer her.";
  const [muligeMottakere, setMuligeMottakere] = useState(Api.DokumenterV2.tomHentMuligeMottakereResDto());
  const [visTomEndingFelt, setVisTomEndingFelt] = useState(false);
  const [vedtakPending, setVedtakPending] = useState(false);
  const isMounted = Hooks.useIsMounted();

  const hentMuligeMottakere = async () => {
    const res = await Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
      produserbartdokument: INNVILGELSE_UK,
      orgnr: null,
    });
    setMuligeMottakere(res);
  };
  const debouncedHentMuligeMottakere = useCallback(Utils._debounce(hentMuligeMottakere, 300), []);

  useEffect(() => {
    if (steg.status === "FERDIG") {
      debouncedHentMuligeMottakere();
    } else {
      debouncedHentMuligeMottakere.cancel();
    }
  }, [steg]);

  const handleLagreTomEndring = async () => {
    if (redigerbart && formIsValid) {
      const isoTom = Utils.dato.formatterDatoTilISO(formValues.soknadsperiodeTom);
      await oppdaterPeriode({
        fom: soknadsperiode.fom,
        tom: isoTom === "Invalid date" ? null : isoTom,
      });
      await lagreBehandlingsgrunnlag();
      hentFlytOgOppdaterAktuelleSteg();
      setVisTomEndingFelt(false);
    }
  };

  const lagDokumenterData = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return [
      {
        sendesTilDokumenterV2: true,
        navn: muligMottaker.dokumentNavn,
        data: {
          produserbardokument: INNVILGELSE_UK,
          mottaker: muligMottaker.rolle,
          kopiMottakere: [],
          innledningFritekst: formValues?.fritekstInnledning || null,
          begrunnelseFritekst: formValues?.fritekstBegrunnelse || null,
          orgNr: muligMottaker?.orgnr || null,
          ektefelleFritekst: familieFormValues?.ektefelle?.fritekst || null,
          barnFritekst: familieFormValues?.barn?.fritekst || null,
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
            className="forhåndsvisning"
          />
        ),
      },
      { verdi: muligMottaker.mottakerNavn },
    ];
  };

  const filterKopiMottakere = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    if (muligMottaker?.rolle === KV.Koder.MottakerRolle.ARBEIDSGIVER) {
      return formValues?.kopiTilArbeidsgiver;
    }
    return false;
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

    await lagreOgFatteVedtak({
      behandlingsresultatTypeKode: MKV.Koder.behandlinger.behandlingsresultattyper.FASTSATT_LOVVALGSLAND,
      fritekstInnledning: formValues?.fritekstInnledning || null,
      fritekstBegrunnelse: formValues?.fritekstBegrunnelse || null,
      fritekstEktefelle: familieFormValues?.ektefelle?.fritekst || null,
      fritekstBarn: familieFormValues?.barn?.fritekst || null,
      vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
      kopiMottakere: muligeMottakere.kopiMottakere
        .filter(filterKopiMottakere)
        .map(Api.DokumenterV2.konverterMuligMottakerTilKopiMottaker),
    });

    if (isMounted.current) {
      setVedtakPending(false);
    }
  };

  const EndreTom = () =>
    redigerbart ? (
      <div
        role="button"
        className="endreTom"
        tabIndex={0}
        onClick={() => setVisTomEndingFelt(true)}
        onKeyPress={() => setVisTomEndingFelt(true)}
      >
        <Ikoner.BlyantActive className="ikon" />
        <span className="tekst">Endre</span>
      </div>
    ) : (
      <Ikoner.BlyantDisabled className="ikon" />
    );

  return (
    <div className="vurderingVedtak">
      <Nav.Typo.Undertittel className="undertittel">
        Omfattet av norsk trygdelovgivning - trygdeavtale med {soknadsland.term}
      </Nav.Typo.Undertittel>

      <Nav.Row className="margin_bottom">
        <Nav.Column xs="4">
          <Nav.Typo.Element className="info">
            {Utils.streng.storeForbokstaver(
              KV.finnTermFraListe(bestemmelseValg, resultat.bestemmelse)?.split(" - ")[1]
            )}
          </Nav.Typo.Element>
          <Nav.Typo.Normaltekst className="info">
            {KV.finnTermFraListe(bestemmelseValg, resultat.bestemmelse)?.split(" - ")[0]}
          </Nav.Typo.Normaltekst>
        </Nav.Column>

        <Nav.Column xs="5">
          <Nav.Typo.Element className="info" tag="div">
            Periode
            <Nav.Hjelpetekst
              tittel={periodeHjelpetekst}
              className="hjelpetekst ikon"
              type={Nav.PopoverOrientering.Hoyre}
            >
              {periodeHjelpetekst}
            </Nav.Hjelpetekst>
          </Nav.Typo.Element>
          <Nav.Typo.Normaltekst className="info datofelt_wrapper" tag="div">
            {`${soknadsperiode?.fom ? Utils.dato.formatterDatoTilNorsk(soknadsperiode.fom) : ""} - `}
            {visTomEndingFelt ? (
              <span className="datofelt">
                <Skjema.Datovelger label="" feltNavn="soknadsperiodeTom" disabled={!redigerbart} />
                <Nav.Hovedknapp mini disabled={!redigerbart || !formIsValid} onClick={handleLagreTomEndring}>
                  Lagre
                </Nav.Hovedknapp>
              </span>
            ) : (
              formValues?.soknadsperiodeTom
            )}
            {!visTomEndingFelt && <EndreTom />}
          </Nav.Typo.Normaltekst>
        </Nav.Column>

        <Nav.Column xs="3">
          <Nav.Typo.Element className="info">Familiemedlemmer</Nav.Typo.Element>
          <Nav.Typo.Normaltekst className="info">
            {resultat.ektefelle || !Utils._isEmpty(resultat.barn) ? "Ja" : "-"}
          </Nav.Typo.Normaltekst>
        </Nav.Column>
      </Nav.Row>

      {redigerbart && (
        <>
          <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
            Fritekst til innledning
            <Nav.Hjelpetekst
              tittel={fritekstInnledningHjelpetekstTittel}
              className="hjelpetekst ikon"
              type={Nav.PopoverOrientering.Hoyre}
            >
              <p>Teksten du skriver her vil vises etter informasjonen om vedtakets periode og resultat.</p>
              <p>
                Eksempel:
                <br />
                &quot;Du er omfattet av norsk trygdelovgivning og medlem i folketrygden fra 1. september 2022 til 31.
                desember 2024.&quot;
              </p>
              <p>Friteksten kommer her.</p>
            </Nav.Hjelpetekst>
          </Nav.Typo.Element>
          <Skjema.HTMLEditor
            feltNavn="fritekstInnledning"
            className="fritekst_editor"
            placeholder="Skriv inn tilleggsinformasjon til innledning..."
          />
        </>
      )}

      <Nav.Typo.Element className="fritekst_overskrift" tag="h3">
        Fritekst til begrunnelse{" "}
        <Nav.Hjelpetekst
          tittel={fritekstBegrunnelseHjelpetekstTittel}
          className="hjelpetekst ikon"
          type={Nav.PopoverOrientering.Hoyre}
        >
          <p>Teksten du skriver her vil vises etter standard begrunnelse for bestemmelsen.</p>
          <p>
            Eksempel:
            <br />
            &quot;Vi har lagt til grunn at du er ansatt av og lønnet av en norsk arbeidsgiver, og sendt ut for å jobbe i
            Storbritannia i inntil tre år. Vi har gjort vurderingen fordi du har opplyst at du jobber for/er ansatt av
            Equinor ASA.&quot;
          </p>
          <p>Friteksten kommer her.</p>
        </Nav.Hjelpetekst>
      </Nav.Typo.Element>
      <Skjema.HTMLEditor
        feltNavn="fritekstBegrunnelse"
        className="fritekst_editor"
        placeholder="Skriv inn tilleggsinformasjon til begrunnelse..."
        disabled={!redigerbart}
      />

      <Skjema.Checkbox
        feltNavn="kopiTilArbeidsgiver"
        label="Send kopi til arbeidsgiver/virksomhet"
        className="kopiCheckbox"
        disabled={!redigerbart}
      />

      {redigerbart && (
        <MottakerTabell
          rader={muligeMottakere ? mapMottakerRader(muligeMottakere) : []}
          kolonner={[
            { verdi: "Dokumenter", bredde: "60%" },
            { verdi: "Mottaker", bredde: "40%" },
          ]}
        />
      )}

      <div className="fane__knapplinje">
        <Nav.Knapp mini disabled={!redigerbart} className="fane__navigasjonsknapp" onClick={tilbake}>
          Tilbake
        </Nav.Knapp>
        <Nav.Hovedknapp
          mini
          disabled={steg.status !== "FERDIG" || !redigerbart || !formIsValid || visTomEndingFelt}
          className="fane__navigasjonsknapp"
          onClick={fattVedtak}
          autoDisableVedSpinner
          spinner={vedtakPending}
        >
          Fatt vedtak
        </Nav.Hovedknapp>
      </div>
    </div>
  );
};

const VurderingVedtakForm = reduxForm<{}, PropsFromRedux & Props>({
  form: KV.Form.Trygdeavtale.VEDTAK,
  destroyOnUnmount: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true,
  validate: lagYupToReduxformErrorMapper(vurdering_vedtak),
})(VurderingVedtak);

export default connector(VurderingVedtakForm);
