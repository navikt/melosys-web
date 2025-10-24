/**
 * Stegvelger - Hovedkomponent for trinnvis saksbehandling
 *
 * Denne komponenten håndterer navigasjon og validering gjennom ulike steg i saksbehandlingsprosessen.
 * Type-definisjoner finnes i ./types.ts
 *
 * @see ./types.ts for StegvelgerProps, StegvelgerState og relaterte typer
 */
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import MKV from "../../melosyskodeverk";
import * as Api from "../../services/api";
import * as Utils from "../../utils";
import StegLinje from "../stegLinje";
import StegFane from "../stegFane";
import StegMotor, { STEG } from "./stegMotor";

import { anmodningunntakOperations } from "../../ducks/anmodningunntak";
import { anmodningsperioderOperations, anmodningsperioderSelectors } from "../../ducks/anmodningsperioder";
import { anmodningsperiodesvarOperations, anmodningsperiodesvarSelectors } from "../../ducks/anmodningsperiodesvar";
import { behandlingerSelectors } from "../../ducks/behandlinger";
import { avklartefaktaOperations, avklartefaktaSelectors } from "../../ducks/avklartefakta";
import { behandlingsperioderOperations, behandlingsperioderSelectors } from "../../ducks/behandlingsperioder";
import { fagsakSelectors } from "../../ducks/fagsaker";
import { flytSelectors } from "../../ducks/flyt";
import { lovvalgsperioderOperations, lovvalgsperioderSelectors } from "../../ducks/lovvalgsperioder";
import { vilkarOperations, vilkarSelectors } from "../../ducks/vilkar";
import { redigerbartSelectors } from "../../ducks/redigerbart";
import { formSelectors } from "../../ducks/form";
import { mottatteOpplysningerOperations, mottatteOpplysningerSelectors } from "../../ducks/mottatteOpplysninger";
import { utpekOperations } from "../../ducks/utpek";
import { utpekingsperioderOperations, utpekingsperioderSelectors } from "../../ducks/utpekingsperioder";
import { videresendingOperations } from "../../ducks/videresending";
import { oppsummertfaktaSelectors } from "../../ducks/oppsummertfakta";
import { feiletResponsSelectors } from "../../ducks/feiletRespons";
import { datalastingOperations } from "../../ducks/datalasting";
import { kontrollOperations, kontrollSelectors } from "../../ducks/kontroll";

import MottatteOpplysningerFeilmeldinger from "../mottatteOpplysningerFeilmeldinger";
import { Feilmeldinger } from "../feilmeldinger";
import { Innsynsmelding, NyVurderingMelding, StatsborgerskapFeil } from "../alertmeldinger";
import { AvklartefaktaStore, EnkelDataStore, StegStoreTyper, VilkaarStore } from "./StegState";
import "./stegvelger.less";
import { erFeatureToggleEnabled } from "../../featuretoggle";
import { MELOSYS_NORGE_ER_UTPEKT_11_3_A } from "../../featuretoggle/toggleNavn";
import type {
  StegvelgerProps,
  StegvelgerState,
  StegDataType,
  UtpekDataType,
  AvvisUtpekingDataType,
  BestillingType,
  GodkjennUnntaksperioderDataType,
  EndreVedtakDataType,
  StegType,
} from "./types";

class Stegvelger extends Component<StegvelgerProps, StegvelgerState> {
  state: StegvelgerState = {
    aktivtStegNummer: 0,
    aktuelleSteg: [] as StegType[],
    stegStores: {
      anmodningsperiodesvar: new EnkelDataStore(),
      avklartefakta: new AvklartefaktaStore(),
      vilkaar: new VilkaarStore(),
      lovvalgsbestemmelse: new EnkelDataStore(),
      tilleggbestemmelse: new EnkelDataStore(),
      unntakfrabestemmelse: new EnkelDataStore(),
      lovvalgsperiode: new EnkelDataStore(),
      lovvalgsland: new EnkelDataStore(),
      [StegStoreTyper.Anmodningsperiodersvar]: new EnkelDataStore(),
      [StegStoreTyper.Avklartefakta]: new AvklartefaktaStore(),
      [StegStoreTyper.Vilkar]: new VilkaarStore(),
      [StegStoreTyper.Lovvalgsbestemmelser]: new EnkelDataStore(),
      [StegStoreTyper.Tilleggbestemmelser]: new EnkelDataStore(),
      [StegStoreTyper.UnntakFraBestemmelse]: new EnkelDataStore(),
      [StegStoreTyper.Lovvalgsperiode]: new EnkelDataStore(),
      [StegStoreTyper.Lovvalgsland]: new EnkelDataStore(),
    },
    visMottatteOpplysningerFeilmeldinger: false,
  };

