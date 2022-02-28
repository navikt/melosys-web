import React, { Fragment, useCallback, useEffect, useState } from "react";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { RootState } from "AppTypes";
import { connect, ConnectedProps } from "react-redux";
import { getFormValues, reduxForm } from "redux-form";
import { KTObject } from "@navikt/melosys-kodeverk";

import MKV from "../../../melosyskodeverk";
import * as Api from "../../../services/api";
import * as Hooks from "../../../hooks";
import * as Mui from "../../../felleskomponenter/ui";
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
import { StegStatus } from "../stegvelger";
import bem from "../../../bemUtils";
import vurdering_vedtak from "./vurderingVedtakSchema";

import "./vurderingVedtak.css";

const { STORBRITANNIA } = MKV.Koder.brev.produserbaredokumenter;
const FRITEKST = "Fritekst";

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
    erNyVurdering
  );
  return {
    behandlingID: behandlingerSelectors.BehandlingIDSelector(state),
    behandlingsgrunnlagStatus: behandlingsgrunnlagSelectors.BehandlingsgrunnlagStatusSelector(state),
    soknadsland: behandlingsgrunnlagSelectors.SoknadslandKTSelector(state)[0],
    vedtakstype: behandlingsresultatSelectors.VedtakstypeSelector(state),
    familieFormValues: formSelectors.TrygdeavtaleFamileFormSelector(state).values,
    formValues: getFormValues(KV.Form.Trygdeavtale.VEDTAK)(state),
    initialValues: {
      innledningFritekst: ownProps.resultat.innledningFritekst,
      begrunnelseFritekst: ownProps.resultat.begrunnelseFritekst,
      lovvalgsperiodeFom:
        ownProps.resultat.lovvalgsperiodeFom && Utils.dato.formatterDatoTilNorsk(ownProps.resultat.lovvalgsperiodeFom),
      lovvalgsperiodeTom:
        ownProps.resultat.lovvalgsperiodeTom && Utils.dato.formatterDatoTilNorsk(ownProps.resultat.lovvalgsperiodeTom),
      kopiTilArbeidsgiver: true,
      nyVurderingBakgrunn: initialNyVurderingBakgrunn,
      nyVurderingBakgrunnFritekst: initialNyVurderingBakgrunnFritekst,
    },
    periodeIsValid: formSelectors.TrygdeavtaleVedtakFormPeriodeValidSelector(state),
    erNyVurdering,
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, unknown, Action>) => ({
  oppdaterPeriode: (periode: Periode) => dispatch(behandlingsgrunnlagOperations.oppdaterPeriode(periode)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props {
  data: Api.Trygdeavtale.StegData;
  oppdaterFlyt: (data: Api.Trygdeavtale.FlytReqDto) => void;
  tilbake: () => void;
  lagreOgFatteVedtak: (data: Api.Saksflyt.Vedtak.FattVedtakTrygdeavtaleReqDto) => void;
  oppdaterValideringFeil: (data: Api.Saksflyt.Vedtak.FattVedtakReqDto, oppdaterRegisteropplysninger: boolean) => void;
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
}

const VurderingVedtak = ({
  behandlingID,
  behandlingsgrunnlagStatus,
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
  oppdaterValideringFeil,
  soknadsland,
  lagreOgFatteVedtak,
  vedtakstype,
}: Props & PropsFromRedux) => {
  const periodeHjelpetekst =
    "Perioden som vises her er søknadsperiode. Hvis sluttdato for oppholdet ikke er oppgitt i søknaden, og/eller du vil endre sluttdato for vedtaket, trykk på Endre og skriv inn sluttdato.";
  const innledningFritekstHjelpetekstTittel =
    "Teksten du skriver her vil vises etter informasjonen om vedtakets periode og resultat. Eksempel: 'Du er omfattet av norsk trygdelovgivning og medlem i folketrygden fra 1. september 2022 til 31. desember 2024.' Friteksten kommer her";
  const begrunnelseFritekstHjelpetekstTittel =
    "Teksten du skriver her vil vises etter standard begrunnelse for bestemmelsen. Eksempel: 'Vi har lagt til grunn at du er ansatt av og lønnet av en norsk arbeidsgiver, og sendt ut for å jobbe i Storbritannia i inntil tre år. Vi har gjort vurderingen fordi du har opplyst at du jobber for er ansatt av Equinor ASA.' Friteksten kommer her.";
  const nyVurderingBakgrunnHjelpetekst =
    "Velg en innledningstekst til vedtaket. Teksten kommer først i vedtaket og skal forklare hvorfor vi har gjort nytt vedtak. Hvis ingen av standardtekstene passer, velger du fritekst og skriver egen innledning til vedtaket.";
  const [muligeMottakere, setMuligeMottakere] = useState(Api.DokumenterV2.tomHentMuligeMottakereResDto());
  const [visTomEndringFelt, setVisTomEndringFelt] = useState(false);
  const [vedtakPending, setVedtakPending] = useState(false);
  const [oppdaterFørKontroll, setOppdaterFørKontroll] = useState(true);
  const isMounted = Hooks.useIsMounted();

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
    vedtakstype: vedtakstype || MKV.Koder.vedtakstyper.FØRSTEGANGSVEDTAK,
    kopiMottakere: getKopiMottakere(),
    nyVurderingBakgrunn: getNyVurderingBakgrunn(),
  });

  const kontrollerVedtak = (oppdaterRegisteropplysninger: boolean = false) => {
    oppdaterValideringFeil(lagFattVedtakTrygdeavtaleReqDto(), oppdaterRegisteropplysninger);
    setOppdaterFørKontroll(false);
  };
  const debouncedKontrollerVedtak = useCallback(Utils._debounce(kontrollerVedtak, 500), []);

  const hentMuligeMottakere = async () => {
    const res = await Api.DokumenterV2.hentMuligeMottakere(behandlingID, {
      produserbartdokument: STORBRITANNIA,
      orgnr: null,
    });
    setMuligeMottakere(res);
  };
  const debouncedHentMuligeMottakere = useCallback(Utils._debounce(hentMuligeMottakere, 300), []);

  const debouncedOppdaterFlyten = useCallback(
    Utils._debounce((data: Api.Trygdeavtale.Resultat) => oppdaterFlyt({ resultat: data }), 2000),
    []
  );

  useEffect(() => {
    if (redigerbart) debouncedKontrollerVedtak(oppdaterFørKontroll);
    return () => debouncedKontrollerVedtak.cancel();
  }, []);

  useEffect(() => {
    if (behandlingsgrunnlagStatus === "OK" && redigerbart) {
      debouncedKontrollerVedtak(oppdaterFørKontroll);
    }
  }, [resultat.lovvalgsperiodeTom, behandlingsgrunnlagStatus, resultat.bestemmelse]);

  useEffect(() => {
    if (steg.status === StegStatus.FERDIG) {
      debouncedHentMuligeMottakere();
    } else {
      debouncedHentMuligeMottakere.cancel();
    }
  }, [steg.status, resultat.bestemmelse, resultat.virksomhet]);

  useEffect(() => {
    if (redigerbart && formValues) {
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

  const handleLagreTomEndring = async () => {
    if (redigerbart && formValues) {
      const isoFom = Utils.dato.formatterDatoTilISO(formValues.lovvalgsperiodeFom);
      const isoTom = Utils.dato.formatterDatoTilISO(formValues.lovvalgsperiodeTom);
      oppdaterFlyt({
        resultat: {
          ...resultat,
          lovvalgsperiodeFom: isoFom === "Invalid date" ? undefined : isoFom,
          lovvalgsperiodeTom: isoTom === "Invalid date" ? undefined : isoTom,
        },
      });
      setVisTomEndringFelt(false);
    }
  };

  const lagDokumenterData = (muligMottaker: Api.DokumenterV2.MuligMottaker) => {
    return [
      {
        sendesTilDokumenterV2: true,
        navn: muligMottaker.dokumentNavn,
        data: {
          produserbardokument: STORBRITANNIA,
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

  const EndreTom = () =>
    redigerbart ? (
      <div
        role="button"
        className={vurderingVedtakCls.element("endreTom")}
        tabIndex={0}
        onClick={() => setVisTomEndringFelt(true)}
        onKeyDown={(event) => {
          if ([" ", "Enter"].includes(event.key)) {
            event.preventDefault();
            setVisTomEndringFelt(true);
          }
        }}
      >
        <Ikoner.BlyantActive className={vurderingVedtakCls.element("ikon")} />
        <span className={vurderingVedtakCls.element("endreTomTekst")}>Endre</span>
      </div>
    ) : (
      <div className={vurderingVedtakCls.elementWithModifier("endreTom", "disabled")}>
        <Ikoner.BlyantDisabled className={vurderingVedtakCls.element("ikon")} />
      </div>
    );

  return (
    <div className={vurderingVedtakCls.block}>
      <Nav.Typo.Undertittel className={vurderingVedtakCls.element("undertittel")}>
        Omfattet av norsk trygdelovgivning - trygdeavtale med {soknadsland.term}
      </Nav.Typo.Undertittel>

      <Nav.Row className={vurderingVedtakCls.element("infolinje")}>
        <Nav.Column xs="4">
          <Nav.Typo.Element className={vurderingVedtakCls.element("info")}>
            {Utils.streng.storeForbokstaver(
              KV.finnTermFraListe(bestemmelseValg, resultat.bestemmelse)?.split(" - ")[1]
            )}
          </Nav.Typo.Element>
          <Nav.Typo.Normaltekst className={vurderingVedtakCls.element("info")}>
            {KV.finnTermFraListe(bestemmelseValg, resultat.bestemmelse)?.split(" - ")[0]}
          </Nav.Typo.Normaltekst>
        </Nav.Column>

        <Nav.Column xs="5">
          <Nav.Typo.Element className={vurderingVedtakCls.element("info")} tag="div">
            Periode
            <Nav.Hjelpetekst
              tittel={periodeHjelpetekst}
              className={vurderingVedtakCls.element("hjelpetekst")}
              type={Nav.PopoverOrientering.Hoyre}
            >
              {periodeHjelpetekst}
            </Nav.Hjelpetekst>
          </Nav.Typo.Element>
          <Nav.Typo.Normaltekst className={vurderingVedtakCls.element("datofelt_wrapper")} tag="div">
            {`${formValues?.lovvalgsperiodeFom ? formValues?.lovvalgsperiodeFom : ""} - `}
            {visTomEndringFelt ? (
              <span className={vurderingVedtakCls.element("datofelt")}>
                <Skjema.Datovelger label="" feltNavn="lovvalgsperiodeTom" disabled={!redigerbart} />
                <Nav.Hovedknapp mini disabled={!redigerbart || !periodeIsValid} onClick={handleLagreTomEndring}>
                  Lagre
                </Nav.Hovedknapp>
              </span>
            ) : (
              formValues?.lovvalgsperiodeTom
            )}
            {!visTomEndringFelt && <EndreTom />}
          </Nav.Typo.Normaltekst>
        </Nav.Column>

        <Nav.Column xs="3">
          <Nav.Typo.Element className={vurderingVedtakCls.element("info")}>Familiemedlemmer</Nav.Typo.Element>
          <Nav.Typo.Normaltekst className={vurderingVedtakCls.element("info")}>
            {resultat.ektefelle || !Utils._isEmpty(resultat.barn) ? "Ja" : "-"}
          </Nav.Typo.Normaltekst>
        </Nav.Column>
      </Nav.Row>

      {erNyVurdering && (
        <>
          <Nav.Fieldset
            className={vurderingVedtakCls.element("nyvurdering")}
            legend={
              <Fragment>
                Oppgi grunn for nytt vedtak
                <Nav.Hjelpetekst
                  className={vurderingVedtakCls.element("hjelpetekst")}
                  tittel={nyVurderingBakgrunnHjelpetekst}
                  type={Nav.PopoverOrientering.Hoyre}
                >
                  {nyVurderingBakgrunnHjelpetekst}
                </Nav.Hjelpetekst>
              </Fragment>
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
        Fritekst til innledning
        <Nav.Hjelpetekst
          tittel={innledningFritekstHjelpetekstTittel}
          className={vurderingVedtakCls.element("hjelpetekst")}
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
        feltNavn="innledningFritekst"
        className={vurderingVedtakCls.element("fritekst_editor")}
        placeholder={redigerbart ? "Skriv inn tilleggsinformasjon til innledning..." : ""}
        disabled={!redigerbart}
      />

      <Nav.Typo.Element className={vurderingVedtakCls.element("fritekst_overskrift")} tag="h3">
        Fritekst til begrunnelse{" "}
        <Nav.Hjelpetekst
          tittel={begrunnelseFritekstHjelpetekstTittel}
          className={vurderingVedtakCls.element("hjelpetekst")}
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

      {redigerbart && (
        <MottakerTabell
          rader={muligeMottakere ? mapMottakerRader(muligeMottakere) : []}
          kolonner={[
            { verdi: "Dokumenter", bredde: "60%" },
            { verdi: "Mottaker", bredde: "40%" },
          ]}
        />
      )}

      <Mui.StegKnapper
        bekreftKnappProps={{
          onClick: fattVedtak,
          disabled: !redigerbart,
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
