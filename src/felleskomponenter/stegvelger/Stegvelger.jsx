import { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PT from "prop-types";

import MKV from "../../melosyskodeverk";
import * as MPT from "../../proptypes";
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
import { Innsynsmelding, NyVurderingMelding, StatsborgerskapFeil, UlikPeriodeMelding } from "../alertmeldinger";
import { AvklartefaktaStore, EnkelDataStore, StegStoreTyper, VilkaarStore } from "./StegState";
import "./stegvelger.less";

const byggStegStores = () => ({
  [StegStoreTyper.Anmodningsperiodersvar]: new EnkelDataStore(),
  [StegStoreTyper.Avklartefakta]: new AvklartefaktaStore(),
  [StegStoreTyper.Vilkar]: new VilkaarStore(),
  [StegStoreTyper.Lovvalgsbestemmelser]: new EnkelDataStore(),
  [StegStoreTyper.Tilleggbestemmelser]: new EnkelDataStore(),
  [StegStoreTyper.UnntakFraBestemmelse]: new EnkelDataStore(),
  [StegStoreTyper.Lovvalgsperiode]: new EnkelDataStore(),
  [StegStoreTyper.Lovvalgsland]: new EnkelDataStore(),
});

class Stegvelger extends Component {
  state = {
    aktivtStegNummer: 0,
    aktuelleSteg: [],
    stegStores: byggStegStores(),
    visMottatteOpplysningerFeilmeldinger: false,
    harTrygdeavgiftperiode: false,
  };

  aktiv = true;

  bytterSteg = false;

  stegovergangId = 0;

  async componentDidMount() {
    this.aktiv = true;
    const { behandlingID, sakstype } = this.props;
    const { aktivtStegNummer } = this.state;

    const trygdeavgiftperioder = await Api.Trygdeavgift.hentTrygdeavgiftperioder(behandlingID);
    this.setState({ harTrygdeavgiftperiode: trygdeavgiftperioder.length > 0 });

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

  resetTilForsteSteg = (endreFokus = true) => {
    this.debouncedOppdaterAktuelleSteg.cancel?.();
    this.setState(
      {
        aktivtStegNummer: 0,
        stegStores: byggStegStores(),
        visMottatteOpplysningerFeilmeldinger: false,
      },
      () => {
        this.oppdaterAktuelleSteg(0, endreFokus);
      },
    );
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.bytterSteg) {
      return;
    }
    const { aktivtStegNummer, aktuelleSteg } = this.state;
    const oppfriskStartet = !prevProps.behandlingOppfriskes && this.props.behandlingOppfriskes;
    const oppfriskFerdig = prevProps.behandlingOppfriskes && !this.props.behandlingOppfriskes;
    const svarAnmodningSteg = aktuelleSteg.find((steg) => steg.id === STEG.ARTIKKEL_16_MOTTA_SVAR);
    const prevSvarAnmodningSteg = prevState.aktuelleSteg.find((steg) => steg.id === STEG.ARTIKKEL_16_MOTTA_SVAR);

    const behandlingsstatusErMottattSvarAnmodning =
      prevProps.oppsummering.behandlingsstatus.kode === MKV.Koder.behandlinger.behandlingsstatus.SVAR_ANMODNING_MOTTATT;

    const haandterOppfrisk = (endreFokus) => {
      if (aktivtStegNummer === 0) {
        this.resetTilForsteSteg(endreFokus);
      } else {
        this.oppdaterAktuelleSteg(aktivtStegNummer, endreFokus);
      }
    };

    if (oppfriskStartet) {
      haandterOppfrisk(false);
      return;
    }

    if (oppfriskFerdig) {
      haandterOppfrisk(true);
      return;
    }

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
    this.debouncedOppdaterAktuelleSteg.cancel?.();
  }

  /** Her vil validering på hver enkelt felt / fane kunne åpne
   * opp for nye tilgjengelige faner etter at saksbehandler
   * har bekreftet valgene.
   */

  hentFullmektig = () => {
    const { saksnummer } = this.props;

    return Api.Fagsaker.aktoer.hent(saksnummer, MKV.Koder.aktoersroller.FULLMEKTIG);
  };

  bekreftOgFortsett = async () => {
    await this.publiserStegdata();
    this.validerSoknadOgGaTilSteg(this.beregnNesteSteg());
  };

  bekreft = () => {
    this.oppdater();
    this.validerSoknadOgGaTilSteg(this.beregnNesteSteg());
  };

  tilbake = () => {
    this.oppdater();
    this.validerSoknadOgGaTilSteg(this.beregnForrigeSteg());
  };

  oppdater = () => {
    const { aktivtStegNummer } = this.state;
    this.props.oppdaterMottatteOpplysninger();
    this.oppdaterAktuelleSteg(aktivtStegNummer);
  };

  harMottatteOpplysningerFeilmeldinger = () => !Utils._isEmpty(this.props.mottatteOpplysningerFeilmeldinger);

  gjemMottatteOpplysningerFeilmeldinger = () => this.setState({ visMottatteOpplysningerFeilmeldinger: false });

  visMottatteOpplysningerFeilmeldinger = () => this.setState({ visMottatteOpplysningerFeilmeldinger: true });

  oppdaterStegData = (stegID, data) => {
    if (!data) return;

    const { felt, type, innhold, iAlleSteg } = data;
    const { stegStores } = this.state;
    if (iAlleSteg) {
      stegStores[type].oppdaterStegDataIAlleSteg(stegID, { felt, innhold });
    } else {
      stegStores[type].oppdaterStegData(stegID, { felt, innhold });
    }
    this.setState(stegStores);

    if (data.oppdaterRedux) {
      this.publiserStegdata();
    }
  };

  slettStegData = (stegID, data = {}) => {
    const { felt, type, iAlleSteg } = data;

    if (Utils._isNil(type) && Utils._isNil(felt)) {
      this.slettSteg(stegID);
    } else if (iAlleSteg) {
      const { stegStores } = this.state;
      stegStores[type].slettFeltIAlleSteg(data);
    } else {
      const { stegStores } = this.state;
      stegStores[type].slettStegData(stegID, data);
      this.setState(stegStores);
    }
    this.publiserStegdata();
  };

  slettSteg = (stegID) => {
    const { stegStores } = this.state;
    Object.keys(stegStores).forEach((type) => stegStores[type].slettSteg(stegID));
    this.setState(stegStores);
  };

  hentPerioderStegState = () => {
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
   * @returns {Promise<*>}
   */
  validerMottatteOpplysninger = async () => {
    if (this.validerOgVisMottatteOpplysningerFeilmeldinger()) {
      return this.props.lagreAllData();
    }
    return Promise.reject(new Error("Feil i mottatteOpplysninger"));
  };

  utpekHandler = (data) => {
    const { saksnummer, utpek } = this.props;

    const utpekBody = {
      mottakerinstitusjoner: data.mottakerinstitusjoner,
      fritekstSed: data.fritekstSed || null,
      fritekstBrev: data.fritekstBrev || null,
    };

    return utpek(saksnummer, utpekBody);
  };

  lagreOgUtpek = async (data) => {
    if (this.validerOgVisMottatteOpplysningerFeilmeldinger()) {
      await this.props.lagreAllData();
      return this.utpekHandler(data);
    }
    return Promise.resolve();
  };

  avvisUtpekingHandler = (data) => {
    const { behandlingID, avvisUtpeking } = this.props;

    return avvisUtpeking(behandlingID, data);
  };

  avvisUtpeking = async (data) => {
    if (this.validerOgVisMottatteOpplysningerFeilmeldinger()) {
      await this.props.lagreAllData();
      return this.avvisUtpekingHandler(data);
    }
    return Promise.resolve();
  };

  lagreOgBestillAnmodningsperioder = async (bestilling) => {
    const { behandlingID, lagreAllData, bestillAnmodningsperioder } = this.props;

    if (this.validerOgVisMottatteOpplysningerFeilmeldinger()) {
      await lagreAllData();
      return bestillAnmodningsperioder(behandlingID, bestilling);
    }
    return Promise.resolve();
  };

  godkjennUnntaksperioder = async (data) => {
    const { behandlingID, tilForsiden } = this.props;

    await Api.Saksflyt.Unntaksperioder.godkjenn(behandlingID, {
      varsleUtland: data.varsleUtland || false,
      fritekst: data.fritekst || null,
      endretPeriode: data.endretPeriode,
      lovvalgsbestemmelse: data.lovvalgsbestemmelse,
    });
    tilForsiden();
  };

  lagreOgGodkjennUnntaksperioder = async (data) => {
    if (this.validerOgVisMottatteOpplysningerFeilmeldinger()) {
      await this.props.lagreAllData();
      return this.godkjennUnntaksperioder(data);
    }
    return Promise.resolve();
  };

  videresendSoknad = async (mottakerinstitusjon, fritekst, ytterligereInformasjonSed, a008Formaal, vedlegg) => {
    const { saksnummer, videresend, lagreAllData } = this.props;

    if (this.validerOgVisMottatteOpplysningerFeilmeldinger()) {
      // Bare inkluder CDM 4.4-felt når de har verdier (bakoverkompatibilitet)
      const body = {
        mottakerinstitusjon,
        fritekst,
        ...(a008Formaal !== null && { ytterligereInformasjonSed, a008Formaal }),
        vedlegg,
      };

      await lagreAllData();
      return videresend(saksnummer, body);
    }
    return Promise.resolve();
  };

  validerOgVisMottatteOpplysningerFeilmeldinger = () => {
    if (this.harMottatteOpplysningerFeilmeldinger()) {
      this.visMottatteOpplysningerFeilmeldinger();
      return false;
    }

    this.gjemMottatteOpplysningerFeilmeldinger();
    return true;
  };

  byggLovvalgsperioderHandler = () => {
    const perioderStegState = this.hentPerioderStegState();
    this.props.oppdaterLovvalgperioder(perioderStegState);
  };

  byggUtpekingsperioderHandler = () => {
    const perioderStegState = this.hentPerioderStegState();
    this.props.oppdaterUtpekingsperioder(perioderStegState);
  };

  byggAnmodningsperioderHandler = () => {
    const perioderStegState = this.hentPerioderStegState();
    this.props.oppdaterAnmodningsPerioder(perioderStegState);
  };

  endreLovvalgsperioderHandler = (fomdato, tomdato) => {
    const { behandlingID, lovvalgsperioder } = this.props;

    const forkortetPeriode = lovvalgsperioder.map((periode) => ({ ...periode, fomDato: fomdato, tomDato: tomdato }));
    Api.Lovvalgsperioder.send(behandlingID, forkortetPeriode);
  };

  endreVedtak = (data) => {
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
   *
   * @param aktivtStegNummer
   * @param endreFokus
   * @returns {Array}
   */
  oppdaterAktuelleSteg = (aktivtStegNummer, endreFokus = false) => {
    const { harTrygdeavgiftperiode } = this.state;
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
      behandlingstype: props.oppsummering.behandlingstype,
      behandlingstema: props.oppsummering.behandlingstema,
      behandlingsstatus: props.oppsummering.behandlingsstatus,
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
        props.oppsummering.behandlingstema.kode === MKV.Koder.behandlinger.behandlingstema.ARBEID_FLERE_LAND,
      erArbeidTjenestepersonEllerFly:
        MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY ===
        props.oppsummering.behandlingstema.kode,
      erArbeidEttLand: props.erArbeidEttLand,
      maritimtarbeid: props.maritimtarbeid,
      hjemmebaser: props.hjemmebaser,
      medfolgendeBarn: props.medfolgendeBarn,
      lagredeVirksomheter: props.lagredeVirksomheter,
      bestemmelser: props.bestemmelser,
      soknadsperiode: props.soknadsperiode,
      harFeilmeldinger: !Utils._isEmpty(props.feilmeldinger) || !Utils._isEmpty(props.kontrollfeil),
      utsendingsvilkår: props.utsendingsvilkår,
      unntaksvilkår: props.unntaksvilkår,
      behandlingOppfriskes: props.behandlingOppfriskes,
      art11_3Aeller13_3A: props.art11_3Aeller13_3A,
      art11_4_1eller13_4_1: props.art11_4_1eller13_4_1,
      art11_4_2eller13_4_2: props.art11_4_2eller13_4_2,
      oppsummering: props.oppsummering,
      harTrygdeavgiftperiode,
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

  debouncedOppdaterAktuelleSteg = Utils._debounce(async (aktivtStegNummer) => {
    this.oppdaterAktuelleSteg(aktivtStegNummer);
  }, 300);

  validerSoknadOgGaTilSteg = (nyttStegNummer) => {
    if (this.validerOgVisMottatteOpplysningerFeilmeldinger()) {
      this.tilSteg(nyttStegNummer);
    }
  };

  /** Gå til et konkret steg i steglisten, angitt av en indeks
   * som begynnner med 0.
   * @param nyttStegNummer Number Steget som det skal byttes til.
   */
  tilSteg = async (nyttStegNummer) => {
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
      oppsummering,
    } = this.props;
    const { aktivtStegNummer, aktuelleSteg } = this.state;
    const erVurderingPeriode = aktuelleSteg[aktivtStegNummer]?.id == STEG.VURDERING_PERIODE;
    const erArbeidTjenestepersonEllerFly =
      oppsummering.behandlingstema.kode == MKV.Koder.behandlinger.behandlingstema.ARBEID_TJENESTEPERSON_ELLER_FLY;

    const flytHarIkkeVurderingPeriode = !erArbeidTjenestepersonEllerFly;

    this.bytterSteg = true;
    this.stegovergangId += 1;
    const minStegovergangId = this.stegovergangId;
    this.debouncedOppdaterAktuelleSteg.cancel?.();
    this.setState({ aktivtStegNummer: nyttStegNummer });

    try {
      if (redigerbart) {
        if (sakstype !== MKV.Koder.sakstyper.FTRL) {
          await oppdaterPerioderState({ ...soknad_skjema, ...artikkel16_anmodning_skjema });

          if (flytHarIkkeVurderingPeriode || erVurderingPeriode) {
            await lagreLovvalgsperioderHandler();
          }

          if (!anmodningErSendtUtland) {
            await lagreAvklartefaktaHandler();
            await lagreVilkarHandler();
            await lagreAnmodningsperioderHandler();
            await lagreUtpekingsperioderHandler();
          }
        }

        if (this.erSisteSteg(nyttStegNummer)) {
          await lagreMottatteOpplysningerHandler();
        }
      }
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error("Feil ved lagring under stegovergang:", error);
    } finally {
      if (this.stegovergangId === minStegovergangId) {
        this.bytterSteg = false;
      }
    }

    if (this.stegovergangId === minStegovergangId) {
      this.oppdaterAktuelleSteg(nyttStegNummer, true);
    }
  };

  /** Beregn neste steg i rekken, men ikke lenger enn
   * maks antall steg (til og med vedtak). Ved forsøk på å gå ytterligere steg
   * enn hva som er mulig skal funksjonen defaulte til det aktive stegnummeret.
   */
  beregnNesteSteg = () => {
    const { aktivtStegNummer } = this.state;
    return aktivtStegNummer + 1;
  };

  beregnForrigeSteg = () => {
    const { aktivtStegNummer } = this.state;
    return aktivtStegNummer - 1;
  };

  erVedtakSteg(stegNummer) {
    return this.state.aktuelleSteg[stegNummer]?.vedtakSteg;
  }

  erInngangsteg(stegNummer) {
    return this.state.aktuelleSteg[stegNummer]?.stegPosisjon === 0;
  }

  kontrollerFerdigbehandling = (data) => {
    return this.props.kontrollerFerdigbehandling(data);
  };

  erSisteSteg(stegNummer) {
    const maksSteg = this.state.aktuelleSteg.length - 1;
    return stegNummer >= maksSteg;
  }

  render() {
    const { visMottatteOpplysningerFeilmeldinger, aktivtStegNummer, aktuelleSteg } = this.state;
    const { redigerbart, oppsummering, arbeidsgiverOgArbeidstakerHarUlikPeriode } = this.props;
    const visFeilmeldinger =
      this.erVedtakSteg(aktivtStegNummer) || aktuelleSteg[aktivtStegNummer]?.id === STEG.ARTIKKEL_16_ANMODNING;
    const inngangStegErAktivt = this.erInngangsteg(aktivtStegNummer);
    const erNyVurdering = oppsummering.behandlingstype?.kode === MKV.Koder.behandlinger.behandlingstyper.NY_VURDERING;
    return (
      <div className="stegvelger panelSeksjon">
        <StegLinje steg={aktuelleSteg} stegKlikk={this.validerSoknadOgGaTilSteg} />
        <StatsborgerskapFeil className="varselmelding" />
        {!redigerbart && <Innsynsmelding />}
        {visFeilmeldinger && <Feilmeldinger />}
        {erNyVurdering && redigerbart && inngangStegErAktivt && <NyVurderingMelding />}
        {arbeidsgiverOgArbeidstakerHarUlikPeriode && <UlikPeriodeMelding />}
        {aktuelleSteg.map((item) => (
          <StegFane id={item.id} key={item.id} faneData={item} />
        ))}
        {visMottatteOpplysningerFeilmeldinger && <MottatteOpplysningerFeilmeldinger />}
      </div>
    );
  }
}

Stegvelger.propTypes = {
  anmodningsperiodesvar: MPT.AnmodningsperioderSvar.isRequired,
  behandlingID: PT.number.isRequired,
  bestemmelser: PT.array,
  arbeidsgivereIPerioden: PT.array,
  arbeidsland: PT.arrayOf(MPT.Kodeverk).isRequired,
  arbeidslandMedYrkesaktivitet: PT.arrayOf(MPT.ArbeidslandMedYrkesaktivitet).isRequired,
  avklartefakta: MPT.AvklartefaktaListe,
  behandlingsPerioder: PT.object.isRequired,
  hentVilkar: PT.func.isRequired,
  hentAvklartefakta: PT.func.isRequired,
  hentLovvalgsperioder: PT.func.isRequired,
  history: PT.object.isRequired,
  endreVedtak: PT.func.isRequired,
  kontrollerFerdigbehandling: PT.func.isRequired,
  lagreMottatteOpplysningerHandler: PT.func.isRequired,
  lovvalgsperioder: PT.array.isRequired,
  oppdaterPerioderState: PT.func.isRequired,
  oppdaterMottatteOpplysninger: PT.func.isRequired,
  oppsummering: MPT.Behandlinger.Oppsummering,
  saksopplysninger: PT.object.isRequired,
  soknad_skjema: PT.object,
  artikkel12_vedtak_skjema: PT.object,
  artikkel16_anmodning_skjema: PT.object,
  artikkel16_motta_svar_skjema: PT.object,
  vurder_utpeking_skjema: PT.object,
  oppdaterVilkaar: PT.func.isRequired,
  oppdaterAvklartefakta: PT.func.isRequired,
  oppdaterLovvalgperioder: PT.func.isRequired,
  valgteVirksomheter: PT.array,
  valgteVirksomheterIkkeNaeringsDrivende: PT.array,
  vilkar: PT.array.isRequired,
  lagreVilkarHandler: PT.func,
  lagreAvklartefaktaHandler: PT.func.isRequired,
  lagreLovvalgsperioderHandler: PT.func,
  lagreAllData: PT.func.isRequired,
  hentMedlemsPerioder: PT.func.isRequired,
  mottatteOpplysningerFeilmeldinger: PT.object.isRequired,
  arbeidsgiverOgArbeidstakerHarUlikPeriode: PT.bool.isRequired,
  hentAnmodningsperioder: PT.func.isRequired,
  anmodningsperioder: PT.array.isRequired,
  anmodningErSendtUtland: PT.bool.isRequired,
  oppdaterAnmodningsPerioder: PT.func.isRequired,
  lagreAnmodningsperioderHandler: PT.func,
  lagreUtpekingsperioderHandler: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  oppdaterAnmodningsperiodesvar: PT.func.isRequired,
  generiskStegRedigerbart: PT.bool.isRequired,
  saksnummer: PT.string,
  erIDirekteTilArtikkel16Flyt: PT.bool.isRequired,
  tilForsiden: PT.func.isRequired,
  utpek: PT.func.isRequired,
  avvisUtpeking: PT.func.isRequired,
  hentUtpekingsperioder: PT.func.isRequired,
  oppdaterUtpekingsperioder: PT.func.isRequired,
  utpekingsperioder: MPT.Utpekingsperioder.isRequired,
  omfattesIAnnetLand: PT.bool.isRequired,
  stegMap: PT.objectOf(PT.arrayOf(PT.oneOfType([PT.string, PT.object]))).isRequired,
  vurderUtpekingFom: PT.string,
  vurderUtpekingTom: PT.string,
  vurderUtpekingValid: PT.bool.isRequired,
  lovvalgsbestemmelse: PT.string,
  tilleggsbestemmelse: PT.string,
  valgteLovvalgsVilkarBestemmelse: PT.string,
  maritimtarbeid: PT.arrayOf(PT.object),
  hjemmebaser: PT.arrayOf(PT.string),
  forsteSteg: PT.string.isRequired,
  erArbeidEttLand: PT.bool.isRequired,
  videresend: PT.func.isRequired,
  bestillAnmodningsperioder: PT.func.isRequired,
  medfolgendeBarn: PT.array.isRequired,
  lagredeVirksomheter: PT.array.isRequired,
  sakstype: PT.string,
  soknadsperiode: MPT.Soknadsperiode.isRequired,
  lagreMottatteOpplysningerOgOppfriskSaksopplysninger: PT.func,
  feilmeldinger: PT.oneOfType([
    PT.arrayOf(
      PT.shape({
        kode: PT.string.isRequired,
        felter: PT.arrayOf(PT.string).isRequired,
      }),
    ),
    PT.string,
  ]),
  kontrollfeil: PT.arrayOf(
    PT.shape({
      kode: PT.string.isRequired,
      felter: PT.arrayOf(PT.string).isRequired,
    }),
  ),
  utsendingsvilkår: PT.object.isRequired,
  unntaksvilkår: PT.object.isRequired,
  art11_3Aeller13_3A: PT.object.isRequired,
  art11_4_1eller13_4_1: PT.object.isRequired,
  art11_4_2eller13_4_2: PT.object.isRequired,
  hentFullmektig: PT.func,
  behandlingOppfriskes: PT.bool,
};

Stegvelger.defaultProps = {
  arbeidsgivereIPerioden: [],
  avklartefakta: [],
  behandlingOppfriskes: false,
  hentFullmektig: () => {},
  bestemmelser: [],
  oppsummering: {},
  valgteVirksomheter: [],
  valgteVirksomheterIkkeNaeringsDrivende: [],
  artikkel12_vedtak_skjema: {},
  artikkel16_anmodning_skjema: {},
  artikkel16_motta_svar_skjema: {},
  vurder_utpeking_skjema: {},
  soknad_skjema: {},
  saksnummer: "",
  vurderUtpekingFom: "",
  vurderUtpekingTom: "",
  lovvalgsbestemmelse: "",
  tilleggsbestemmelse: "",
  valgteLovvalgsVilkarBestemmelse: "",
  maritimtarbeid: [],
  hjemmebaser: [],
  sakstype: "",
  lagreVilkarHandler: () => {},
  lagreLovvalgsperioderHandler: () => {},
  lagreAnmodningsperioderHandler: () => {},
  lagreMottatteOpplysningerOgOppfriskSaksopplysninger: () => {},
  feilmeldinger: [],
  kontrollfeil: [],
};

const mapStateToProps = (state) => ({
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
  soknad_skjema: formSelectors.SoknadFormSelector(state).values,
  artikkel12_vedtak_skjema: formSelectors.VedtakArtikkel12FormValuesSelector(state),
  artikkel16_anmodning_skjema: formSelectors.Artikkel16AnmodningFormSelector(state).values,
  artikkel16_motta_svar_skjema: formSelectors.Artikkel16MottaSvarFormSelector(state).values,
  vurder_utpeking_skjema: formSelectors.VurderUtpekingFormSelector(state).values,
  saksopplysninger: behandlingerSelectors.SaksopplysningerSelector(state),
  valgteVirksomheter: avklartefaktaSelectors.AvklarteVirksomheterSelector(state),
  valgteVirksomheterIkkeNaeringsDrivende:
    avklartefaktaSelectors.AvklarteVirksomheterIkkeNaeringsdrivendeSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  mottatteOpplysningerFeilmeldinger: formSelectors.SoknadErrorsSelector(state),
  arbeidsgiverOgArbeidstakerHarUlikPeriode:
    mottatteOpplysningerSelectors.ArbeidsgiverOgArbeidstakerHarUlikPeriodeSelector(state),
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
  maritimtarbeid: formSelectors.MaritimtArbeidSelector(state),
  hjemmebaser: mottatteOpplysningerSelectors.HjemmebaserSelector(state),
  erArbeidEttLand: behandlingerSelectors.ErArbeidEttLand(state),
  medfolgendeBarn: mottatteOpplysningerSelectors.MedfolgendeBarnSelector(state),
  lagredeVirksomheter: oppsummertfaktaSelectors.VirksomhetIDerSelector(state),
  soknadsperiode: mottatteOpplysningerSelectors.PeriodeSelector(state),
  feilmeldinger: feiletResponsSelectors.FeilmeldingerSelector(state),
  kontrollfeil: kontrollSelectors.KontrollFeilSelector(state),
});

/* eslint no-alert:off */
const mapDispatchToProps = (dispatch) => ({
  hentVilkar: (behandlingID) => dispatch(vilkarOperations.hent(behandlingID)),
  kontrollerFerdigbehandling: (data) => dispatch(kontrollOperations.kontrollerFerdigbehandling(data)),
  videresend: (saksnummer, videresending) => dispatch(videresendingOperations.send(saksnummer, videresending)),
  hentAvklartefakta: (behandlingID) => dispatch(avklartefaktaOperations.hent(behandlingID)),
  hentLovvalgsperioder: (behandlingID) => dispatch(lovvalgsperioderOperations.hent(behandlingID)),
  oppdaterPerioderState: (skjema) => dispatch(behandlingsperioderOperations.oppdaterPerioderState(skjema)),
  oppdaterVilkaar: (vilkaarListe) => dispatch(vilkarOperations.oppdaterState(vilkaarListe)),
  oppdaterAvklartefakta: (avklartefaktaListe) =>
    dispatch(avklartefaktaOperations.oppdaterAvklarteFaktaState(avklartefaktaListe)),
  oppdaterLovvalgperioder: (stegState) => dispatch(lovvalgsperioderOperations.oppdaterLovvalgsperioderState(stegState)),
  hentMedlemsPerioder: (behandlingID) => dispatch(behandlingsperioderOperations.hentMedlemsPerioder(behandlingID)),
  hentAnmodningsperioder: (behandlingID) => dispatch(anmodningsperioderOperations.hent(behandlingID)),
  oppdaterAnmodningsPerioder: (stegState) =>
    dispatch(anmodningsperioderOperations.oppdaterAnmodningsperioderState(stegState)),
  hentUtpekingsperioder: (behandlingID) => dispatch(utpekingsperioderOperations.hent(behandlingID)),
  oppdaterUtpekingsperioder: (stegState) =>
    dispatch(utpekingsperioderOperations.oppdaterUtpekingsperioderState(stegState)),
  oppdaterAnmodningsperiodesvar: (anmodningsperiodesvar) =>
    dispatch(anmodningsperiodesvarOperations.oppdaterAnmodningsperiodesvarState(anmodningsperiodesvar)),
  lagreMottatteOpplysningerHandler: () => dispatch(mottatteOpplysningerOperations.lagre()),
  utpek: (saksnummer, body) => dispatch(utpekOperations.utpek(saksnummer, body)),
  avvisUtpeking: (behandlingID, body) => dispatch(utpekOperations.avvis(behandlingID, body)),
  lagreUtpekingsperioderHandler: () => dispatch(utpekingsperioderOperations.lagre()),
  bestillAnmodningsperioder: (behandlingID, bestilling) =>
    dispatch(anmodningunntakOperations.bestill(behandlingID, bestilling)),
  oppdaterMottatteOpplysninger: () => dispatch(mottatteOpplysningerOperations.oppdaterState()),
  lagreAllData: () => dispatch(datalastingOperations.lagreAllData()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Stegvelger));