  aktiv = true;

  async componentDidMount() {
    this.aktiv = true;
    const { behandlingID, sakstype } = this.props;
    const { aktivtStegNummer } = this.state;

    if (sakstype === MKV.Koder.sakstyper.FTRL) {
      await Promise.all([this.props.hentVilkar(behandlingID)]);
    } else {
      await Promise.all([
        this.props.hentMedlemsPerioder(behandlingID),
        this.props.hentVilkar(behandlingID),
        this.props.hentAvklartefakta(behandlingID),
        this.props.hentLovvalgsperioder(behandlingID),
        this.props.hentAnmodningsperioder(behandlingID),
        this.props.hentUtpekingsperioder(behandlingID),
      ]);
    }

    this.oppdaterAktuelleSteg(aktivtStegNummer);
  }

  componentDidUpdate(prevProps: StegvelgerProps, prevState: StegvelgerState): void {
    const { aktivtStegNummer, aktuelleSteg } = this.state;
    const svarAnmodningSteg = aktuelleSteg.find((steg) => steg.id === STEG.ARTIKKEL_16_MOTTA_SVAR);
    const prevSvarAnmodningSteg = prevState.aktuelleSteg.find((steg) => steg.id === STEG.ARTIKKEL_16_MOTTA_SVAR);

    const behandlingsstatusErMottattSvarAnmodning =
      prevProps.oppsummering?.behandlingsstatus?.kode ===
      MKV.Koder.behandlinger.behandlingsstatus.SVAR_ANMODNING_MOTTATT;

    if (
      behandlingsstatusErMottattSvarAnmodning &&
      svarAnmodningSteg &&
      !prevSvarAnmodningSteg &&
      aktivtStegNummer !== svarAnmodningSteg.stegPosisjon
    ) {
      this.setState({ aktivtStegNummer: svarAnmodningSteg.stegPosisjon });
    }

    if (!Utils._isEqual(prevProps, this.props)) {
      this.debouncedOppdaterAktuelleSteg(aktivtStegNummer);
    }
  }

  componentWillUnmount() {
    this.aktiv = false;
  }

  /** Her vil validering på hver enkelt felt / fane kunne åpne
   * opp for nye tilgjengelige faner etter at saksbehandler
   * har bekreftet valgene.
   */

  hentFullmektig = (): Promise<unknown> => {
    const { saksnummer } = this.props;

    return Api.Fagsaker.aktoer.hent(saksnummer || "", MKV.Koder.aktoersroller.FULLMEKTIG);
  };

  bekreftOgFortsett = (): void => {
    this.publiserStegdata();
    this.validerSoknadOgGaTilSteg(this.beregnNesteSteg());
  };

  bekreft = (): void => {
    this.oppdater();
    this.validerSoknadOgGaTilSteg(this.beregnNesteSteg());
  };

  tilbake = (): void => {
    this.oppdater();
    this.validerSoknadOgGaTilSteg(this.beregnForrigeSteg());
  };

  oppdater = (): void => {
    const { aktivtStegNummer } = this.state;
    this.props.oppdaterMottatteOpplysninger();
    this.oppdaterAktuelleSteg(aktivtStegNummer);
  };

  harMottatteOpplysningerFeilmeldinger = (): boolean => !Utils._isEmpty(this.props.mottatteOpplysningerFeilmeldinger);

  gjemMottatteOpplysningerFeilmeldinger = (): void => this.setState({ visMottatteOpplysningerFeilmeldinger: false });

  visMottatteOpplysningerFeilmeldinger = (): void => this.setState({ visMottatteOpplysningerFeilmeldinger: true });

  oppdaterStegData = (stegID: string, data: StegDataType | undefined): void => {
    if (!data) return;

    const { felt, type, innhold, iAlleSteg } = data;
    const { stegStores } = this.state;
    if (type && iAlleSteg) {
      stegStores[type].oppdaterStegDataIAlleSteg(stegID, { felt, innhold });
    } else if (type) {
      stegStores[type].oppdaterStegData(stegID, { felt, innhold });
    }
    this.setState({ stegStores });

    if (data.oppdaterRedux) {
      this.publiserStegdata();
    }
  };

