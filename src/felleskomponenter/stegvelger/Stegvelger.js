/* eslint-disable react/no-did-update-set-state */
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PT from "prop-types";
import TrackVisibility from "react-on-screen";

import MKV from "../../melosyskodeverk";
import * as MPT from "../../proptypes";
import * as Api from "../../services/api";
import * as Utils from "../../utils";
import StegLinje from "../stegLinje";
import StegFane from "../stegFane";
import StegMotor from "./stegMotor";

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
import { vedtakOperations } from "../../ducks/vedtak";
import { formSelectors } from "../../ducks/form";
import { behandlingsgrunnlagOperations, behandlingsgrunnlagSelectors } from "../../ducks/behandlingsgrunnlag";
import { utpekOperations } from "../../ducks/utpek";
import { utpekingsperioderOperations, utpekingsperioderSelectors } from "../../ducks/utpekingsperioder";
import { videresendingOperations } from "../../ducks/videresending";
import { oppsummertfaktaSelectors } from "../../ducks/oppsummertfakta";
import { medlemskapsperioderSelectors } from "../../ducks/medlemskapsperioder";
import { feiletResponsSelectors } from "../../ducks/feiletRespons";
import BehandlingsgrunnlagFeilmeldinger from "../behandlingsgrunnlagFeilmeldinger";
import { Feilmeldinger } from "../feilmeldinger";

import { AvklartefaktaStore, EnkelDataStore, StegStoreTyper, VilkaarStore } from "./StegState";
import "./stegvelger.css";
import { kontrollOperations } from "../../ducks/kontroll";

class Stegvelger extends Component {
  state = {
    aktivtStegNummer: 0,
    aktuelleSteg: [],
    stegStores: {
      [StegStoreTyper.Anmodningsperiodersvar]: new EnkelDataStore(),
      [StegStoreTyper.Avklartefakta]: new AvklartefaktaStore(),
      [StegStoreTyper.Vilkar]: new VilkaarStore(),
      [StegStoreTyper.Lovvalgsbestemmelser]: new EnkelDataStore(),
      [StegStoreTyper.Tilleggbestemmelser]: new EnkelDataStore(),
      [StegStoreTyper.UnntakFraBestemmelse]: new EnkelDataStore(),
      [StegStoreTyper.Lovvalgsperiode]: new EnkelDataStore(),
      [StegStoreTyper.Lovvalgsland]: new EnkelDataStore(),
    },
    visBehandlingsgrunnlagFeilmeldinger: false,
  };

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

  componentDidUpdate(prevProps) {
    const { aktivtStegNummer } = this.state;

    if (!Utils._isEqual(prevProps, this.props)) {
      this.debouncedOppdaterAktuelleSteg(aktivtStegNummer);
    }
  }

  componentWillUnmount() {
    this.aktiv = false;
  }

  aktiv = true;

  /** Her vil validering på hver enkelt felt / fane kunne åpne
   * opp for nye tilgjengelige faner etter at saksbehandler
   * har bekreftet valgene.
   */
  bekreftOgFortsett = () => {
    this.publiserStegdata();
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
    this.props.oppdaterBehandlingsgrunnlag();
    this.oppdaterAktuelleSteg(aktivtStegNummer);
  };

  harBehandlingsgrunnlagFeilmeldinger = () => !Utils._isEmpty(this.props.behandlingsgrunnlagFeilmeldinger);

  gjemBehandlingsgrunnlagFeilmeldinger = () => this.setState({ visBehandlingsgrunnlagFeilmeldinger: false });

  visBehandlingsgrunnlagFeilmeldinger = () => this.setState({ visBehandlingsgrunnlagFeilmeldinger: true });

  oppdaterStegData = (stegID, data) => {
    if (!data) return;

    const { felt, type, innhold } = data;
    const { stegStores } = this.state;
    stegStores[type].oppdaterStegData(stegID, { felt, type, innhold });
    this.setState(stegStores);

    if (data.oppdaterRedux) {
      this.publiserStegdata();
    }
  };