  slettStegData = (stegID: string, data: StegDataType = {}): void => {
    const { felt, type, iAlleSteg } = data;

    if (Utils._isNil(type) && Utils._isNil(felt)) {
      this.slettSteg(stegID);
    } else if (type && iAlleSteg) {
      const { stegStores } = this.state;
      stegStores[type].slettFeltIAlleSteg(data);
    } else if (type) {
      const { stegStores } = this.state;
      stegStores[type].slettStegData(stegID, data);
      this.setState({ stegStores });
    }
    this.publiserStegdata();
  };

  slettSteg = (stegID: string): void => {
    const { stegStores } = this.state;
    Object.keys(stegStores).forEach((type) => stegStores[type].slettSteg(stegID));
    this.setState({ stegStores });
  };

  hentPerioderStegState = (): {
    lovvalgsbestemmelse: unknown;
    tilleggbestemmelse: unknown;
    unntakfrabestemmelse: unknown;
    lovvalgsperiode: unknown;
    lovvalgsland: unknown;
  } => {
    const { lovvalgsbestemmelse, tilleggbestemmelse, unntakfrabestemmelse, lovvalgsperiode, lovvalgsland } =
      this.state.stegStores;

    return {
      lovvalgsbestemmelse: lovvalgsbestemmelse.hent(),
      tilleggbestemmelse: tilleggbestemmelse.hent(),
      unntakfrabestemmelse: unntakfrabestemmelse.hent(),
      lovvalgsperiode: lovvalgsperiode.hent(),
      lovvalgsland: lovvalgsland.hent(),
    };
  };

  publiserStegdata = async () => {
    if (!this.aktiv) {
      return;
    }

    const { sakstype } = this.props;
    const { aktivtStegNummer, stegStores } = this.state;
    const { vilkaar, avklartefakta, anmodningsperiodesvar } = stegStores;

    const perioderStegState = this.hentPerioderStegState();

    if (sakstype === MKV.Koder.sakstyper.FTRL) {
      await Promise.all([this.props.oppdaterVilkaar(vilkaar.hent())]);
    } else {
      await Promise.all([
        this.props.oppdaterVilkaar(vilkaar.hent()),
        this.props.oppdaterAvklartefakta(avklartefakta.hent()),
        this.props.oppdaterLovvalgperioder(perioderStegState),
        this.props.oppdaterAnmodningsPerioder(perioderStegState),
        this.props.oppdaterUtpekingsperioder(perioderStegState),
        this.props.oppdaterAnmodningsperiodesvar(anmodningsperiodesvar.hent()),
      ]);
    }

    this.props.oppdaterMottatteOpplysninger();
    this.oppdaterAktuelleSteg(aktivtStegNummer);
  };

  /**
   * Generisk metode for validering av mottatteOpplysninger benyttet i stegkomponenter. Denne valideringen kjøres i forkant av kall
   * til melosys-api. Opprettet som første steg i opprydning av redux bruk i Stegvelger. Har som mål å fjerne prop passing av
   * action creators. Se slettingen av lagreOgFatteVedtak for eksempel på denne prosessen
   */
  validerMottatteOpplysninger = async (): Promise<void> => {
    if (this.validerOgVisMottatteOpplysningerFeilmeldinger()) {
      return this.props.lagreAllData();
    }
    return Promise.reject(new Error("Feil i mottatteOpplysninger"));
  };

  utpekHandler = (data: UtpekDataType): Promise<unknown> => {
    const { saksnummer, utpek } = this.props;

    const utpekBody = {
      mottakerinstitusjoner: data.mottakerinstitusjoner,
      fritekstSed: data.fritekstSed || null,
      fritekstBrev: data.fritekstBrev || null,
    };

    return utpek(saksnummer || "", utpekBody);
  };

  lagreOgUtpek = async (data: UtpekDataType): Promise<unknown> => {
    if (this.validerOgVisMottatteOpplysningerFeilmeldinger()) {
      await this.props.lagreAllData();
      return this.utpekHandler(data);
    }
    return Promise.resolve();
  };

  avvisUtpekingHandler = (data: AvvisUtpekingDataType): Promise<unknown> => {
    const { behandlingID, avvisUtpeking } = this.props;

    return avvisUtpeking(behandlingID, data);
  };

  avvisUtpeking = async (data: AvvisUtpekingDataType): Promise<unknown> => {
    if (this.validerOgVisMottatteOpplysningerFeilmeldinger()) {
      await this.props.lagreAllData();
      return this.avvisUtpekingHandler(data);
    }
    return Promise.resolve();
  };

  lagreOgBestillAnmodningsperioder = async (bestilling: BestillingType): Promise<unknown> => {
    const { behandlingID, lagreAllData, bestillAnmodningsperioder } = this.props;

    if (this.validerOgVisMottatteOpplysningerFeilmeldinger()) {
      await lagreAllData();
      return bestillAnmodningsperioder(behandlingID, bestilling);
    }
    return Promise.resolve();
  };

  godkjennUnntaksperioder = async (data: GodkjennUnntaksperioderDataType): Promise<void> => {
    const { behandlingID, tilForsiden } = this.props;

    await Api.Saksflyt.Unntaksperioder.godkjenn(behandlingID, {
      varsleUtland: data.varsleUtland || false,
      fritekst: (data.fritekst as string) || null,
      endretPeriode: data.endretPeriode as never,
      lovvalgsbestemmelse: data.lovvalgsbestemmelse as string,
    });
    tilForsiden();
  };

  lagreOgGodkjennUnntaksperioder = async (data: GodkjennUnntaksperioderDataType): Promise<void> => {
    if (this.validerOgVisMottatteOpplysningerFeilmeldinger()) {
      await this.props.lagreAllData();
      return this.godkjennUnntaksperioder(data);
    }
    return Promise.resolve();
  };

  videresendSoknad = async (mottakerinstitusjon: unknown, fritekst: unknown, vedlegg: unknown): Promise<unknown> => {
    const { saksnummer, videresend, lagreAllData } = this.props;

    if (this.validerOgVisMottatteOpplysningerFeilmeldinger()) {
      const body = { mottakerinstitusjon, fritekst, vedlegg };

      await lagreAllData();
      return videresend(saksnummer || "", body);
    }
    return Promise.resolve();
  };

  validerOgVisMottatteOpplysningerFeilmeldinger = (): boolean => {
    if (this.harMottatteOpplysningerFeilmeldinger()) {
      this.visMottatteOpplysningerFeilmeldinger();
      return false;
    }

    this.gjemMottatteOpplysningerFeilmeldinger();
    return true;
  };

  byggLovvalgsperioderHandler = (): void => {
    const perioderStegState = this.hentPerioderStegState();
    void this.props.oppdaterLovvalgperioder(perioderStegState);
  };

  byggUtpekingsperioderHandler = (): void => {
    const perioderStegState = this.hentPerioderStegState();
    void this.props.oppdaterUtpekingsperioder(perioderStegState);
  };

  byggAnmodningsperioderHandler = (): void => {
    const perioderStegState = this.hentPerioderStegState();
    void this.props.oppdaterAnmodningsPerioder(perioderStegState);
  };

  endreLovvalgsperioderHandler = (fomdato: unknown, tomdato: unknown): void => {
    const { behandlingID, lovvalgsperioder } = this.props;

    const forkortetPeriode = lovvalgsperioder.map((periode: unknown) => ({
      ...(periode as object),
      fomDato: fomdato,
      tomDato: tomdato,
    }));
    void Api.Lovvalgsperioder.send(behandlingID, forkortetPeriode as never[]);
  };

  endreVedtak = (data: EndreVedtakDataType): Promise<unknown> => {
    const { behandlingID } = this.props;

    const utfyltData = {
      begrunnelseKode: data.begrunnelseKode || null,
      fritekst: data.fritekst || null,
      fritekstSed: data.fritekstSed || null,
    };

    return this.props.endreVedtak(behandlingID, utfyltData);
  };