  slettStegData = (stegID, data = {}) => {
    const { felt, type } = data;

    if (Utils._isNil(type) && Utils._isNil(felt)) {
      this.slettSteg(stegID);
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

    this.props.oppdaterBehandlingsgrunnlag();
    this.oppdaterAktuelleSteg(aktivtStegNummer);
  };

  fatteVedtakHandler = (data) => {
    const { behandlingID, fattVedtak } = this.props;
    return fattVedtak(behandlingID, data);
  };

  lagreOgFatteVedtak = async (data) => {
    if (this.validerOgVisBehandlingsgrunnlagFeilmeldinger()) {
      await this.props.lagreAllData();
      return this.fatteVedtakHandler(data);
    }
    return Promise.resolve();
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
    if (this.validerOgVisBehandlingsgrunnlagFeilmeldinger()) {
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
    if (this.validerOgVisBehandlingsgrunnlagFeilmeldinger()) {
      await this.props.lagreAllData();
      return this.avvisUtpekingHandler(data);
    }
    return Promise.resolve();
  };

  lagreOgBestillAnmodningsperioder = async (bestilling) => {
    const { behandlingID, lagreAllData, bestillAnmodningsperioder } = this.props;

    if (this.validerOgVisBehandlingsgrunnlagFeilmeldinger()) {
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
    if (this.validerOgVisBehandlingsgrunnlagFeilmeldinger()) {
      await this.props.lagreAllData();
      return this.godkjennUnntaksperioder(data);
    }
    return Promise.resolve();
  };

  videresendSoknad = async (mottakerinstitusjon, fritekst, vedlegg) => {
    const { saksnummer, videresend, lagreAllData } = this.props;

    if (this.validerOgVisBehandlingsgrunnlagFeilmeldinger()) {
      const body = { mottakerinstitusjon, fritekst, vedlegg };

      await lagreAllData();
      return videresend(saksnummer, body);
    }
    return Promise.resolve();
  };

  validerOgVisBehandlingsgrunnlagFeilmeldinger = () => {
    if (this.harBehandlingsgrunnlagFeilmeldinger()) {
      this.visBehandlingsgrunnlagFeilmeldinger();
      return false;
    }

    this.gjemBehandlingsgrunnlagFeilmeldinger();
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
   * @returns {Array}
   */
  oppdaterAktuelleSteg = (aktivtStegNummer) => {
    const tilgjengeligeHandlers = {
      bekreftOgFortsett: this.bekreftOgFortsett,
      lagreOgFatteVedtak: this.lagreOgFatteVedtak,
      lagreOgUtpek: this.lagreOgUtpek,
      oppdaterOgLagreBehandlinger: this.props.oppdaterOgLagreBehandlingerHandler,
      oppdaterStegData: this.oppdaterStegData,
      slettStegData: this.slettStegData,
      lagreVilkarHandler: this.props.lagreVilkarHandler,
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
      lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger: this.props.lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger,
      kontrollerFerdigbehandling: this.kontrollerFerdigbehandling,
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
      bostedsland: props.bostedsland,
      landkoder: props.landkoder,
      behandlingstype: props.oppsummering.behandlingstype,
      behandlingstema: props.oppsummering.behandlingstema,
      behandlingsstatus: props.oppsummering.behandlingsstatus,
      lovvalgsperioder: props.lovvalgsperioder,
      lovvalgsbestemmelse: props.lovvalgsbestemmelse,
      valgteLovvalgsVilkarBestemmelse: props.valgteLovvalgsVilkarBestemmelse,
      utpekingsperioder: props.utpekingsperioder,
      omfattesIAnnetLand: props.omfattesIAnnetLand,
      artikkel12_vedtak_skjema: props.artikkel12_vedtak_skjema,
      artikkel16_anmodning_skjema: props.artikkel16_anmodning_skjema,
      artikkel16_motta_svar_skjema: props.artikkel16_motta_svar_skjema,
      vurder_utpeking_skjema: props.vurder_utpeking_skjema,
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
      erArbeidEttLandOvrig:
        props.oppsummering.behandlingstema.kode === MKV.Koder.behandlinger.behandlingstema.ARBEID_ETT_LAND_ØVRIG,
      erArbeidEttLand: props.erArbeidEttLand,
      maritimtarbeid: props.maritimtarbeid,
      hjemmebaser: props.hjemmebaser,
      harValgtNorskArbeidsgiver: props.harValgtNorskArbeidsgiver,
      medfolgendeBarn: props.medfolgendeBarn,
      behandlingsgrunnlag: props.behandlingsgrunnlag,
      lagredeVirksomheter: props.lagredeVirksomheter,
      bestemmelser: props.bestemmelser,
      medlemskapsperioder: props.medlemskapsperioder,
      vurder_start_valid: props.vurder_start_valid,
      vurder_virksomhet_valid: props.vurder_virksomhet_valid,
      vurder_periode_valid: props.vurder_periode_valid,
      vurder_trygdeavgift_valid: props.vurder_trygdeavgift_valid,
      soknadsperiode: props.soknadsperiode,
      vurder_familie_valid: props.vurder_familie_valid,
      vurder_representant_valid: props.vurder_representant_valid,
      annenBehandlingOppfriskes: props.annenBehandlingOppfriskes,
      harFeilmeldinger: !Utils._isEmpty(props.feilmeldinger),
    };

    const stegMotor = new StegMotor(propsLight, props.stegMap, props.forsteSteg);
    const aktuelleSteg = stegMotor.beregnAlleSteg();
    // Dersom ved en re-kalkulering av aktuelle steg viser seg at det ikke er flere mulige steg
    // må vi normalisere siden aktivtStegNummer vil ligge 1 steg foran det som er mulig. Sjekk derfor
    // på faktisk antall mulige steg.
    const normalisertAktivtSteg = Math.min(aktivtStegNummer, aktuelleSteg.length - 1);

    aktuelleSteg[normalisertAktivtSteg].aktivtSteg = true;

    this.setState({ aktuelleSteg });
    return aktuelleSteg;
  };

  debouncedOppdaterAktuelleSteg = Utils._debounce(async (aktivtStegNummer) => {
    this.oppdaterAktuelleSteg(aktivtStegNummer);
  }, 300);

  validerSoknadOgGaTilSteg = (nyttStegNummer) => {
    if (this.validerOgVisBehandlingsgrunnlagFeilmeldinger()) {
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
      lagreBehandlingsgrunnlagHandler,
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
        await lagreLovvalgsperioderHandler();

        if (!anmodningErSendtUtland) {
          await lagreAvklartefaktaHandler();
          await lagreVilkarHandler();
          await lagreAnmodningsperioderHandler();
          await lagreUtpekingsperioderHandler();
        }
      }

      if (this.erSisteSteg(nyttStegNummer)) {
        await lagreBehandlingsgrunnlagHandler();
      }
    }

    this.oppdaterAktuelleSteg(nyttStegNummer);
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

  erSisteSteg(stegNummer) {
    const maksSteg = this.state.aktuelleSteg.length - 1;
    return stegNummer >= maksSteg;
  }

  erVedtakSteg(stegNummer) {
    return this.state.aktuelleSteg[stegNummer]?.vedtakSteg;
  }

  kontrollerFerdigbehandling = (data) => {
    return this.props.kontrollerFerdigbehandling(data);
  };

  render() {
    const { visBehandlingsgrunnlagFeilmeldinger } = this.state;

    return (
      <TrackVisibility partialVisibility>
        {({ isVisible }) => (
          <div className="stegvelger panelSeksjon">
            <StegLinje steg={this.state.aktuelleSteg} stegKlikk={this.validerSoknadOgGaTilSteg} />
            {this.erVedtakSteg(this.state.aktivtStegNummer) && (
              <Feilmeldinger feilmeldinger={this.props.feilmeldinger} />
            )}
            {this.state.aktuelleSteg.map((item) => (
              <StegFane key={item.id} faneData={item} />
            ))}
            {isVisible && visBehandlingsgrunnlagFeilmeldinger && <BehandlingsgrunnlagFeilmeldinger />}
          </div>
        )}
      </TrackVisibility>
    );
  }
}

Stegvelger.propTypes = {
  anmodningsperiodesvar: MPT.AnmodningsperioderSvar.isRequired,
  annenBehandlingOppfriskes: PT.bool,
  behandlingID: PT.number.isRequired,
  bestemmelser: PT.array,
  arbeidsgivereIPerioden: PT.array,
  arbeidsland: PT.arrayOf(MPT.Kodeverk).isRequired,
  arbeidslandMedYrkesaktivitet: PT.arrayOf(MPT.ArbeidslandMedYrkesaktivitet).isRequired,
  avklartefakta: MPT.AvklartefaktaListe,
  bostedsland: MPT.Kodeverk,
  behandlingsPerioder: PT.object.isRequired,
  hentVilkar: PT.func.isRequired,
  hentAvklartefakta: PT.func.isRequired,
  hentLovvalgsperioder: PT.func.isRequired,
  history: PT.object.isRequired,
  fattVedtak: PT.func.isRequired,
  endreVedtak: PT.func.isRequired,
  kontrollerFerdigbehandling: PT.func.isRequired,
  lagreBehandlingsgrunnlagHandler: PT.func.isRequired,
  lovvalgsperioder: PT.array.isRequired,
  oppdaterPerioderState: PT.func.isRequired,
  oppdaterBehandlingsgrunnlag: PT.func.isRequired,
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
  oppdaterOgLagreBehandlingerHandler: PT.func,
  lagreAllData: PT.func.isRequired,
  hentMedlemsPerioder: PT.func.isRequired,
  behandlingsgrunnlagFeilmeldinger: PT.object.isRequired,
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
  valgteLovvalgsVilkarBestemmelse: PT.string,
  maritimtarbeid: PT.arrayOf(PT.object),
  hjemmebaser: PT.arrayOf(PT.string),
  forsteSteg: PT.string.isRequired,
  erArbeidEttLand: PT.bool.isRequired,
  videresend: PT.func.isRequired,
  bestillAnmodningsperioder: PT.func.isRequired,
  harValgtNorskArbeidsgiver: PT.bool.isRequired,
  medfolgendeBarn: PT.array.isRequired,
  behandlingsgrunnlag: PT.object.isRequired,
  landkoder: PT.arrayOf(MPT.Kodeverk).isRequired,
  lagredeVirksomheter: PT.array.isRequired,
  medlemskapsperioder: PT.object.isRequired,
  sakstype: PT.string,
  vurder_start_valid: PT.bool.isRequired,
  vurder_virksomhet_valid: PT.bool.isRequired,
  vurder_periode_valid: PT.bool.isRequired,
  vurder_trygdeavgift_valid: PT.bool.isRequired,
  soknadsperiode: MPT.Soknadsperiode.isRequired,
  vurder_familie_valid: PT.bool.isRequired,
  vurder_representant_valid: PT.bool.isRequired,
  lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger: PT.func,
  feilmeldinger: PT.oneOfType([
    PT.arrayOf(
      PT.shape({
        kode: PT.string.isRequired,
        felter: PT.arrayOf(PT.string).isRequired,
      })
    ),
    PT.string,
  ]),
};

Stegvelger.defaultProps = {
  annenBehandlingOppfriskes: undefined,
  arbeidsgivereIPerioden: [],
  avklartefakta: [],
  bostedsland: null,
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
  valgteLovvalgsVilkarBestemmelse: "",
  maritimtarbeid: [],
  hjemmebaser: [],
  sakstype: "",
  lagreVilkarHandler: () => {},
  lagreLovvalgsperioderHandler: () => {},
  lagreAnmodningsperioderHandler: () => {},
  oppdaterOgLagreBehandlingerHandler: () => {},
  lagreBehandlingsgrunnlagOgOppfriskSaksopplysninger: () => {},
  feilmeldinger: [],
};

const mapStateToProps = (state) => ({
  anmodningsperioder: anmodningsperioderSelectors.AnmodningsperioderSelector(state),
  anmodningErSendtUtland: anmodningsperioderSelectors.AlleAnmodningsperioderSendtUtlandSelector(state),
  anmodningsperiodesvar: anmodningsperiodesvarSelectors.AnmodningsperiodesvarSelector(state),
  arbeidsgivereIPerioden: avklartefaktaSelectors.VirksomheterIPeriodenSelector(state),
  avklartefakta: avklartefaktaSelectors.AvklartefaktaSelector(state),
  vilkar: vilkarSelectors.VilkarSelector(state),
  lovvalgsperioder: lovvalgsperioderSelectors.LovvalgsperioderSelector(state),
  behandlingsPerioder: behandlingsperioderSelectors.behandlingsPerioderSelector(state),
  arbeidsland: avklartefaktaSelectors.ArbeidslandKTSelector(state),
  arbeidslandMedYrkesaktivitet: avklartefaktaSelectors.ArbeidslandMedYrkesAktivitetSelector(state),
  bostedsland: avklartefaktaSelectors.BostedslandSelector(state),
  oppsummering: behandlingerSelectors.OppsummeringSelector(state),
  soknad_skjema: formSelectors.SoknadenFormSelector(state).values,
  artikkel12_vedtak_skjema: formSelectors.VedtakArtikkel12FormValuesSelector(state),
  artikkel16_anmodning_skjema: formSelectors.Artikkel16AnmodningFormSelector(state).values,
  artikkel16_motta_svar_skjema: formSelectors.Artikkel16MottaSvarFormSelector(state).values,
  vurder_utpeking_skjema: formSelectors.VurderUtpekingFormSelector(state).values,
  vurder_start_valid: formSelectors.VurderStartFormValid(state),
  vurder_virksomhet_valid: formSelectors.VurderVirksomhetFormValid(state),
  vurder_periode_valid: formSelectors.VurderPerioderFormValid(state),
  vurder_trygdeavgift_valid: formSelectors.VurderTrygdeavgiftFormValid(state),
  vurder_familie_valid: formSelectors.VurderFamilieFormValid(state),
  vurder_representant_valid: formSelectors.VurderRepresentantFormValid(state),
  saksopplysninger: behandlingerSelectors.SaksopplysningerSelector(state),
  valgteVirksomheter: avklartefaktaSelectors.AvklarteVirksomheterSelector(state),
  valgteVirksomheterIkkeNaeringsDrivende:
    avklartefaktaSelectors.AvklarteVirksomheterIkkeNaeringsdrivendeSelector(state),
  redigerbart: redigerbartSelectors.RedigerbartSelector(state),
  behandlingsgrunnlagFeilmeldinger: formSelectors.SoknadErrorsSelector(state),
  generiskStegRedigerbart: redigerbartSelectors.GeneriskStegRedigerbartSelector(state),
  saksnummer: fagsakSelectors.SaksnummerSelector(state),
  erIDirekteTilArtikkel16Flyt: flytSelectors.ErIDirekteTilArtikkel16FlytSelector(state),
  utpekingsperioder: utpekingsperioderSelectors.UtpekingsperioderSelector(state),
  omfattesIAnnetLand: avklartefaktaSelectors.OmfattesIAnnetLandSelector(state),
  vurderUtpekingFom: formSelectors.VurderUtpekingFomSelector(state),
  vurderUtpekingTom: formSelectors.VurderUtpekingTomSelector(state),
  vurderUtpekingValid: formSelectors.VurderUtpekingValid(state),
  lovvalgsbestemmelse: lovvalgsperioderSelectors.LovvalgBestemmelseSelector(state),
  valgteLovvalgsVilkarBestemmelse: lovvalgsperioderSelectors.ValgteLovvalgsVilkarBestemmelseSelector(state),
  maritimtarbeid: formSelectors.MaritimtArbeidSelector(state),
  hjemmebaser: behandlingsgrunnlagSelectors.HjemmebaserSelector(state),
  erArbeidEttLand: behandlingerSelectors.ErArbeidEttLand(state),
  harValgtNorskArbeidsgiver: flytSelectors.HarValgtNorskArbeidsgiverSelector(state),
  medfolgendeBarn: behandlingsgrunnlagSelectors.MedfolgendeBarnSelector(state),
  behandlingsgrunnlag: behandlingsgrunnlagSelectors.BehandlingsgrunnlagDataSelector(state),
  lagredeVirksomheter: oppsummertfaktaSelectors.VirksomhetIDerSelector(state),
  medlemskapsperioder: medlemskapsperioderSelectors.MedlemskapsperioderDataSelector(state),
  soknadsperiode: behandlingsgrunnlagSelectors.PeriodeSelector(state),
  feilmeldinger: feiletResponsSelectors.FeilmeldingerSelector(state),
});

/* eslint no-alert:off */
const mapDispatchToProps = (dispatch) => ({
  hentVilkar: (behandlingID) => dispatch(vilkarOperations.hent(behandlingID)),
  fattVedtak: (behandlingID, body) => dispatch(vedtakOperations.fatt(behandlingID, body)),
  endreVedtak: (behandlingID, body) => dispatch(vedtakOperations.endre(behandlingID, body)),
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
  lagreBehandlingsgrunnlagHandler: () => dispatch(behandlingsgrunnlagOperations.lagre()),
  utpek: (saksnummer, body) => dispatch(utpekOperations.utpek(saksnummer, body)),
  avvisUtpeking: (behandlingID, body) => dispatch(utpekOperations.avvis(behandlingID, body)),
  lagreUtpekingsperioderHandler: () => dispatch(utpekingsperioderOperations.lagre()),
  bestillAnmodningsperioder: (behandlingID, bestilling) =>
    dispatch(anmodningunntakOperations.bestill(behandlingID, bestilling)),
  oppdaterBehandlingsgrunnlag: () => dispatch(behandlingsgrunnlagOperations.oppdaterState()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Stegvelger));