  /** Analyser alle svar som er gjort i tidligere steg og bygg videre
   * steg så langt det er mulig å komme. Alle ubesvarte steg går direkte til vedtak som default.
   */
  oppdaterAktuelleSteg = (aktivtStegNummer: number, endreFokus = false): StegType[] => {
    const tilgjengeligeHandlers = {
      bekreftOgFortsett: this.bekreftOgFortsett,
      lagreOgUtpek: this.lagreOgUtpek,
      oppdaterStegData: this.oppdaterStegData,
      slettStegData: this.slettStegData,
      lagreVilkarHandler: this.props.lagreVilkarHandler,
      hentFullmektig: this.hentFullmektig,
      lagreAnmodningsperioderHandler: this.props.lagreAnmodningsperioderHandler,
      endreVedtak: this.endreVedtak,
      endreLovvalgsperioderHandler: this.endreLovvalgsperioderHandler,
      tilForsiden: this.props.tilForsiden,
      lagreOgBestillAnmodningsperioder: this.lagreOgBestillAnmodningsperioder,
      byggAnmodningsperioderHandler: this.byggAnmodningsperioderHandler,
      videresendSoknad: this.videresendSoknad,
      byggLovvalgsperioder: this.byggLovvalgsperioderHandler,
      lagreLovvalgsperioder: this.props.lagreLovvalgsperioderHandler,
      avvisUtpeking: this.avvisUtpeking,
      lagreOgGodkjennUnntaksperioder: this.lagreOgGodkjennUnntaksperioder,
      byggUtpekingsperioder: this.byggUtpekingsperioderHandler,
      bekreft: this.bekreft,
      tilbake: this.tilbake,
      oppdater: this.oppdater,
      lagreMottatteOpplysningerOgOppfriskSaksopplysninger:
        this.props.lagreMottatteOpplysningerOgOppfriskSaksopplysninger,
      kontrollerFerdigbehandling: this.kontrollerFerdigbehandling,
      validerMottatteOpplysninger: this.validerMottatteOpplysninger,
    };

    const { props } = this;

    const propsLight = {
      anmodningsperioder: props.anmodningsperioder,
      anmodningsperiodesvar: props.anmodningsperiodesvar,
      anmodningsperiodesvarForm: props.artikkel16_motta_svar_skjema,
      behandlingID: props.behandlingID,
      virksomheterIPerioden: props.arbeidsgivereIPerioden,
      avklartefakta: props.avklartefakta,
      begrunnelser: MKV.KTObjects.begrunnelser,
      behandlingstype: props.oppsummering?.behandlingstype,
      behandlingstema: props.oppsummering?.behandlingstema,
      behandlingsstatus: props.oppsummering?.behandlingsstatus,
      lovvalgsperioder: props.lovvalgsperioder,
      lovvalgsbestemmelse: props.lovvalgsbestemmelse,
      tilleggsbestemmelse: props.tilleggsbestemmelse,
      valgteLovvalgsVilkarBestemmelse: props.valgteLovvalgsVilkarBestemmelse,
      utpekingsperioder: props.utpekingsperioder,
      omfattesIAnnetLand: props.omfattesIAnnetLand,
      artikkel12_vedtak_skjema: props.artikkel12_vedtak_skjema,
      artikkel16_anmodning_skjema: props.artikkel16_anmodning_skjema,
      artikkel16_motta_svar_skjema: props.artikkel16_motta_svar_skjema,
      vurder_utpeking_skjema: props.vurder_utpeking_skjema,
      saksnummer: props.saksnummer,
      tilgjengeligeHandlers,
      saksopplysninger: props.saksopplysninger,
      arbeidsland: props.arbeidsland,
      arbeidslandMedYrkesaktivitet: props.arbeidslandMedYrkesaktivitet,
      valgteVirksomheter: props.valgteVirksomheter,
      valgteVirksomheterIkkeNaeringsDrivende: props.valgteVirksomheterIkkeNaeringsDrivende,
      vilkar: props.vilkar,
      redigerbart: props.redigerbart,
      generiskStegRedigerbart: props.generiskStegRedigerbart,
      erIDirekteTilArtikkel16Flyt: props.erIDirekteTilArtikkel16Flyt,
      vurderUtpekingFom: props.vurderUtpekingFom,
      vurderUtpekingTom: props.vurderUtpekingTom,
      vurderUtpekingValid: props.vurderUtpekingValid,
      erSoknadArbeidFlereLand:
        props.oppsummering?.behandlingstema?.kode === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND,
      erArbeidTjenestepersonEllerFly:
        MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY ===
        props.oppsummering?.behandlingstema?.kode,
      erArbeidEttLand: props.erArbeidEttLand,
      maritimtarbeid: props.maritimtarbeid,
      hjemmebaser: props.hjemmebaser,
      medfolgendeBarn: props.medfolgendeBarn,
      lagredeVirksomheter: props.lagredeVirksomheter,
      bestemmelser: props.bestemmelser,
      soknadsperiode: props.soknadsperiode,
      harFeilmeldinger: !Utils._isEmpty(props.feilmeldinger) || !Utils._isEmpty(props.kontrollfeil),
      norgeErUtpekt11_3AToggleEnabled: props.norgeErUtpekt11_3AToggleEnabled,
      utsendingsvilkår: props.utsendingsvilkår,
      unntaksvilkår: props.unntaksvilkår,
      behandlingOppfriskes: props.behandlingOppfriskes,
      art11_3Aeller13_3A: props.art11_3Aeller13_3A,
      art11_4_1eller13_4_1: props.art11_4_1eller13_4_1,
      art11_4_2eller13_4_2: props.art11_4_2eller13_4_2,
    };

    const stegMotor = new StegMotor(propsLight, props.stegMap, props.forsteSteg);
    const aktuelleSteg = stegMotor.beregnAlleSteg();
    // Dersom ved en re-kalkulering av aktuelle steg viser seg at det ikke er flere mulige steg
    // må vi normalisere siden aktivtStegNummer vil ligge 1 steg foran det som er mulig. Sjekk derfor
    // på faktisk antall mulige steg.
    const normalisertAktivtSteg = Math.min(aktivtStegNummer, aktuelleSteg.length - 1);

    aktuelleSteg[normalisertAktivtSteg].aktivtSteg = true;

    this.setState({ aktuelleSteg });
    if (endreFokus) Utils.navigasjon.flyttFokusTilHtmlElementFraId(aktuelleSteg[normalisertAktivtSteg].id);
    return aktuelleSteg;
  };

  debouncedOppdaterAktuelleSteg = Utils._debounce(async (aktivtStegNummer: number) => {
    this.oppdaterAktuelleSteg(aktivtStegNummer);
  }, 300);

  validerSoknadOgGaTilSteg = (nyttStegNummer: number): void => {
    if (this.validerOgVisMottatteOpplysningerFeilmeldinger()) {
      void this.tilSteg(nyttStegNummer);
    }
  };

  /** Gå til et konkret steg i steglisten, angitt av en indeks
   * som begynnner med 0.
   */
  tilSteg = async (nyttStegNummer: number): Promise<void> => {
    const {
      artikkel16_anmodning_skjema,
      soknad_skjema,
      oppdaterPerioderState,
      lagreMottatteOpplysningerHandler,
      redigerbart,
      lagreVilkarHandler,
      lagreAvklartefaktaHandler,
      lagreLovvalgsperioderHandler,
      lagreAnmodningsperioderHandler,
      lagreUtpekingsperioderHandler,
      sakstype,
      anmodningErSendtUtland,
    } = this.props;

    this.setState({ aktivtStegNummer: nyttStegNummer });

    if (redigerbart) {
      if (sakstype !== MKV.Koder.sakstyper.FTRL) {
        await oppdaterPerioderState({ ...soknad_skjema, ...artikkel16_anmodning_skjema });
        await lagreLovvalgsperioderHandler?.();

        if (!anmodningErSendtUtland) {
          await lagreAvklartefaktaHandler();
          await lagreVilkarHandler?.();
          await lagreAnmodningsperioderHandler?.();
          await lagreUtpekingsperioderHandler();
        }
      }

      if (this.erSisteSteg(nyttStegNummer)) {
        await lagreMottatteOpplysningerHandler();
      }
    }

    this.oppdaterAktuelleSteg(nyttStegNummer, true);
  };

  /** Beregn neste steg i rekken, men ikke lenger enn
   * maks antall steg (til og med vedtak). Ved forsøk på å gå ytterligere steg
   * enn hva som er mulig skal funksjonen defaulte til det aktive stegnummeret.
   */
  beregnNesteSteg = (): number => {
    const { aktivtStegNummer } = this.state;
    return aktivtStegNummer + 1;
  };

  beregnForrigeSteg = (): number => {
    const { aktivtStegNummer } = this.state;
    return aktivtStegNummer - 1;
  };

  erVedtakSteg(stegNummer: number): boolean | undefined {
    return this.state.aktuelleSteg[stegNummer]?.vedtakSteg;
  }

  erInngangsteg(stegNummer: number): boolean | undefined {
    return this.state.aktuelleSteg[stegNummer]?.stegPosisjon === 0;
  }

  kontrollerFerdigbehandling = (data: unknown): Promise<unknown> => {
    return this.props.kontrollerFerdigbehandling(data);
  };

  erSisteSteg(stegNummer: number): boolean {
    const maksSteg = this.state.aktuelleSteg.length - 1;
    return stegNummer >= maksSteg;
  }

  render() {
    const { visMottatteOpplysningerFeilmeldinger, aktivtStegNummer, aktuelleSteg } = this.state;
    const { redigerbart, oppsummering } = this.props;
    const visFeilmeldinger =
      this.erVedtakSteg(aktivtStegNummer) || aktuelleSteg[aktivtStegNummer]?.id === STEG.ARTIKKEL_16_ANMODNING;
    const inngangStegErAktivt = this.erInngangsteg(aktivtStegNummer);
    const erNyVurdering = oppsummering?.behandlingstype?.kode === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
    return (
      <div className="stegvelger panelSeksjon">
        <StegLinje steg={aktuelleSteg} stegKlikk={this.validerSoknadOgGaTilSteg} />
        <StatsborgerskapFeil className="varselmelding" />
        {!redigerbart && <Innsynsmelding />}
        {visFeilmeldinger && <Feilmeldinger />}
        {erNyVurdering && redigerbart && inngangStegErAktivt && <NyVurderingMelding />}
        {aktuelleSteg.map((item) => (
          <StegFane id={item.id} key={item.id} faneData={item} />
        ))}
        {visMottatteOpplysningerFeilmeldinger && <MottatteOpplysningerFeilmeldinger />}
      </div>
    );
  }
}

const mapStateToProps = (state: unknown): Partial<StegvelgerProps> =>
  ({
    anmodningsperioder: anmodningsperioderSelectors.AnmodningsperioderSelector(state),
    anmodningErSendtUtland: anmodningsperioderSelectors.AlleAnmodningsperioderSendtUtlandSelector(state),
    anmodningsperiodesvar: anmodningsperiodesvarSelectors.AnmodningsperiodesvarSelector(state),
    arbeidsgivereIPerioden: avklartefaktaSelectors.VirksomheterIPeriodenSelector(state),
    avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
    vilkar: vilkarSelectors.VilkarSelector(state),
    utsendingsvilkår: vilkarSelectors.UtsendingsvilkårSelector(state),
    unntaksvilkår: vilkarSelectors.UnntaksvilkårSelector(state),
    art11_3Aeller13_3A: vilkarSelectors.Artikkel11_3AEller13_3ASelector(state),
    art11_4_1eller13_4_1: vilkarSelectors.Artikkel11_4_1Eller13_4_1Selector(state),
    art11_4_2eller13_4_2: vilkarSelectors.Artikkel11_4_2Eller13_4_2Selector(state),
    lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
    behandlingsPerioder: behandlingsperioderSelectors.behandlingsPerioderSelector(state),
    arbeidsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
    arbeidslandMedYrkesaktivitet: avklartefaktaSelectors.ArbeidslandMedYrkesAktivitetSelector(state),
    oppsummering: behandlingerSelectors.OppsummeringSelector(state),
    soknad_skjema: (formSelectors.SoknadFormSelector(state) as { values?: Record<string, unknown> }).values,
    artikkel12_vedtak_skjema: formSelectors.VedtakArtikkel12FormValuesSelector(state),
    artikkel16_anmodning_skjema: (
      formSelectors.Artikkel16AnmodningFormSelector(state) as { values?: Record<string, unknown> }
    ).values,
    artikkel16_motta_svar_skjema: (
      formSelectors.Artikkel16MottaSvarFormSelector(state) as { values?: Record<string, unknown> }
    ).values,
    vurder_utpeking_skjema: (formSelectors.VurderUtpekingFormSelector(state) as { values?: Record<string, unknown> })
      .values,
    saksopplysninger: behandlingerSelectors.SaksopplysningerSelector(state),
    valgteVirksomheter: avklartefaktaSelectors.AvklarteVirksomheterSelector(state),
    valgteVirksomheterIkkeNaeringsDrivende:
      avklartefaktaSelectors.AvklarteVirksomheterIkkeNaeringsdrivendeSelector(state),
    redigerbart: redigerbartSelectors.RedigerbartSelector(state),
    mottatteOpplysningerFeilmeldinger: formSelectors.SoknadErrorsSelector(state),
    generiskStegRedigerbart: redigerbartSelectors.GeneriskStegRedigerbartSelector(state),
    saksnummer: fagsakSelectors.SaksnummerSelector(state),
    erIDirekteTilArtikkel16Flyt: flytSelectors.ErIDirekteTilArtikkel16FlytSelector(state),
    utpekingsperioder: utpekingsperioderSelectors.UtpekingsperioderSelector(state),
    omfattesIAnnetLand: avklartefaktaSelectors.OmfattesIAnnetLandSelector(state),
    vurderUtpekingFom: formSelectors.VurderUtpekingFomSelector(state),
    vurderUtpekingTom: formSelectors.VurderUtpekingTomSelector(state),
    vurderUtpekingValid: formSelectors.VurderUtpekingValid(state),
    lovvalgsbestemmelse: lovvalgsperioderSelectors.LovvalgBestemmelseSelector(state),
    tilleggsbestemmelse: lovvalgsperioderSelectors.TilleggBestemmelseSelector(state),
    valgteLovvalgsVilkarBestemmelse: lovvalgsperioderSelectors.ValgteLovvalgsVilkarBestemmelseSelector(state),
    maritimtarbeid: formSelectors.MaritimtArbeidSelector(state) as Record<string, unknown>[] | undefined,
    hjemmebaser: mottatteOpplysningerSelectors.HjemmebaserSelector(state) as string[] | undefined,
    erArbeidEttLand: behandlingerSelectors.ErArbeidEttLand(state),
    medfolgendeBarn: mottatteOpplysningerSelectors.MedfolgendeBarnSelector(state),
    lagredeVirksomheter: oppsummertfaktaSelectors.VirksomhetIDerSelector(state),
    soknadsperiode: mottatteOpplysningerSelectors.PeriodeSelector(state),
    feilmeldinger: feiletResponsSelectors.FeilmeldingerSelector(state),
    kontrollfeil: kontrollSelectors.KontrollFeilSelector(state),
    norgeErUtpekt11_3AToggleEnabled: erFeatureToggleEnabled(MELOSYS_NORGE_ER_UTPEKT_11_3_A, state),
  }) as unknown as ReturnType<typeof mapStateToProps> & Partial<StegvelgerProps>;

/* eslint no-alert:off */
const mapDispatchToProps = (dispatch: React.Dispatch<never>) => ({
  hentVilkar: (behandlingID: number) => dispatch(vilkarOperations.hent(behandlingID) as never),
  kontrollerFerdigbehandling: (data: unknown) =>
    dispatch(kontrollOperations.kontrollerFerdigbehandling(data as never) as never),
  videresend: (saksnummer: string, videresending: unknown) =>
    dispatch(videresendingOperations.send(saksnummer, videresending as never) as never),
  hentAvklartefakta: (behandlingID: number) => dispatch(avklartefaktaOperations.hent(behandlingID) as never),
  hentLovvalgsperioder: (behandlingID: number) => dispatch(lovvalgsperioderOperations.hent(behandlingID) as never),
  oppdaterPerioderState: (skjema: unknown) =>
    dispatch(behandlingsperioderOperations.oppdaterPerioderState(skjema) as never),
  oppdaterVilkaar: (vilkaarListe: unknown) => dispatch(vilkarOperations.oppdaterState(vilkaarListe) as never),
  oppdaterAvklartefakta: (avklartefaktaListe: unknown) =>
    dispatch(avklartefaktaOperations.oppdaterAvklarteFaktaState(avklartefaktaListe) as never),
  oppdaterLovvalgperioder: (stegState: unknown) =>
    dispatch(lovvalgsperioderOperations.oppdaterLovvalgsperioderState(stegState as never) as never),
  hentMedlemsPerioder: (behandlingID: number) =>
    dispatch(behandlingsperioderOperations.hentMedlemsPerioder(behandlingID) as never),
  hentAnmodningsperioder: (behandlingID: number) => dispatch(anmodningsperioderOperations.hent(behandlingID) as never),
  oppdaterAnmodningsPerioder: (stegState: unknown) =>
    dispatch(anmodningsperioderOperations.oppdaterAnmodningsperioderState(stegState as never) as never),
  hentUtpekingsperioder: (behandlingID: number) => dispatch(utpekingsperioderOperations.hent(behandlingID) as never),
  oppdaterUtpekingsperioder: (stegState: unknown) =>
    dispatch(utpekingsperioderOperations.oppdaterUtpekingsperioderState(stegState as never) as never),
  oppdaterAnmodningsperiodesvar: (anmodningsperiodesvar: unknown) =>
    dispatch(anmodningsperiodesvarOperations.oppdaterAnmodningsperiodesvarState(anmodningsperiodesvar) as never),
  lagreMottatteOpplysningerHandler: () => dispatch(mottatteOpplysningerOperations.lagre() as never),
  utpek: (saksnummer: string, body: unknown) => dispatch(utpekOperations.utpek(saksnummer, body) as never),
  avvisUtpeking: (behandlingID: number, body: unknown) => dispatch(utpekOperations.avvis(behandlingID, body) as never),
  lagreUtpekingsperioderHandler: () => dispatch(utpekingsperioderOperations.lagre() as never),
  bestillAnmodningsperioder: (behandlingID: number, bestilling: unknown) =>
    dispatch(anmodningunntakOperations.bestill(behandlingID, bestilling as never) as never),
  oppdaterMottatteOpplysninger: () => dispatch(mottatteOpplysningerOperations.oppdaterState() as never),
  lagreAllData: () => dispatch(datalastingOperations.lagreAllData() as never),
});

const ConnectedStegvelger = connect(mapStateToProps, mapDispatchToProps)(Stegvelger as never);
export default withRouter(ConnectedStegvelger as never);
